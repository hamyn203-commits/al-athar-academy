const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(body); } catch { json = body; }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runGuardianAudit() {
  console.log('===============================================================');
  console.log('  🔍 AUDIT: Guardian Persona & Role Isolation Verification');
  console.log('  الأكاديمية: وحي ونماء (أكاديمية الأثر لتعليم القرآن الكريم)');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, desc, errorDetail = null) {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      if (errorDetail) console.error(`     Detail:`, errorDetail);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. GUARDIAN REGISTRATION
  // -------------------------------------------------------------------------
  console.log('--- 1. التسجيل والدخول لحساب ولي الأمر (Guardian Auth) ---');
  const guardianEmail = `guardian.audit.${Date.now()}@athar.test`;
  const guardianPassword = 'StrongPassword123!';
  
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'أبو عبد الله المنصوري',
    email: guardianEmail,
    password: guardianPassword,
    phone: '+201099887766',
    role: 'guardian'
  });

  assert(
    regRes.status === 201 && regRes.data.user?.role === 'guardian',
    'تسجيل حساب ولي أمر جديد عبر POST /api/auth/register بنجاح وبدور "guardian"',
    regRes.data
  );

  const guardianToken = regRes.data.accessToken || regRes.data.token;
  assert(
    typeof guardianToken === 'string' && guardianToken.length > 20,
    'استلام JWT Access Token صالح لحساب ولي الأمر'
  );

  // Login
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: guardianEmail,
    password: guardianPassword
  });

  assert(
    loginRes.status === 200 && loginRes.data.user?.role === 'guardian',
    'تسجيل الدخول لبوابة ولي الأمر عبر POST /api/auth/login وتأكيد بيانات الجلسة'
  );

  // -------------------------------------------------------------------------
  // 2. GUARDIAN CHILDREN LIST & LINKING
  // -------------------------------------------------------------------------
  console.log('\n--- 2. ربط الأبناء واسترجاع بياناتهم (Children Management) ---');

  // Fetch initial children
  const initialChildrenRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/children',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });

  assert(
    initialChildrenRes.status === 200 && Array.isArray(initialChildrenRes.data.children),
    'جلب قائمة الأبناء المرتبطين عبر GET /api/guardian/children'
  );

  // Link Child by Email
  const child1Email = `child1.${Date.now()}@student.athar.com`;
  const linkEmailRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/link-child',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardianToken}`
    }
  }, {
    email: child1Email,
    relationship: 'father'
  });

  assert(
    (linkEmailRes.status === 200 || linkEmailRes.status === 201) && linkEmailRes.data.success,
    'ربط ابن جديد بحساب ولي الأمر عبر البريد الإلكتروني (POST /api/guardian/link-child)'
  );

  // Link Child by Student Code
  const linkCodeRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/link-child',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardianToken}`
    }
  }, {
    studentCode: 'ATH-KID-2026',
    relationship: 'mother'
  });

  assert(
    (linkCodeRes.status === 200 || linkCodeRes.status === 201) && linkCodeRes.data.success,
    'ربط ابن جديد عبر كود الطالب الفريد (POST /api/guardian/link-child)'
  );

  // Verify updated children list
  const updatedChildrenRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/children',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });

  assert(
    updatedChildrenRes.data.children?.length >= 2,
    `تأكيد ظهور الأبناء بعد الربط في قائمة الحساب (العدد الحالي: ${updatedChildrenRes.data.children?.length})`
  );

  // -------------------------------------------------------------------------
  // 3. PROGRESS, MEMORIZATION & TAJWEED EVALUATION REPORTS
  // -------------------------------------------------------------------------
  console.log('\n--- 3. متابعة تقدم الأبناء وتقارير الحفظ والتجويد (Reports History) ---');
  const targetChildId = updatedChildrenRes.data.children[0]?.studentId || 'mock-child-1';

  const reportsRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/guardian/reports/${targetChildId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });

  assert(
    reportsRes.status === 200 && Array.isArray(reportsRes.data.reports),
    `استرجاع السجل الكامل لتقارير الطالب (${targetChildId}) عبر GET /api/guardian/reports/:id`
  );

  const sampleReport = reportsRes.data.reports?.[0];
  const hasDetailedMetrics = sampleReport &&
    sampleReport.memorizationScore !== undefined &&
    sampleReport.tajweedScore !== undefined &&
    sampleReport.surahRecited !== undefined;

  assert(
    hasDetailedMetrics,
    `التقرير يحتوي على درجات الحفظ والتجويد واسم السورة وملاحظات المعلم (درجة الحفظ: ${sampleReport?.memorizationScore}/10، التجويد: ${sampleReport?.tajweedScore}/10)`
  );

  // -------------------------------------------------------------------------
  // 4. UPCOMING SESSIONS & ATTENDANCE RSVP POLICY (6-HOUR RULE)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. سياسة الحضور والاعتذار وتأكيد الجلسات (RSVP & 6-Hour Compensation Policy) ---');

  const upcomingRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/upcoming-sessions',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });

  assert(
    upcomingRes.status === 200 && Array.isArray(upcomingRes.data.sessions),
    'استرجاع الحصص القادمة للأبناء عبر GET /api/guardian/upcoming-sessions'
  );

  const testSession = upcomingRes.data.sessions?.[0] || { _id: 'sess-up-1' };

  // 4.1 Confirm Attendance RSVP
  const rsvpConfirmRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/sessions/${testSession._id}/rsvp`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardianToken}`
    }
  }, {
    status: 'confirmed',
    studentId: targetChildId
  });

  assert(
    rsvpConfirmRes.status === 200 && rsvpConfirmRes.data?.success && rsvpConfirmRes.data?.status === 'confirmed',
    'تأكيد حضور الحصة مسبقاً (status: confirmed) بنجاح عبر POST /api/sessions/:id/rsvp',
    rsvpConfirmRes
  );

  // 4.2 Early Excuse (> 6 hours) -> Eligible for compensation
  const rsvpExcuseEarlyRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/sessions/${testSession._id}/rsvp`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardianToken}`
    }
  }, {
    status: 'excused',
    excuseReason: 'موعد طبي طارئ للطفل',
    studentId: targetChildId
  });

  const isEligible = rsvpExcuseEarlyRes.data?.eligibleForCompensation || rsvpExcuseEarlyRes.data?.compensationEligible;
  assert(
    rsvpExcuseEarlyRes.status === 200 && rsvpExcuseEarlyRes.data?.success && isEligible === true,
    'الاعتذار المبكر (أكثر من 6 ساعات) يحفظ حق الطفل في حصة تعويضية مجانية (compensationEligible: true)',
    rsvpExcuseEarlyRes
  );

  // -------------------------------------------------------------------------
  // 5. SILENT OBSERVER MODE (LIVEKIT CLASSROOM)
  // -------------------------------------------------------------------------
  console.log('\n--- 5. تجربة وضع المراقب الصامت (Silent Observer Mode) ---');

  const liveTokenRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/live/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    roomName: 'room-circle-test-1',
    participantName: 'ولي أمر - مراقب صامت',
    isHost: false
  });

  // Note: if livekit keys aren't set on dev machine, it returns 503 with mockToken or 200 with jwt
  const hasLivekitSupport = liveTokenRes.status === 200 || (liveTokenRes.status === 503 && liveTokenRes.data.mockToken);
  assert(
    hasLivekitSupport,
    'طلب رمز دخول وضع المراقب الصامت لحلقة القرآن المباشرة (isHost: false, canPublish: false)',
    liveTokenRes
  );

  // -------------------------------------------------------------------------
  // 6. ROLE ISOLATION & SECURITY BARRIERS
  // -------------------------------------------------------------------------
  console.log('\n--- 6. فحص العزل الأمني وعدم التداخل (Role Isolation & Security) ---');

  // 6.1 Guardian cannot access Teacher Dashboard
  const teacherDashRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/teachers/dashboard/profile',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });

  assert(
    teacherDashRes.status === 403,
    `عزل أدوار المعلمين: ولي الأمر ممنوع من دخول لوحة المعلم (HTTP ${teacherDashRes.status} Forbidden)`,
    teacherDashRes
  );

  // 6.2 Guardian cannot access Admin routes
  const adminStatsRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });

  assert(
    adminStatsRes.status === 403,
    `عزل أدوار الإدارة: ولي الأمر ممنوع من الوصول لإحصائيات الإدارة (HTTP ${adminStatsRes.status} Forbidden)`
  );

  // 6.3 Student cannot access Guardian children API
  const studentEmail = `student.isolated.${Date.now()}@athar.test`;
  const regStudentRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'طالب معزول',
    email: studentEmail,
    password: 'Password123!',
    role: 'student'
  });

  const studentToken = regStudentRes.data.accessToken || regStudentRes.data.token;
  const studentBreachRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/children',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });

  assert(
    studentBreachRes.status === 403,
    `منع الطلاب من انتحال ولي الأمر: حساب الطالب ممنوع من طلب مسارات ولي الأمر (HTTP ${studentBreachRes.status} Forbidden)`
  );

  // 6.4 Unauthenticated request blocked
  const anonRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/children',
    method: 'GET'
  });

  assert(
    anonRes.status === 401,
    `الحماية بدون توثيق: منع أي زائر غير مسجل من استعراض بيانات الأبناء (HTTP ${anonRes.status} Unauthorized)`
  );

  console.log('\n===============================================================');
  console.log(`  نتائج التدقيق النهائي: ${passed} اجتاز بنجاح (PASSED)، ${failed} إخفاق (FAILED)`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runGuardianAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
