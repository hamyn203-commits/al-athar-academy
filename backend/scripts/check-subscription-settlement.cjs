'use strict';

// This check runs only against the isolated replica set used by Playwright.
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const GroupCircle = require('../models/GroupCircle');
const StudentSubscription = require('../models/StudentSubscription');
const SubscriptionUsage = require('../models/SubscriptionUsage');
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { settleSubscriptionUsageForSession } = require('../services/subscriptionUsage');

async function main() {
  const uri = process.env.MONGODB_URI;
  const database = String(uri || '').split('?')[0].split('/').pop();
  if (!uri || !/(playwright|e2e|test)/i.test(database)) throw new Error('An isolated test database is required');
  await mongoose.connect(uri);
  await SubscriptionUsage.init();
  const teacher = await Teacher.findOne({ status: 'approved', isVerified: true });
  assert.ok(teacher);
  const student = await User.create({ name: 'Settlement regression', email: `settlement.${Date.now()}@example.test`,
    phone: '+201000009001', password: 'Playwright123!', role: 'student', age: 21, gender: 'male' });
  const circle = await GroupCircle.create({ name: 'Concurrent settlement regression', teacher: teacher._id,
    gender: 'men', students: [student._id], capacity: 20, status: 'active', subscriptionPlanKey: 'community' });
  const source = await StudentSubscription.create({ student: student._id, circle: circle._id, planKey: 'community',
    section: 'men_children', preferredTeacher: teacher._id, sessionCount: 4, sessionsUsed: 3, sessionsRemaining: 1,
    pricePerSessionMinor: 1000, totalAmountMinor: 4000, status: 'active', paidAt: new Date() });
  const renewal = await StudentSubscription.create({ student: student._id, circle: circle._id, planKey: 'community',
    section: 'men_children', preferredTeacher: teacher._id, sessionCount: 8, sessionsUsed: 0, sessionsRemaining: 8,
    pricePerSessionMinor: 1000, totalAmountMinor: 8000, status: 'renewal_queued', renewalOf: source._id, paidAt: new Date() });
  const lesson = await Session.create({ teacher: teacher._id, circle: circle._id, type: 'group_circle', status: 'completed',
    scheduledAt: new Date(Date.now() - 120 * 60 * 1000), duration: 60, attendance: [{ student: student._id, status: 'attended' }] });
  await Promise.all([settleSubscriptionUsageForSession(lesson), settleSubscriptionUsageForSession(lesson)]);
  await settleSubscriptionUsageForSession(lesson);
  const finalSource = await StudentSubscription.findById(source._id).lean();
  const finalRenewal = await StudentSubscription.findById(renewal._id).lean();
  assert.equal(finalSource.sessionsRemaining, 0);
  assert.equal(finalSource.sessionsUsed, 4);
  assert.equal(finalSource.status, 'completed');
  assert.equal(finalRenewal.status, 'active');
  assert.equal(finalRenewal.sessionsRemaining, 8);
  assert.equal(finalRenewal.sessionsUsed, 0);
  assert.equal(await SubscriptionUsage.countDocuments({ student: student._id, session: lesson._id }), 1);
  assert.equal((await GroupCircle.findById(circle._id)).status, 'active');
  console.log('Concurrent completion and replay preserved all renewal credits.');
}

main().then(() => mongoose.disconnect()).catch(async error => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
