'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  findChildAccess,
  hasChildPermission,
  filterReportForPermissions,
} = require('../utils/guardianSafeguarding');

const guardian = {
  children: [
    {
      student: 'student-1',
      permissions: {
        viewProgress: false,
        viewGrades: false,
        viewAttendance: true,
        receiveNotifications: true,
        approveEnrollments: false,
      },
    },
  ],
};

test('guardian access is limited to linked children', () => {
  const linked = findChildAccess(guardian, 'student-1');
  assert.ok(linked);
  assert.equal(linked.permissions.viewAttendance, true);
  assert.equal(linked.permissions.viewGrades, false);

  assert.equal(findChildAccess(guardian, 'student-2'), null);
  assert.equal(hasChildPermission(guardian, 'student-2', 'viewAttendance'), false);
});

test('guardian permissions default safely from the stored child policy', () => {
  assert.equal(hasChildPermission(guardian, 'student-1', 'viewAttendance'), true);
  assert.equal(hasChildPermission(guardian, 'student-1', 'viewProgress'), false);
  assert.equal(hasChildPermission(guardian, 'student-1', 'viewGrades'), false);
});

test('stored reports are redacted using current guardian permissions', () => {
  const report = {
    generatedAt: new Date('2026-10-01T00:00:00Z'),
    summary: { ar: 'ملخص', en: 'Summary' },
    data: {
      progress: 75,
      attendance: 88,
      assignments: { completed: 3, pending: 1, overdue: 0 },
      quizzes: { taken: 2, averageScore: 91 },
      achievements: 4,
    },
  };

  const filtered = filterReportForPermissions(report, {
    viewProgress: false,
    viewGrades: false,
    viewAttendance: true,
  });

  assert.equal(filtered.data.attendance, 88);
  assert.equal(filtered.data.progress, undefined);
  assert.equal(filtered.data.assignments, undefined);
  assert.equal(filtered.data.achievements, undefined);
  assert.equal(filtered.data.quizzes, undefined);
  assert.equal(filtered.summary, undefined);
});

test('full guardian report remains visible when all data permissions are enabled', () => {
  const report = {
    summary: { ar: 'ملخص' },
    data: {
      progress: 80,
      attendance: 90,
      assignments: { completed: 2 },
      quizzes: { taken: 1, averageScore: 95 },
      achievements: 3,
    },
  };

  const filtered = filterReportForPermissions(report, {
    viewProgress: true,
    viewGrades: true,
    viewAttendance: true,
  });

  assert.equal(filtered.data.progress, 80);
  assert.equal(filtered.data.attendance, 90);
  assert.equal(filtered.data.quizzes.averageScore, 95);
  assert.equal(filtered.summary.ar, 'ملخص');
});
