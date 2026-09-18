/**
 * Automated Session Reminder Scheduler — Al-Athar Academy
 * Runs periodically (every 5 minutes) to dispatch:
 * 1. 24-hour advance reminders (sessions starting in 23-24 hours)
 * 2. 30-minute direct access reminders (sessions starting in 25-35 minutes)
 */

const mongoose = require('mongoose');
const Session = require('../models/Session');
const User = require('../models/User');
const Guardian = require('../models/Guardian');
const { send24HourReminder, send30MinuteReminder } = require('./whatsapp');

/**
 * Helper to resolve the best recipient phone number for a student
 * Priority: Guardian phone -> User whatsappPhone -> User phone
 */
async function resolveGuardianOrStudentPhone(studentUser) {
  if (!studentUser) return null;

  // 1. Check if student has a linked guardian in User.guardian
  if (studentUser.guardian) {
    const guardianUser = await User.findById(studentUser.guardian).select('phone whatsappPhone');
    if (guardianUser?.whatsappPhone || guardianUser?.phone) {
      return guardianUser.whatsappPhone || guardianUser.phone;
    }
  }

  // 2. Check Guardian collection where children.student matches
  const guardianDoc = await Guardian.findOne({ 'children.student': studentUser._id })
    .populate('user', 'phone whatsappPhone');
  if (guardianDoc?.user) {
    const phone = guardianDoc.user.whatsappPhone || guardianDoc.user.phone || guardianDoc.notificationPreferences?.sms?.phoneNumber;
    if (phone) return phone;
  }

  // 3. Fallback to student's own phone / whatsappPhone
  return studentUser.whatsappPhone || studentUser.phone || null;
}

/**
 * Check and process 24-hour reminders (23 to 24 hours ahead)
 */
async function process24HourReminders() {
  try {
    const now = new Date();
    const minTime = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const sessions = await Session.find({
      status: 'accepted',
      scheduledAt: { $gte: minTime, $lte: maxTime },
      $or: [
        { 'reminders.dayBeforeSent': false },
        { 'reminders.dayBeforeSent': { $exists: false } }
      ]
    }).populate('student', 'name phone whatsappPhone guardian');

    if (sessions.length > 0) {
      console.log(`⏰ [Scheduler] Found ${sessions.length} sessions for 24h reminder`);
    }

    for (const session of sessions) {
      try {
        if (!session.student) continue;

        const recipientPhone = await resolveGuardianOrStudentPhone(session.student);
        if (!recipientPhone) {
          console.warn(`⚠️ [Scheduler] No contact phone found for student ${session.student.name} (${session.student._id})`);
          continue;
        }

        await send24HourReminder(session, session.student, recipientPhone);

        // Mark reminder as sent
        session.reminders = session.reminders || {};
        session.reminders.dayBeforeSent = true;
        session.reminders.dayBeforeSentAt = new Date();
        await session.save();

        console.log(`✅ [Scheduler] 24h reminder sent for session ${session._id} to ${recipientPhone}`);
      } catch (err) {
        console.error(`❌ [Scheduler] Failed to send 24h reminder for session ${session._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ [Scheduler] Error processing 24-hour reminders:', err.message);
  }
}

/**
 * Check and process 30-minute reminders (25 to 35 minutes ahead)
 */
async function process30MinuteReminders() {
  try {
    const now = new Date();
    const minTime = new Date(now.getTime() + 25 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 35 * 60 * 1000);

    const sessions = await Session.find({
      status: 'accepted',
      scheduledAt: { $gte: minTime, $lte: maxTime },
      $or: [
        { 'reminders.halfHourSent': false },
        { 'reminders.halfHourSent': { $exists: false } }
      ]
    }).populate('student', 'name phone whatsappPhone guardian');

    if (sessions.length > 0) {
      console.log(`⏰ [Scheduler] Found ${sessions.length} sessions for 30m reminder`);
    }

    for (const session of sessions) {
      try {
        if (!session.student) continue;

        const recipientPhone = await resolveGuardianOrStudentPhone(session.student);
        if (!recipientPhone) {
          console.warn(`⚠️ [Scheduler] No contact phone found for student ${session.student.name} (${session.student._id})`);
          continue;
        }

        const roomUrl = session.meetingLink || `${(process.env.FRONTEND_URL || 'https://al-athar-academy.vercel.app').replace(/\/$/, '')}/live/${session._id}`;

        await send30MinuteReminder(session, session.student, recipientPhone, roomUrl);

        // Mark reminder as sent
        session.reminders = session.reminders || {};
        session.reminders.halfHourSent = true;
        session.reminders.halfHourSentAt = new Date();
        await session.save();

        console.log(`✅ [Scheduler] 30m reminder sent for session ${session._id} to ${recipientPhone}`);
      } catch (err) {
        console.error(`❌ [Scheduler] Failed to send 30m reminder for session ${session._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ [Scheduler] Error processing 30-minute reminders:', err.message);
  }
}

/**
 * Run scheduler cycle
 */
async function checkUpcomingSessions() {
  // Only run if database is connected
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  await process24HourReminders();
  await process30MinuteReminders();
}

/**
 * Starts the automated scheduler
 * Checks every 5 minutes (300,000 ms)
 */
function startScheduler() {
  console.log('🕒 [Scheduler] Automated session reminder service initialized (interval: 5 minutes)');
  
  // Initial check after 10 seconds of startup
  setTimeout(() => {
    checkUpcomingSessions().catch(err => {
      console.error('❌ [Scheduler] Initial check error:', err.message);
    });
  }, 10000);

  // Periodic interval every 5 minutes
  const intervalId = setInterval(() => {
    checkUpcomingSessions().catch(err => {
      console.error('❌ [Scheduler] Interval check error:', err.message);
    });
  }, 5 * 60 * 1000);

  return intervalId;
}

module.exports = {
  startScheduler,
  checkUpcomingSessions,
  resolveGuardianOrStudentPhone
};
