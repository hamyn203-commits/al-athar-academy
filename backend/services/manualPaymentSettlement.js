'use strict';

const mongoose = require('mongoose');
const Payment = require('../models/Payment');
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
        kind: 'course_enrollment',
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

        const fulfillment = await createEnrollmentForSettledPayment(payment, session);
        result = {
          paymentId: String(payment._id),
          paymentStatus: payment.status,
          enrollmentId: fulfillment.enrollment ? String(fulfillment.enrollment._id) : null,
          enrollmentCreated: fulfillment.created,
          studentId: payment.student ? String(payment.student) : null,
          courseId: payment.course ? String(payment.course) : null,
        };
        return;
      }

      assertPaymentTransition(payment.status, 'failed');
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.failureCode = 'MANUAL_PAYMENT_REJECTED';
      await payment.save({ session });

      result = {
        paymentId: String(payment._id),
        paymentStatus: payment.status,
        enrollmentId: null,
        enrollmentCreated: false,
        studentId: payment.student ? String(payment.student) : null,
        courseId: payment.course ? String(payment.course) : null,
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
