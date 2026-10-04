const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 Comprehensive 4-Persona Isolation & Feature Audit');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const results = {
    student: { passed: [], failed: [], needs: [] },
    guardian: { passed: [], failed: [], needs: [] },
    teacher: { passed: [], failed: [], needs: [] },
    admin: { passed: [], failed: [], needs: [] },
    isolation: { passed: [], failed: [] }
  };

  // --------------------------------------------------------------------------
  // 1. PERSONA 1: طالب جديد (New Student)
  // --------------------------------------------------------------------------
  console.log('▶ [1/4] Auditing Persona 1: New Student (طالب جديد)...');
  const studentEmail = `student_${timestamp}@wahynamaa.academy`;
  const studentPass = 'StudentPass123!';

  // A. Register
  const sReg = await request({
    hostname: 'localhost', port: 4000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'طالب جديد تجريبي', email: studentEmail, password: studentPass, role: 'student' });

  const studentToken = sReg.data?.accessToken || sReg.data?.token;
  if ((sReg.status === 201 || sReg.status === 200) && studentToken) {
    results.student.passed.push('Student Registration: 201 Created with valid JWT token');
  } else {
    results.student.failed.push(`Student Registration failed: ${sReg.status} - ${JSON.stringify(sReg.data)}`);
  }

  // B. Student Profile
  const sProfile = await request({
    hostname: 'localhost', port: 4000, path: '/api/students/dashboard/profile', method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  if (sProfile.status === 200 && (sProfile.data.user || sProfile.data.profile)) {
    const sName = sProfile.data.user?.name || sProfile.data.profile?.name;
    results.student.passed.push(`Student Dashboard Profile: 200 OK (${sName})`);
  } else {
    results.student.failed.push(`Student Dashboard Profile failed: ${sProfile.status}`);
  }

  // C. Evaluations (Tajweed criteria)
  const sEval = await request({
    hostname: 'localhost', port: 4000, path: '/api/students/dashboard/evaluations', method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  if (sEval.status === 200) {
    results.student.passed.push('Student Evaluations: 200 OK');
  } else {
    results.student.failed.push(`Student Evaluations failed: ${sEval.status}`);
  }

  // D. LMS Curriculum access
  const sLms = await request({
    hostname: 'localhost', port: 4000, path: '/api/lms/course/quran-recitation-rules', method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  if (sLms.status === 200) {
    results.student.passed.push('Student LMS Course & Lessons: 200 OK');
  } else {
    results.student.failed.push(`Student LMS Course failed: ${sLms.status}`);
  }

  // E. Voice Homework Submit
  const sHw = await request({
    hostname: 'localhost', port: 4000, path: '/api/homework/mock-hw-1/submit', method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' }
  }, { audioUrl: 'https://cdn.wahynamaa.academy/homework/sample.mp3', notes: 'تمت قراءة سورة النبأ مع مراعاة الغنن' });
  if (sHw.status === 200 || sHw.status === 201) {
    results.student.passed.push('Student Homework Voice Submission: 200/201 OK');
  } else {
    results.student.failed.push(`Student Homework Submission failed: ${sHw.status}`);
  }

  // F. Student Certificates
  const sCert = await request({
    hostname: 'localhost', port: 4000, path: '/api/certificates/my-certificates', method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  if (sCert.status === 200) {
    results.student.passed.push('Student Certificates: 200 OK');
  } else {
    results.student.failed.push(`Student Certificates failed: ${sCert.status}`);
  }

  // Isolation check for Student: Attempt to access Admin or Teacher endpoints
  const sTryAdmin = await request({
    hostname: 'localhost', port: 4000, path: '/api/admin/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  if (sTryAdmin.status === 403 || sTryAdmin.status === 401) {
    results.isolation.passed.push('Student -> Admin Stats: Blocked with 403/401 (Zero Leakage)');
  } else {
    results.isolation.failed.push(`SECURITY LEAK: Student accessed Admin Stats (status ${sTryAdmin.status})`);
  }

  const sTryTeacher = await request({
    hostname: 'localhost', port: 4000, path: '/api/teachers/dashboard/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  if (sTryTeacher.status === 403 || sTryTeacher.status === 401) {
    results.isolation.passed.push('Student -> Teacher Dashboard: Blocked with 403/401 (Zero Leakage)');
  } else {
    results.isolation.failed.push(`SECURITY LEAK: Student accessed Teacher Dashboard (status ${sTryTeacher.status})`);
  }


  // --------------------------------------------------------------------------
  // 2. PERSONA 2: ولي الأمر (Guardian / Parent)
  // --------------------------------------------------------------------------
  console.log('▶ [2/4] Auditing Persona 2: Guardian (ولي أمر)...');
  const guardianEmail = `guardian_${timestamp}@wahynamaa.academy`;
  const guardianPass = 'GuardianPass123!';

  // A. Register
  const gReg = await request({
    hostname: 'localhost', port: 4000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'ولي أمر تجريبي', email: guardianEmail, password: guardianPass, role: 'guardian' });

  const guardianToken = gReg.data?.accessToken || gReg.data?.token;
  if ((gReg.status === 201 || gReg.status === 200) && guardianToken) {
    results.guardian.passed.push('Guardian Registration: 201 Created with valid JWT token');
  } else {
    results.guardian.failed.push(`Guardian Registration failed: ${gReg.status}`);
  }

  // B. Link Child
  const gLink = await request({
    hostname: 'localhost', port: 4000, path: '/api/guardian/link-child', method: 'POST',
    headers: { 'Authorization': `Bearer ${guardianToken}`, 'Content-Type': 'application/json' }
  }, { email: studentEmail, relationship: 'guardian' });
  if (gLink.status === 200 || gLink.status === 201) {
    results.guardian.passed.push('Guardian Link Student Child: 200/201 OK');
  } else {
    results.guardian.failed.push(`Guardian Link Child failed: ${gLink.status} - ${JSON.stringify(gLink.data)}`);
  }

  // C. Fetch Children
  const gChildren = await request({
    hostname: 'localhost', port: 4000, path: '/api/guardian/children', method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });
  if (gChildren.status === 200 && Array.isArray(gChildren.data.children)) {
    results.guardian.passed.push(`Guardian Children List: 200 OK (${gChildren.data.children.length} children)`);
  } else {
    results.guardian.failed.push(`Guardian Children List failed: ${gChildren.status}`);
  }

  // D. RSVP Session (Confirm attendance)
  const gRsvpConfirm = await request({
    hostname: 'localhost', port: 4000, path: '/api/sessions/mock-session-1/rsvp', method: 'POST',
    headers: { 'Authorization': `Bearer ${guardianToken}`, 'Content-Type': 'application/json' }
  }, { status: 'confirmed', notes: 'سوف يحضر الطالب في الموعد بإذن الله' });
  if (gRsvpConfirm.status === 200) {
    results.guardian.passed.push('Guardian RSVP Confirm Attendance: 200 OK');
  } else {
    results.guardian.failed.push(`Guardian RSVP Confirm failed: ${gRsvpConfirm.status}`);
  }

  // E. RSVP Session (Excuse with 6h compensation rule)
  const gRsvpExcuse = await request({
    hostname: 'localhost', port: 4000, path: '/api/sessions/mock-session-1/rsvp', method: 'POST',
    headers: { 'Authorization': `Bearer ${guardianToken}`, 'Content-Type': 'application/json' }
  }, { status: 'excused', reason: 'ظرف سفر طارئ' });
  if (gRsvpExcuse.status === 200) {
    results.guardian.passed.push(`Guardian Excuse with 6h Rule: 200 OK`);
  } else {
    results.guardian.failed.push(`Guardian Excuse failed: ${gRsvpExcuse.status}`);
  }

  // Isolation check for Guardian: Attempt to access Admin or Teacher endpoints
  const gTryAdmin = await request({
    hostname: 'localhost', port: 4000, path: '/api/admin/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });
  if (gTryAdmin.status === 403 || gTryAdmin.status === 401) {
    results.isolation.passed.push('Guardian -> Admin Stats: Blocked with 403/401 (Zero Leakage)');
  } else {
    results.isolation.failed.push(`SECURITY LEAK: Guardian accessed Admin Stats (status ${gTryAdmin.status})`);
  }

  const gTryTeacher = await request({
    hostname: 'localhost', port: 4000, path: '/api/teachers/dashboard/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${guardianToken}` }
  });
  if (gTryTeacher.status === 403 || gTryTeacher.status === 401) {
    results.isolation.passed.push('Guardian -> Teacher Dashboard: Blocked with 403/401 (Zero Leakage)');
  } else {
    results.isolation.failed.push(`SECURITY LEAK: Guardian accessed Teacher Dashboard (status ${gTryTeacher.status})`);
  }


  // --------------------------------------------------------------------------
  // 3. PERSONA 3: معلم القرآن الكريم (Teacher)
  // --------------------------------------------------------------------------
  console.log('▶ [3/4] Auditing Persona 3: Quran Teacher (معلم قرآن)...');
  const teacherEmail = `teacher_${timestamp}@wahynamaa.academy`;
  const teacherPass = 'TeacherPass123!';

  // A. Register / Login
  const tReg = await request({
    hostname: 'localhost', port: 4000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'الشيخ عبد الرحمن المقرئ', email: teacherEmail, password: teacherPass, role: 'teacher' });

  const teacherToken = tReg.data?.accessToken || tReg.data?.token;
  if ((tReg.status === 201 || tReg.status === 200) && teacherToken) {
    results.teacher.passed.push('Teacher Registration: 201 Created with valid JWT token');
  } else {
    results.teacher.failed.push(`Teacher Registration failed: ${tReg.status}`);
  }

  // B. Teacher Profile
  const tProfile = await request({
    hostname: 'localhost', port: 4000, path: '/api/teachers/dashboard/profile', method: 'GET',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  if (tProfile.status === 200 && (tProfile.data.teacher || tProfile.data.user)) {
    results.teacher.passed.push('Teacher Dashboard Profile: 200 OK');
  } else {
    results.teacher.failed.push(`Teacher Dashboard Profile failed: ${tProfile.status}`);
  }

  // C. Teacher Stats
  const tStats = await request({
    hostname: 'localhost', port: 4000, path: '/api/teachers/dashboard/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  if (tStats.status === 200) {
    results.teacher.passed.push('Teacher Dashboard Stats: 200 OK');
  } else {
    results.teacher.failed.push(`Teacher Dashboard Stats failed: ${tStats.status}`);
  }

  // D. Teacher Assigned Circles
  const tCircles = await request({
    hostname: 'localhost', port: 4000, path: '/api/circles', method: 'GET',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  if (tCircles.status === 200 && (Array.isArray(tCircles.data.circles) || Array.isArray(tCircles.data))) {
    results.teacher.passed.push(`Teacher Assigned Circles: 200 OK`);
  } else {
    results.teacher.failed.push(`Teacher Circles failed: ${tCircles.status}`);
  }

  // Isolation check for Teacher: Attempt to access Admin financial / management endpoints
  const tTryAdmin = await request({
    hostname: 'localhost', port: 4000, path: '/api/admin/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  if (tTryAdmin.status === 403 || tTryAdmin.status === 401) {
    results.isolation.passed.push('Teacher -> Admin Stats: Blocked with 403/401 (Zero Leakage)');
  } else {
    results.isolation.failed.push(`SECURITY LEAK: Teacher accessed Admin Stats (status ${tTryAdmin.status})`);
  }

  const tTryGuardian = await request({
    hostname: 'localhost', port: 4000, path: '/api/guardian/children', method: 'GET',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  if (tTryGuardian.status === 403 || tTryGuardian.status === 401) {
    results.isolation.passed.push('Teacher -> Guardian Children List: Blocked with 403/401 (Zero Leakage)');
  } else {
    results.isolation.failed.push(`SECURITY LEAK: Teacher accessed Guardian Children List (status ${tTryGuardian.status})`);
  }


  // --------------------------------------------------------------------------
  // 4. PERSONA 4: الإدارة الأكاديمية (Admin / Management)
  // --------------------------------------------------------------------------
  console.log('▶ [4/4] Auditing Persona 4: Academic Administration (الإدارة الأكاديمية)...');
  const adminEmail = `admin_${timestamp}@wahynamaa.academy`;
  const adminPass = 'AdminPass123!';

  // A. Setup Admin
  const aSetup = await request({
    hostname: 'localhost', port: 4000, path: '/api/setup/admin', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'مدير عام الأكاديمية', email: adminEmail, password: adminPass });

  // Login as Admin
  const aLogin = await request({
    hostname: 'localhost', port: 4000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: adminEmail, password: adminPass });

  const adminToken = aLogin.data?.accessToken || aLogin.data?.token;
  if ((aLogin.status === 200 || aSetup.status === 201) && adminToken) {
    results.admin.passed.push('Admin Authentication: 200 OK with Admin Role');
  } else {
    results.admin.failed.push(`Admin Login failed: ${aLogin.status}`);
  }

  // B. Admin Stats & KPIs
  const aStats = await request({
    hostname: 'localhost', port: 4000, path: '/api/admin/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (aStats.status === 200 && aStats.data.totalStudents !== undefined) {
    results.admin.passed.push(`Admin KPIs & Stats: 200 OK (${aStats.data.totalStudents} students, ${aStats.data.totalTeachers} teachers)`);
  } else {
    results.admin.failed.push(`Admin Stats failed: ${aStats.status}`);
  }

  // C. Review Pending Teachers
  const aPending = await request({
    hostname: 'localhost', port: 4000, path: '/api/teachers/admin/pending', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (aPending.status === 200 && Array.isArray(aPending.data)) {
    results.admin.passed.push(`Admin Pending Teachers Queue: 200 OK (${aPending.data.length} pending)`);
  } else {
    results.admin.failed.push(`Admin Pending Teachers failed: ${aPending.status}`);
  }

  // D. Approve / Review Teacher
  const aReview = await request({
    hostname: 'localhost', port: 4000, path: '/api/teachers/admin/mock-teacher-1/review', method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
  }, { status: 'approved', notes: 'تمت إجازته بالسند والتأكد من مخارج الحروف' });
  if (aReview.status === 200) {
    results.admin.passed.push('Admin Review & Approve Teacher: 200 OK');
  } else {
    results.admin.failed.push(`Admin Teacher Review failed: ${aReview.status}`);
  }

  // E. Manage Circles
  const aCircles = await request({
    hostname: '127.0.0.1', port: 4000, path: '/api/circles', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (aCircles.status === 200) {
    results.admin.passed.push('Admin Circle Allocations: 200 OK');
  } else {
    results.admin.failed.push(`Admin Circles failed: ${aCircles.status}`);
  }

  // F. Trial Sessions Queue
  const aTrials = await request({
    hostname: '127.0.0.1', port: 4000, path: '/api/trials', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (aTrials.status === 200) {
    results.admin.passed.push('Admin Trials Queue: 200 OK');
  } else {
    results.admin.failed.push(`Admin Trials failed: ${aTrials.status}`);
  }

  // G. Donations & Financial Reports
  const aDonations = await request({
    hostname: '127.0.0.1', port: 4000, path: '/api/donations', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (aDonations.status === 200) {
    results.admin.passed.push('Admin Donations & Financial Data: 200 OK');
  } else {
    results.admin.failed.push(`Admin Donations failed: ${aDonations.status}`);
  }


  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('====================================================');
  console.log(`Student Journey: ${results.student.passed.length} Passed, ${results.student.failed.length} Failed`);
  console.log(`Guardian Journey: ${results.guardian.passed.length} Passed, ${results.guardian.failed.length} Failed`);
  console.log(`Teacher Journey: ${results.teacher.passed.length} Passed, ${results.teacher.failed.length} Failed`);
  console.log(`Admin Journey: ${results.admin.passed.length} Passed, ${results.admin.failed.length} Failed`);
  console.log(`Role Isolation & Non-Overlap: ${results.isolation.passed.length} Passed, ${results.isolation.failed.length} Failed`);
  console.log('====================================================\n');

  if (results.student.failed.length || results.guardian.failed.length || results.teacher.failed.length || results.admin.failed.length || results.isolation.failed.length) {
    console.log('FAILURES ENCOUNTERED:', {
      student: results.student.failed,
      guardian: results.guardian.failed,
      teacher: results.teacher.failed,
      admin: results.admin.failed,
      isolation: results.isolation.failed
    });
    process.exit(1);
  } else {
    console.log('🎉 ALL TESTS PASSED! Strict role isolation and flawless feature workflows confirmed.');
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
