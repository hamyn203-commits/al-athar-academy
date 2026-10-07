'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

const oid = () => new mongoose.Types.ObjectId();

function querySession(value) {
  return {
    session() {
      return Promise.resolve(value);
    },
  };
}

test('manual payment approval creates exactly one enrollment and repeated review fails closed', async () => {
  const studentId = oid();
  const courseId = oid();
  const paymentId = oid();
  const adminId = oid();
  const enrollmentId = oid();

  const payment = {
    _id: paymentId,
    provider: 'manual',
    kind: 'course_enrollment',
    student: studentId,
    course: courseId,
    amountMinor: 12500,
    currency: 'EGP',
    status: 'pending',
    manual: {},
    async save() {
      return this;
    },
  };

  let enrollment = null;
  let enrollmentCreateCount = 0;
  let progressUpsertCount = 0;
  let courseIncrementCount = 0;

  const originalStartSession = mongoose.startSession;
  const originalPaymentFindOne = Payment.findOne;
  const originalEnrollmentFindOne = Enrollment.findOne;
  const originalEnrollmentCreate = Enrollment.create;
  const originalProgressUpdateOne = Progress.updateOne;
  const originalCourseUpdateOne = Course.updateOne;

  mongoose.startSession = async () => ({
    async withTransaction(fn) {
      return fn();
    },
    async endSession() {},
  });

  Payment.findOne = () => querySession(payment);
  Enrollment.findOne = () => querySession(enrollment);
  Enrollment.create = async (docs) => {
    enrollmentCreateCount += 1;
    enrollment = {
      _id: enrollmentId,
      ...docs[0],
    };
    return [enrollment];
  };
  Progress.updateOne = async () => {
    progressUpsertCount += 1;
    return { acknowledged: true };
  };
  Course.updateOne = async () => {
    courseIncrementCount += 1;
    return { acknowledged: true };
  };

  delete require.cache[require.resolve('../services/paymentSettlement')];
  delete require.cache[require.resolve('../services/manualPaymentSettlement')];
  const { processManualPaymentReview } = require('../services/manualPaymentSettlement');

  try {
    const approved = await processManualPaymentReview({
      paymentId,
      adminId,
      action: 'approve',
      note: 'Funds verified in bank account',
    });

    assert.equal(approved.paymentStatus, 'succeeded');
    assert.equal(approved.enrollmentCreated, true);
    assert.equal(approved.enrollmentId, String(enrollmentId));
    assert.equal(payment.status, 'succeeded');
    assert.equal(payment.manual.reviewAction, 'approve');
    assert.equal(String(payment.manual.reviewedBy), String(adminId));
    assert.equal(enrollmentCreateCount, 1);
    assert.equal(progressUpsertCount, 1);
    assert.equal(courseIncrementCount, 1);

    await assert.rejects(
      () => processManualPaymentReview({
        paymentId,
        adminId,
        action: 'approve',
        note: 'Second approval must fail',
      }),
      (error) => {
        assert.equal(error.code, 'PAYMENT_ALREADY_REVIEWED');
        return true;
      }
    );

    assert.equal(enrollmentCreateCount, 1);
    assert.equal(progressUpsertCount, 1);
    assert.equal(courseIncrementCount, 1);
  } finally {
    mongoose.startSession = originalStartSession;
    Payment.findOne = originalPaymentFindOne;
    Enrollment.findOne = originalEnrollmentFindOne;
    Enrollment.create = originalEnrollmentCreate;
    Progress.updateOne = originalProgressUpdateOne;
    Course.updateOne = originalCourseUpdateOne;
    delete require.cache[require.resolve('../services/paymentSettlement')];
    delete require.cache[require.resolve('../services/manualPaymentSettlement')];
  }
});

test('manual payment rejection grants no enrollment', async () => {
  const studentId = oid();
  const courseId = oid();
  const paymentId = oid();
  const adminId = oid();

  const payment = {
    _id: paymentId,
    provider: 'manual',
    kind: 'course_enrollment',
    student: studentId,
    course: courseId,
    amountMinor: 9900,
    currency: 'EGP',
    status: 'pending',
    manual: {},
    async save() {
      return this;
    },
  };

  let enrollmentCreateCount = 0;

  const originalStartSession = mongoose.startSession;
  const originalPaymentFindOne = Payment.findOne;
  const originalEnrollmentCreate = Enrollment.create;

  mongoose.startSession = async () => ({
    async withTransaction(fn) {
      return fn();
    },
    async endSession() {},
  });

  Payment.findOne = () => querySession(payment);
  Enrollment.create = async () => {
    enrollmentCreateCount += 1;
    return [];
  };

  delete require.cache[require.resolve('../services/paymentSettlement')];
  delete require.cache[require.resolve('../services/manualPaymentSettlement')];
  const { processManualPaymentReview } = require('../services/manualPaymentSettlement');

  try {
    const rejected = await processManualPaymentReview({
      paymentId,
      adminId,
      action: 'reject',
      note: 'Funds not received',
    });

    assert.equal(rejected.paymentStatus, 'failed');
    assert.equal(rejected.enrollmentCreated, false);
    assert.equal(rejected.enrollmentId, null);
    assert.equal(payment.status, 'failed');
    assert.equal(payment.failureCode, 'MANUAL_PAYMENT_REJECTED');
    assert.equal(payment.manual.reviewAction, 'reject');
    assert.equal(enrollmentCreateCount, 0);
  } finally {
    mongoose.startSession = originalStartSession;
    Payment.findOne = originalPaymentFindOne;
    Enrollment.create = originalEnrollmentCreate;
    delete require.cache[require.resolve('../services/paymentSettlement')];
    delete require.cache[require.resolve('../services/manualPaymentSettlement')];
  }
});
