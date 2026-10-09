'use strict';

const mongoose = require('mongoose');
const StudentSubscription = require('../models/StudentSubscription');
const GroupCircle = require('../models/GroupCircle');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { getPlan } = require('../config/subscriptionPlans');

const DAYS = new Set(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function normalizeSchedule(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 7).map((item) => ({
    day: String(item?.day || '').trim(),
    startTime: String(item?.startTime || '').trim(),
    endTime: String(item?.endTime || '').trim(),
  })).filter((item) => DAYS.has(item.day) && TIME_RE.test(item.startTime) && TIME_RE.test(item.endTime));
}

function circleGenderForStudent(student, section) {
  const age = Number(student?.age || 0);
  const adult = age >= 18;

  if (section === 'ladies') return adult ? 'women' : 'girls';
  if (student?.gender === 'female') return adult ? 'women' : 'girls';
  return adult ? 'men' : 'boys';
}

function ageGroupForStudent(student) {
  const age = Number(student?.age || 0);
  if (age >= 18) return 'adults';
  if (age >= 13) return 'teens_13_17';
  if (age >= 8) return 'kids_8_12';
  return 'kids_4_7';
}

async function placeSubscription({
  subscriptionId,
  existingCircleId,
  circleName,
  schedule,
  timezone = 'Africa/Cairo',
}) {
  const dbSession = await mongoose.startSession();
  let result;

  try {
    await dbSession.withTransaction(async () => {
      const subscription = await StudentSubscription.findById(subscriptionId).session(dbSession);
      if (!subscription) {
        const error = new Error('Subscription not found');
        error.code = 'SUBSCRIPTION_NOT_FOUND';
        throw error;
      }
      if (subscription.status !== 'awaiting_placement') {
        const error = new Error('Subscription is not ready for placement');
        error.code = 'SUBSCRIPTION_NOT_READY_FOR_PLACEMENT';
        throw error;
      }
      if (!subscription.preferredTeacher) {
        const error = new Error('Preferred teacher is missing');
        error.code = 'PREFERRED_TEACHER_REQUIRED';
        throw error;
      }

      const plan = getPlan(subscription.planKey);
      if (!plan) {
        const error = new Error('Subscription plan is invalid');
        error.code = 'SUBSCRIPTION_PLAN_INVALID';
        throw error;
      }

      const [student, teacher] = await Promise.all([
        User.findById(subscription.student)
          .select('name gender age preferredTrack currentLevel circle')
          .session(dbSession),
        Teacher.findOne({
          _id: subscription.preferredTeacher,
          status: 'approved',
          isVerified: true,
        }).session(dbSession),
      ]);

      if (!student) {
        const error = new Error('Student not found');
        error.code = 'STUDENT_NOT_FOUND';
        throw error;
      }
      if (!teacher) {
        const error = new Error('Preferred teacher is not available');
        error.code = 'PREFERRED_TEACHER_UNAVAILABLE';
        throw error;
      }

      let circle;
      if (existingCircleId) {
        circle = await GroupCircle.findOne({
          _id: existingCircleId,
          teacher: teacher._id,
          subscriptionPlanKey: plan.key,
          status: { $nin: ['completed', 'paused'] },
        }).session(dbSession);

        if (!circle) {
          const error = new Error('Selected circle is not compatible with this subscription');
          error.code = 'CIRCLE_NOT_COMPATIBLE';
          throw error;
        }
      } else {
        const normalizedSchedule = normalizeSchedule(schedule);
        const created = await GroupCircle.create([{
          name: String(circleName || '').trim().slice(0, 120)
            || `${plan.name.ar} — ${student.name}`,
          track: student.preferredTrack || 'memorization',
          level: student.currentLevel || 'beginner',
          gender: circleGenderForStudent(student, subscription.section),
          targetAgeGroup: ageGroupForStudent(student),
          capacity: plan.maxStudents,
          teacher: teacher._id,
          students: [],
          schedule: normalizedSchedule,
          timezone: String(timezone || 'Africa/Cairo').trim().slice(0, 80) || 'Africa/Cairo',
          status: 'forming',
          pricePerSession: {
            egp: plan.pricePerSessionMinor / 100,
            usd: 1,
          },
          subscriptionPlanKey: plan.key,
        }], { session: dbSession });
        circle = created[0];
      }

      const alreadyInCircle = (circle.students || []).some(
        (studentId) => String(studentId) === String(student._id)
      );

      if (!alreadyInCircle) {
        if ((circle.students || []).length >= circle.capacity) {
          const error = new Error('Circle is already full');
          error.code = 'CIRCLE_FULL';
          throw error;
        }
        circle.students.push(student._id);
      }

      if (circle.students.length >= circle.capacity) {
        circle.status = 'full';
      } else if (circle.students.length >= plan.minStudents) {
        circle.status = 'active';
      } else {
        circle.status = 'forming';
      }

      await circle.save({ session: dbSession });

      student.circle = circle._id;
      await student.save({ session: dbSession });

      const now = new Date();
      subscription.circle = circle._id;
      subscription.placedAt = now;
      subscription.status = ['active', 'full'].includes(circle.status) ? 'active' : 'placed';
      if (subscription.status === 'active' && !subscription.startedAt) {
        subscription.startedAt = now;
      }
      await subscription.save({ session: dbSession });

      if (['active', 'full'].includes(circle.status)) {
        await StudentSubscription.updateMany(
          {
            circle: circle._id,
            status: 'placed',
          },
          {
            $set: {
              status: 'active',
              startedAt: now,
            },
          },
          { session: dbSession }
        );
      }

      result = {
        subscriptionId: String(subscription._id),
        subscriptionStatus: subscription.status,
        circleId: String(circle._id),
        circleStatus: circle.status,
        studentId: String(student._id),
        teacherId: String(teacher._id),
        studentCount: circle.students.length,
        capacity: circle.capacity,
        minimumToStart: plan.minStudents,
      };
    });

    return result;
  } finally {
    await dbSession.endSession();
  }
}

module.exports = {
  normalizeSchedule,
  placeSubscription,
};
