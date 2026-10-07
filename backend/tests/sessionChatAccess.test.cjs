'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const { canAccessSession } = require('../utils/sessionChatAccess');

const oid = () => new mongoose.Types.ObjectId().toString();

test('session chat membership accepts populated student and teacher references', async () => {
  const studentId = oid();
  const teacherUserId = oid();
  const teacherId = oid();
  const strangerId = oid();

  const session = {
    student: { _id: studentId, name: 'Student' },
    teacher: { _id: teacherId, user: { _id: teacherUserId } },
  };

  const originalFindOne = Teacher.findOne;
  Teacher.findOne = ({ user }) => ({
    select() {
      return Promise.resolve(
        String(user) === teacherUserId
          ? { _id: teacherId }
          : null
      );
    },
  });

  try {
    assert.equal(await canAccessSession(session, studentId, 'student'), true);
    assert.equal(await canAccessSession(session, teacherUserId, 'teacher'), true);
    assert.equal(await canAccessSession(session, strangerId, 'student'), false);
    assert.equal(await canAccessSession(session, strangerId, 'teacher'), false);
    assert.equal(await canAccessSession(session, strangerId, 'admin'), true);
  } finally {
    Teacher.findOne = originalFindOne;
  }
});
