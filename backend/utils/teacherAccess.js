'use strict';

const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const { findMockTeacherByUserId } = require('../mockStore');
const { isMockMode } = require('../config/runtime');

function decisionForTeacher(teacher) {
  if (!teacher) {
    return {
      allowed: false,
      status: 'pending',
      code: 'TEACHER_APPROVAL_PENDING',
      error: 'Teacher application is pending administration approval',
    };
  }

  if (teacher.status === 'approved' && teacher.isVerified === true) {
    return {
      allowed: true,
      status: 'approved',
      code: null,
      error: null,
    };
  }

  const map = {
    pending: {
      code: 'TEACHER_APPROVAL_PENDING',
      error: 'Teacher application is pending administration approval',
    },
    'under-review': {
      code: 'TEACHER_APPLICATION_UNDER_REVIEW',
      error: 'Teacher application is still under administration review',
    },
    rejected: {
      code: 'TEACHER_APPLICATION_REJECTED',
      error: 'Teacher application was not approved',
    },
    suspended: {
      code: 'TEACHER_ACCOUNT_SUSPENDED',
      error: 'Teacher account is suspended',
    },
    approved: {
      code: 'TEACHER_APPROVAL_PENDING',
      error: 'Teacher approval is not complete yet',
    },
  };

  const selected = map[teacher.status] || map.pending;
  return {
    allowed: false,
    status: teacher.status || 'pending',
    code: selected.code,
    error: selected.error,
  };
}

async function getTeacherAccessDecision(userId) {
  if (!userId) return decisionForTeacher(null);

  if (isMockMode && mongoose.connection.readyState !== 1) {
    return decisionForTeacher(findMockTeacherByUserId(userId));
  }

  const teacher = await Teacher.findOne({ user: userId })
    .select('status isVerified')
    .lean();

  return decisionForTeacher(teacher);
}

module.exports = {
  decisionForTeacher,
  getTeacherAccessDecision,
};
