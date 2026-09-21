const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(body); } catch { json = body; }
        resolve({ status: res.statusCode, data: json });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================');
  console.log('Starting End-to-End Persona Verification');
  console.log('====================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // 1. ADMIN PERSONA TESTS
  // ----------------------------------------------------
  console.log('--- 1. Testing Admin Persona ---');
  
  // A. Setup Admin via /api/setup/admin
  const setupRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/setup/admin',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'المدير التنفيذي',
    email: 'admin.persona@alathar.test',
    password: 'Password123!'
  });
  assert(setupRes.status === 200 || setupRes.status === 201, `Setup admin endpoint returns 200/201 (got ${setupRes.status})`);

  // B. Admin Login
  const loginAdminRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin.persona@alathar.test',
    password: 'Password123!'
  });
  assert(loginAdminRes.status === 200 && (loginAdminRes.data.token || loginAdminRes.data.accessToken), 'Admin login successful with valid token');
  const adminToken = loginAdminRes.data.token || loginAdminRes.data.accessToken;

  // C. Admin Stats
  const statsRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(statsRes.status === 200 && statsRes.data.totalStudents !== undefined, `Admin stats returned (totalStudents: ${statsRes.data?.totalStudents})`);

  // D. Admin Pending Teachers
  const pendingTeachersRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/teachers/admin/pending',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(pendingTeachersRes.status === 200 && Array.isArray(pendingTeachersRes.data), `Pending teachers endpoint returns array (count: ${pendingTeachersRes.data?.length})`);

  // E. Admin Review Teacher
  const reviewTeacherRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/teachers/admin/mock-teacher-1/review',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    action: 'approve',
    note: 'تمت مراجعة الشهادات بنجاح ومطابقتها'
  });
  assert(reviewTeacherRes.status === 200 && reviewTeacherRes.data.success, 'Admin teacher review/approval succeeds');

  // F. Circles & Trials & Donations
  const circlesRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/circles',
    method: 'GET'
  });
  assert(circlesRes.status === 200 && circlesRes.data.success && circlesRes.data.circles.length > 0, `Circles fetched successfully (${circlesRes.data?.circles?.length} circles)`);

  const trialsRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/trials',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(trialsRes.status === 200 && trialsRes.data.success, 'Trials list fetched successfully');

  const donationsRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/donations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(donationsRes.status === 200 && Array.isArray(donationsRes.data.donations), 'Donations admin list fetched successfully');


  // ----------------------------------------------------
  // 2. STUDENT PERSONA TESTS
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Student Persona ---');

  // A. Register Student
  const studentEmail = `student_${Date.now()}@alathar.test`;
  const registerStudentRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'عبد الرحمن خالد',
    email: studentEmail,
    password: 'Password123!',
    role: 'student'
  });
  assert(registerStudentRes.status === 201 && (registerStudentRes.data.token || registerStudentRes.data.accessToken), 'Student registration succeeds');
  const studentToken = registerStudentRes.data.token || registerStudentRes.data.accessToken;

  // B. Student Dashboard Profile & Stats (/api/students/dashboard/profile)
  const studentProfileRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/students/dashboard/profile',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert(studentProfileRes.status === 200 && studentProfileRes.data.user, 'Student profile fetched successfully via /api/students/dashboard/profile');

  // C. Evaluations Alignment (/api/students/dashboard/evaluations)
  const studentEvalRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/students/dashboard/evaluations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const firstEval = studentEvalRes.data?.evaluations?.[0];
  const evalDetails = firstEval?.teacherEvaluation || firstEval;
  const hasAlignedEvalFields = evalDetails && 
    typeof evalDetails.memorization === 'number' && 
    typeof evalDetails.tajweed === 'number' && 
    evalDetails.overallNotes !== undefined;
  assert(studentEvalRes.status === 200 && hasAlignedEvalFields, 'Student evaluations fields match dashboard UI (/5 criteria)');

  // D. Course Learn LMS fallback
  const courseLmsRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/lms/course/quran-recitation-rules',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  assert(courseLmsRes.status === 200 && courseLmsRes.data.course, 'Course learn LMS route responds immediately with full curriculum');

  // E. Certificates fallback (both /api/certificates/my-certificates and /api/lms/my-certificates)
  const certsRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/certificates/my-certificates',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const certsArr = Array.isArray(certsRes.data) ? certsRes.data : certsRes.data.certificates;
  assert(certsRes.status === 200 && Array.isArray(certsArr) && certsArr.length > 0, `Student certificates route responds with certificates (count: ${certsArr?.length})`);

  // F. Homework Submit
  const hwSubmitRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/homework/mock-hw-1/submit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    }
  }, {
    notes: 'تمت قراءة وتسميع سورة الملك بفضل الله',
    versesRecited: '1-10'
  });
  assert(hwSubmitRes.status === 200 && hwSubmitRes.data.success, 'Student homework submission succeeds in mock mode');


  // ----------------------------------------------------
  // 3. GUARDIAN PERSONA TESTS
  // ----------------------------------------------------
  console.log('\n--- 3. Testing Guardian Persona ---');

  // A. Register Guardian
  const guardianEmail = `guardian_${Date.now()}@alathar.test`;
  const registerGuardianRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'أبو عبد الرحمن',
    email: guardianEmail,
    password: 'Password123!',
    role: 'guardian'
  });
  assert(registerGuardianRes.status === 201 && (registerGuardianRes.data.token || registerGuardianRes.data.accessToken), 'Guardian registration succeeds');
  const guardianToken = registerGuardianRes.data.token || registerGuardianRes.data.accessToken;

  // B. Guardian Children list
  const childrenRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/children',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });
  assert(childrenRes.status === 200 && Array.isArray(childrenRes.data.children), `Guardian children fetched (${childrenRes.data.children?.length} children)`);

  // C. Guardian Link Child
  const linkRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/guardian/link-child',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardianToken}`
    }
  }, {
    email: studentEmail,
    relationship: 'father'
  });
  assert((linkRes.status === 200 || linkRes.status === 201) && linkRes.data.success, 'Guardian links student child successfully via /api/guardian/link-child');

  // D. Session RSVP: Attendance Confirmation ('confirmed')
  const rsvpConfirmRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/sessions/mock-session-1/rsvp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardianToken}`
    }
  }, {
    status: 'confirmed',
    studentId: studentEmail
  });
  assert(rsvpConfirmRes.status === 200 && rsvpConfirmRes.data.success, 'Guardian confirms attendance with status: confirmed');

  // E. Session RSVP: Excuse & Compensation
  const rsvpExcuseRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/sessions/mock-session-1/rsvp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${guardianToken}`
    }
  }, {
    status: 'excused',
    reason: 'سفر عائلي مفاجئ',
    studentId: studentEmail
  });
  assert(rsvpExcuseRes.status === 200 && rsvpExcuseRes.data.success, `Guardian excuse processed with 6h compensation rule: ${rsvpExcuseRes.data?.compensationEligible ? 'مؤهل لتعويض' : 'غير مؤهل'}`);

  console.log('\n====================================');
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal error during testing:', err);
  process.exit(1);
});
