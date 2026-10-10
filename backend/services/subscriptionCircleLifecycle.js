'use strict';

const { getPlan } = require('../config/subscriptionPlans');

function isRunningCircle(circle) {
  // Existing active circles remain operational after the rollout and attrition.
  return ['active', 'full'].includes(circle?.status);
}

function circleStatusForCount(circle, plan = getPlan(circle.subscriptionPlanKey)) {
  if (['paused', 'completed'].includes(circle.status)) return circle.status;
  const count = (circle.students || []).length;
  if (isRunningCircle(circle)) return count >= circle.capacity ? 'full' : 'active';
  return count >= (plan?.minStudents || 1) ? 'ready' : 'forming';
}

function operationalCapacity(circle, plan = getPlan(circle.subscriptionPlanKey)) {
  // Upgrade unstarted economic circles from the former 15-seat limit.
  if (plan?.key === 'community' && !isRunningCircle(circle)) return plan.maxStudents;
  return Number(circle.capacity || plan?.maxStudents || 1);
}

module.exports = { isRunningCircle, circleStatusForCount, operationalCapacity };
