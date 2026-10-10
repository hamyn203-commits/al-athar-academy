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
  })).filter((item) => DAYS.has(item.day) && TIME_RE.test(item.startTime) && TIME_RE.test(item.endTime) && item.endTime > item.startTime);
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
      const expectedGender = circleGenderForStudent(student, subscription.section);
      const expectedAgeGroup = ageGroupForStudent(student);
      const expectedTrack = student.preferredTrack || 'memorization';
      const expectedLevel = student.currentLevel || 'beginner';

      if (existingCircleId) {
        circle = await GroupCircle.findOne({
          _id: existingCircleId,
          teacher: teacher._id,
          subscriptionPlanKey: plan.key,
          gender: expectedGender,
          targetAgeGroup: expectedAgeGroup,
          track: expectedTrack,
          level: expectedLevel,
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
          track: expectedTrack,
          level: expectedLevel,
          gender: expectedGender,
          targetAgeGroup: expectedAgeGroup,
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
        if ((circle.students || []).length >= plan.maxStudents) {
          const error = new Error('Circle is already full');
          error.code = 'CIRCLE_FULL';
          throw error;
        }
        circle.students.push(student._id);
      }

      circle.capacity = plan.maxStudents;
      if (['active', 'full'].includes(circle.status)) {
        circle.status = circle.students.length >= circle.capacity ? 'full' : 'active';
      } else {
        circle.status = circle.students.length >= plan.minStudents ? 'ready' : 'forming';
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

      let activatedStudentIds = [];
      if (['active', 'full'].includes(circle.status)) {
        const waitingSubscriptions = await StudentSubscription.find({
          circle: circle._id,
          status: 'placed',
        })
          .select('student')
          .session(dbSession)
          .lean();

        activatedStudentIds = [
          String(subscription.student),
          ...waitingSubscriptions.map((item) => String(item.student)),
        ];

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
        teacherUserId: teacher.user ? String(teacher.user) : null,
        circleName: circle.name,
        activatedStudentIds,
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

async function startSubscriptionCircle({ circleId, schedule, timezone = 'Africa/Cairo' }) {
  const normalized = normalizeSchedule(schedule);
  if (!Array.isArray(schedule) || !schedule.length || normalized.length !== schedule.length) {
    throw Object.assign(new Error('حدد جدولًا صحيحًا قبل بدء الحلقة'), { code: 'CIRCLE_SCHEDULE_REQUIRED' });
  }
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); }
  catch { throw Object.assign(new Error('المنطقة الزمنية غير صحيحة'), { code: 'CIRCLE_TIMEZONE_INVALID' }); }
  const dbSession = await mongoose.startSession();
  let result;
  try {
    await dbSession.withTransaction(async () => {
      const circle = await GroupCircle.findById(circleId).session(dbSession);
      const plan = circle && getPlan(circle.subscriptionPlanKey);
      if (!plan) throw Object.assign(new Error('حلقة الاشتراك غير موجودة'), { code: 'CIRCLE_NOT_FOUND' });
      if (['active', 'full'].includes(circle.status)) {
        result = { circleId: String(circle._id), alreadyStarted: true, studentIds: [] };
        return;
      }
      if (!['forming', 'ready'].includes(circle.status) || circle.students.length < plan.minStudents || circle.students.length > plan.maxStudents) {
        throw Object.assign(new Error('الحلقة لم تصل إلى العدد المطلوب للبدء'), { code: 'CIRCLE_NOT_READY' });
      }
      for (const row of normalized) {
        const minutes = Number(row.endTime.slice(0, 2)) * 60 + Number(row.endTime.slice(3)) - Number(row.startTime.slice(0, 2)) * 60 - Number(row.startTime.slice(3));
        if (minutes < (plan.durationMinMinutes || 1) || minutes > plan.durationMaxMinutes) throw Object.assign(new Error('مدة الموعد لا توافق مدة الخطة'), { code: 'CIRCLE_DURATION_INVALID' });
      }
      const teacher = await Teacher.findOne({ _id: circle.teacher, status: 'approved', isVerified: true }).session(dbSession);
      if (!teacher) throw Object.assign(new Error('المعلم غير متاح'), { code: 'PREFERRED_TEACHER_UNAVAILABLE' });
      const waiting = await StudentSubscription.find({ circle: circle._id, student: { $in: circle.students }, status: 'placed' }).session(dbSession);
      if (new Set(waiting.map(item => String(item.student))).size !== circle.students.length) {
        throw Object.assign(new Error('راجع الاشتراكات المدفوعة لكل طلاب الحلقة'), { code: 'CIRCLE_SUBSCRIPTIONS_MISSING' });
      }
      circle.schedule = normalized;
      circle.timezone = timezone;
      circle.capacity = plan.maxStudents;
      circle.status = circle.students.length >= circle.capacity ? 'full' : 'active';
      await circle.save({ session: dbSession });
      await StudentSubscription.updateMany({ _id: { $in: waiting.map(item => item._id) }, status: 'placed' }, {
        $set: { status: 'active', startedAt: new Date() },
      }, { session: dbSession });
      result = { circleId: String(circle._id), circleName: circle.name, studentIds: circle.students.map(String), teacherUserId: teacher.user ? String(teacher.user) : null };
    });
    return result;
  } finally { await dbSession.endSession(); }
}

module.exports = {
  normalizeSchedule,
  circleGenderForStudent,
  ageGroupForStudent,
  placeSubscription,
  startSubscriptionCircle,
};

