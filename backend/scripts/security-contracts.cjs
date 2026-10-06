  'assignments with submissions must not be deleted before submission cleanup',
  /AssignmentSubmission\.exists\([\s\S]{0,420}ASSIGNMENT_HAS_SUBMISSIONS/
);
requireContains(
  'backend/routes/homework.js',
  'task submissions must not be overwritten while an old file reference exists',
  /task\.submissionFile[\s\S]{0,220}SUBMISSION_EXISTS/
);

// T05: teacher asset cleanup must be traceable, explicit and fail closed.
requireContains(
  'backend/models/Teacher.js',
  'teacher storage owner metadata must stay hidden from normal queries',
  /storageOwner:\s*\{[\s\S]{0,120}select:\s*false/
);
requireContains(
  'backend/routes/teachers.js',
  'new teacher applications must persist the verified upload owner',
  /storageOwner:\s*externalStorage\s*&&\s*uploadOwner/
);
requireContains(
  'backend/routes/teachers.js',
  'teacher asset purge must be admin-only',
  /router\.delete\(['"]\/admin\/:id\/assets['"],\s*protect,\s*authorize\(['"]admin['"]\)/
);
requireContains(
  'backend/routes/teachers.js',
  'teacher asset purge must be limited to rejected or suspended records',
  /\[['"]rejected['"],\s*['"]suspended['"]\]\.includes\(teacher\.status\)/
);
requireContains(
  'backend/routes/teachers.js',
  'teacher asset purge must resolve ownership before deleting provider objects',
  /resolveOwnedTeacherAssets\([\s\S]{0,1200}deleteOwnedObject\(asset\.reference,\s*asset\.purpose,\s*asset\.owner\)/
);
requireContains(
  'backend/services/objectStorage.js',
  'public media proxy references must be unwrapped before provider lifecycle operations',
  /function\s+unwrapPublicProxyReference\s*\(/
);

// T05.3 cleanup: temporary production verification routes must not remain in the application.
requireAbsent(
  'backend/routes/uploads.js',
  'temporary storage lifecycle probe routes must be removed after production verification',
  /storage-e2e/
);
requireAbsent(
  'backend/routes/uploads.js',
  'temporary storage lifecycle secrets must not remain referenced by application routes',
  /STORAGE_E2E_(?:SECRET|QUERY_BRIDGE)/
);

// T06: payment truth and webhook idempotency contracts.
requireContains(
  'backend/models/Payment.js',
  'payment records must store integer minor units',
  /amountMinor:[\s\S]{0,220}Number\.isSafeInteger/
);
requireContains(
  'backend/models/PaymentWebhookEvent.js',
  'provider webhook event ids must be unique per provider',
  /PaymentWebhookEventSchema\.index\([\s\S]{0,180}provider:\s*1[\s\S]{0,80}eventId:\s*1[\s\S]{0,80}unique:\s*true/
);
requireContains(
  'backend/routes/donations.js',
  'public contribution totals must include confirmed donations only',
  /\$match:\s*\{\s*status:\s*['"]confirmed['"]\s*\}/
);
requireAbsent(
  'backend/routes/donations.js',
  'public contribution totals must not mix pledged donations with confirmed funds',
  /status:\s*\{\s*\$in:\s*\[['"]pledged['"],\s*['"]confirmed['"]\]/
);
requireContains(
  'backend/routes/courses.js',
  'paid course enrollment must remain blocked until the real payment flow settles',
  /PAYMENT_REQUIRED/
);
requireContains(
  'backend/routes/lms.js',
  'paid LMS enrollment must remain blocked until the real payment flow settles',
  /PAYMENT_REQUIRED/
);

if (failures.length) {
  console.error('Security contracts failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Security contracts passed.');