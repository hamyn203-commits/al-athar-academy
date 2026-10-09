'use strict';

const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const StudentSubscription = require('../models/StudentSubscription');
const { assertPaymentTransition } = require('../utils/paymentIntegrity');
const { createEnrollmentForSettledPayment } = require('./paymentSettlement');

async function processManualPaymentReview({
  paymentId,
  adminId,
  action,
  note = '',
}) {
  const normalizedAction = String(action || '').trim().toLowerCase();
  if (!['approve', 'reject'].includes(normalizedAction)) {
    const error = new Error('Invalid manual payment review action');
    error.code = 'INVALID_REVIEW_ACTION';
    throw error;
  }

  const session = await mongoose.startSession();
  let result = null;

  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({
        _id: paymentId,
        provider: 'manual',
        kind: { $in: ['course_enrollment', 'subscription'] },
      }).session(session);

      if (!payment) {
        const error = new Error('Payment not found');
        error.code = 'PAYMENT_NOT_FOUND';
        throw error;
      }

      if (payment.status !== 'pending') {
        const error = new Error('Payment has already been reviewed');
        error.code = 'PAYMENT_ALREADY_REVIEWED';
        throw error;
      }

      payment.manual.reviewedAt = new Date();
      payment.manual.reviewedBy = adminId;
      payment.manual.reviewAction = normalizedAction;
      payment.manual.reviewNote = String(note || '').trim().slice(0, 500);

      if (normalizedAction === 'approve') {
        assertPaymentTransition(payment.status, 'succeeded');
        payment.status = 'succeeded';
        payment.settledAt = new Date();
        payment.providerTransactionId = `manual-review:${payment._id}`;
        payment.failureCode = undefined;
        await payment.save({ session });

        if (payment.kind === 'subscription') {
          const subscription = await StudentSubscription.findOne({
            _id: payment.subscription,
            student: payment.student,
          }).session(session);

          if (!subscription) {
            const error = new Error('Subscription not found for payment');
            error.code = 'SUBSCRIPTION_NOT_FOUND';
            throw error;
          }

          const paidAt = new Date();
          let renewalQueued = false;
          let renewalCircleId = null;

          if (subscription.renewalOf) {
            const source = await StudentSubscription.findById(subscription.renewalOf).session(session);

            if (
              source
              && source.status === 'active'
              && Number(source.sessionsRemaining || 0) > 0
              && (subscription.preferredCircle || source.circle)
            ) {
              subscription.status = 'renewal_queued';
              subscription.circle = subscription.preferredCircle || source.circle;
              subscription.renewalQueuedAt = paidAt;
              renewalQueued = true;
            } else {
              subscription.status = 'awaiting_placement';
              renewalCircleId = subscription.preferredCircle
                ? String(subscription.preferredCircle)
                : (source?.circle ? String(source.circle) : null);
            }
          } else {
            subscription.status = 'awaiting_placement';
          }

          subscription.payment = payment._id;
          subscription.paidAt = paidAt;
          await subscription.save({ session });

          result = {
            paymentId: String(payment._id),
            paymentStatus: payment.status,
            enrollmentId: null,
            enrollmentCreated: false,
            studentId: payment.student ? String(payment.student) : null,
            courseId: null,
            subscriptionId: String(subscription._id),
            subscriptionStatus: subscription.status,
            awaitingPlacement: subscription.status === 'awaiting_placement',
            renewalQueued,
            renewalCircleId,
          };
          return;
        }

        const fulfillment = await createEnrollmentForSettledPayment(payment, session);
        result = {
          paymentId: String(payment._id),
          paymentStatus: payment.status,
          enrollmentId: fulfillment.enrollment ? String(fulfillment.enrollment._id) : null,
          enrollmentCreated: fulfillment.created,
          studentId: payment.student ? String(payment.student) : null,
          courseId: payment.course ? String(payment.course) : null,
          subscriptionId: null,
          awaitingPlacement: false,
        };
        return;
      }

      assertPaymentTransition(payment.status, 'failed');
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.failureCode = 'MANUAL_PAYMENT_REJECTED';
      await payment.save({ session });

      if (payment.kind === 'subscription' && payment.subscription) {
        await StudentSubscription.updateOne(
          { _id: payment.subscription, student: payment.student },
          {
            $set: { status: 'pending_payment' },
            $unset: { payment: 1, paidAt: 1 },
          },
          { session }
        );
      }

      result = {
        paymentId: String(payment._id),
        paymentStatus: payment.status,
        enrollmentId: null,
        enrollmentCreated: false,
        studentId: payment.student ? String(payment.student) : null,
        courseId: payment.course ? String(payment.course) : null,
        subscriptionId: payment.subscription ? String(payment.subscription) : null,
        awaitingPlacement: false,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  processManualPaymentReview,
};
