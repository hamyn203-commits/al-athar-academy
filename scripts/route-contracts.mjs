import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  dashboardPathForRole,
  homePathForLocale,
  isSafeInternalRedirect,
  localizeInternalHref,
  loginPathForLocale,
  postAuthDestination,
} from '../src/lib/navigation.js';
import { localizedLocation } from '../src/lib/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(dashboardPathForRole('student', 'en'), '/en/student/dashboard');
assert.equal(dashboardPathForRole('teacher', 'ar'), '/ar/teacher/dashboard');
assert.equal(dashboardPathForRole('guardian', 'fr'), '/fr/guardian/dashboard');
assert.equal(dashboardPathForRole('admin', 'de'), '/de/admin');
assert.equal(dashboardPathForRole('unknown', 'en'), '/en');

assert.equal(loginPathForLocale('en'), '/en/login');
assert.equal(homePathForLocale('ar'), '/ar');

assert.equal(localizeInternalHref('/courses?track=hifz#plans', 'en'), '/en/courses?track=hifz#plans');
assert.equal(localizeInternalHref('/ar/courses', 'en'), '/ar/courses');
assert.equal(localizeInternalHref('https://example.com/course', 'en'), 'https://example.com/course');
assert.equal(localizeInternalHref('//example.com/course', 'en'), '//example.com/course');

assert.equal(
  localizedLocation('/en/courses', 'fr', '?track=hifz', '#plans'),
  '/fr/courses?track=hifz#plans'
);
assert.equal(
  localizedLocation('/courses', 'de', '?page=2', ''),
  '/de/courses?page=2'
);

assert.equal(isSafeInternalRedirect('/ar/live/room-1?from=dashboard'), true);
assert.equal(isSafeInternalRedirect('/courses'), true);
assert.equal(isSafeInternalRedirect('https://evil.example'), false);
assert.equal(isSafeInternalRedirect('//evil.example/path'), false);
assert.equal(isSafeInternalRedirect('/\\evil.example'), false);

assert.equal(
  postAuthDestination({
    redirect: '/courses?track=hifz#plans',
    role: 'student',
    locale: 'en',
  }),
  '/en/courses?track=hifz#plans'
);

assert.equal(
  postAuthDestination({
    redirect: '/ar/live/room-1?from=dashboard',
    role: 'student',
    locale: 'en',
  }),
  '/ar/live/room-1?from=dashboard'
);

assert.equal(
  postAuthDestination({
    redirect: 'https://evil.example/phish',
    role: 'guardian',
    locale: 'en',
  }),
  '/en/guardian/dashboard'
);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const login = read('src/pages/Login/index.jsx');
assert.match(login, /postAuthDestination\s*\(/);
assert.match(login, /searchParams\.get\(['"]redirect['"]\)/);

const register = read('src/pages/Register/index.jsx');
assert.match(register, /dashboardPathForRole\s*\(/);
assert.match(register, /localizedPath\(['"]\/login['"]/);

const redirects = read('src/components/DashboardRedirect.jsx');
assert.match(redirects, /dashboardPathForRole/);
assert.match(redirects, /loginPathForLocale/);
assert.match(redirects, /AuthenticatedLanding/);
assert.match(redirects, /AdminLegacyRedirect/);
assert.doesNotMatch(redirects, /localizedPath\(['"]\/teacher\/register['"]/);

const requireAuth = read('src/hooks/useRequireAuth.js');
assert.match(requireAuth, /loginPathForLocale/);
assert.match(requireAuth, /dashboardPathForRole/);
assert.match(requireAuth, /location\.pathname/);

const protectedRoute = read('src/components\/auth\/ProtectedRoute.jsx'.replaceAll('\\/', '/'));
assert.match(protectedRoute, /dashboardPathForRole/);

const languageSwitcher = read('src/components/LanguageSwitcher.jsx');
assert.match(languageSwitcher, /localizedLocation\(location\.pathname,\s*langCode,\s*location\.search,\s*location\.hash\)/);

const localeLayout = read('src/components/LocaleLayout.jsx');
assert.match(localeLayout, /localizedLocation\(correctedPath,\s*DEFAULT_LOCALE,\s*location\.search,\s*location\.hash\)/);
assert.match(localeLayout, /location\.search[\s\S]{0,100}location\.hash/);

const localeSensitiveNavigationFiles = [
  'src/components/NotificationBell.jsx',
  'src/components/QuranChatWidget.jsx',
  'src/components/shared/ErrorBoundary.jsx',
  'src/pages/AIHub/index.jsx',
  'src/pages/LiveRoom/LiveRoom.jsx',
  'src/pages/LiveSessions/LiveSessions.jsx',
  'src/pages/StudentDashboard/index.jsx',
  'src/pages/TeacherRegistration/index.jsx',
];

for (const relativePath of localeSensitiveNavigationFiles) {
  const source = read(relativePath);
  assert.doesNotMatch(source, /navigate\(\s*['\"`]\//, relativePath + ' must not use a hard-coded absolute navigate() target');
  assert.doesNotMatch(source, /\bto\s*=\s*['\"]\//, relativePath + ' must not use a hard-coded absolute Link target');
  assert.doesNotMatch(source, /window\.location\.href\s*=\s*['\"]\//, relativePath + ' must not hard-code browser recovery navigation');
}

const notifications = read('src/components/NotificationBell.jsx');
assert.match(notifications, /localizeInternalHref\(notification\.data\.meetingLink,\s*locale\)/);
assert.match(notifications, /localizeInternalHref\(links\[notification\.type\]/);

const liveSessions = read('src/pages/LiveSessions/LiveSessions.jsx');
assert.match(liveSessions, /localizedPath\(\`\/live\/\$\{roomId\}\`,\s*locale\)/);

const teacherDashboard = read('src/pages/TeacherDashboard/index.jsx');
assert.match(teacherDashboard, /useState\(['"]overview['"]\)/);
assert.match(teacherDashboard, /function\s+TeacherCommandBar\s*\(/);
assert.match(teacherDashboard, /tab\s*===\s*['"]students['"]/);
assert.match(teacherDashboard, /\/api\/finance\/teacher\/balance/);
assert.match(teacherDashboard, /\/api\/live\/sessions/);
assert.match(teacherDashboard, /tab\s*===\s*['"]updates['"]/);
assert.match(teacherDashboard, /uploadFileDirect\(file,\s*['"]teacher-update-video['"]\)/);
assert.match(teacherDashboard, /\/api\/teacher-updates\/teacher/);
assert.doesNotMatch(teacherDashboard, /<TabBar\s/);

const bookSessionPage = read('src/pages/BookSession/index.jsx');
assert.match(bookSessionPage, /\/api\/sessions\/available-slots\//);
assert.match(bookSessionPage, /availabilityData\.configured/);

const studentDashboard = read('src/pages/StudentDashboard/index.jsx');
assert.match(studentDashboard, /localizeInternalHref\(session\.meetingLink,\s*locale\)/);
assert.match(studentDashboard, /localizedPath\(\`\/meeting\/\$\{session\._id\}\`,\s*locale\)/);
assert.match(studentDashboard, /useState\(['"]overview['"]\)/);
assert.match(studentDashboard, /\/api\/sessions\/available-slots\//);
assert.match(studentDashboard, /tab\s*===\s*['"]overview['"]/);
assert.match(studentDashboard, /\[\.\.\.upcomingSessions,\s*\.\.\.upcomingTrials\][\s\S]{0,160}sort/);
assert.match(studentDashboard, /function\s+StudentCommandBar\s*\(/);
assert.match(studentDashboard, /primaryNavItems/);
assert.match(studentDashboard, /secondaryNavItems/);
assert.match(studentDashboard, /tab\s*===\s*['"]teacher-updates['"]/);
assert.match(studentDashboard, /\/api\/teacher-updates\/student/);
assert.doesNotMatch(studentDashboard, /<TabBar\s/);

const errorBoundary = read('src/components/shared/ErrorBoundary.jsx');
assert.match(errorBoundary, /localizedPath\(['\"]\/['\"],\s*locale\)/);

const paymentReturn = read('src/pages/PaymentReturn/index.jsx');
assert.match(paymentReturn, /\/api\/payments\/'\s*\+\s*encodeURIComponent\(paymentId\)\s*\+\s*'\/status/);
assert.doesNotMatch(paymentReturn, /params\.get\(['"]success['"]\)/);

const courseDetail = read('src/pages/CourseDetail/index.jsx');
assert.match(courseDetail, /localizedPath\(['"]\/payment\/manual['"],\s*locale\)/);

const manualPayment = read('src/pages/ManualPayment/index.jsx');
assert.match(manualPayment, /uploadFileDirect\(proof,\s*['"]payment-proof['"]\)/);
assert.match(manualPayment, /\/api\/payments\/course\/'\s*\+\s*encodeURIComponent\(slug\)\s*\+\s*'\/manual/);

const adminPayments = read('src/pages/AdminPayments/index.jsx');
assert.match(adminPayments, /\/api\/payments\/admin\/manual/);
assert.match(adminPayments, /\/review/);

const app = read('src/App.jsx');
assert.match(
  app,
  /path=["']guardian\/dashboard["'][\s\S]{0,180}roles=\{\[['"]guardian['"]\]\}/
);
assert.match(
  app,
  /path=["']admin\/dashboard["'][\s\S]{0,180}roles=\{\[['"]admin['"]\]\}[\s\S]{0,120}<AdminLegacyRedirect\s*\/>/
);
assert.match(
  app,
  /<Route\s+index\s+element=\{<AuthenticatedLanding><LandingPage\s*\/><\/AuthenticatedLanding>\}/
);
assert.match(
  app,
  /path=["']\/:locale["'][\s\S]{0,260}path=["']\*["'][\s\S]{0,120}<NotFoundPage\s*\/>/
);
assert.match(
  app,
  /path=["']payment\/return["'][\s\S]{0,180}<ProtectedRoute\s+roles=\{\[['"]student['"],\s*['"]admin['"]\]\}/
);
assert.match(
  app,
  /path=["']payment\/manual["'][\s\S]{0,180}<ProtectedRoute\s+roles=\{\[['"]student['"]\]\}/
);
assert.match(
  app,
  /path=["']admin\/payments["'][\s\S]{0,180}<ProtectedRoute\s+roles=\{\[['"]admin['"]\]\}/
);

console.log('Route navigation contracts passed.');
const dashboardLayout = read('src/components/dashboard/DashboardLayout.jsx');
assert.match(dashboardLayout, /dashboardPathForRole\(user\?\.role,\s*locale\)/);
assert.doesNotMatch(dashboardLayout, /['"]\/admin\/dashboard['"]/);

const guardianDashboard = read('src/pages/GuardianDashboard/index.jsx');
assert.match(guardianDashboard, /useRequireAuth\(\[['"]guardian['"]\]\)/);
assert.doesNotMatch(guardianDashboard, /useRequireAuth\(\[['"]guardian['"],\s*['"]admin['"]\]\)/);
assert.match(guardianDashboard, /selectedChildId[\s\S]{0,180}['"]family['"]/);
assert.match(guardianDashboard, /\/api\/guardian\/family-overview/);
assert.match(guardianDashboard, /\/api\/guardian\/homework\/\$\{selectedChildId\}/);
assert.match(guardianDashboard, /children\.length\s*>\s*1[\s\S]{0,1200}كل الأبناء/);
assert.match(guardianDashboard, /session\.instanceKey/);
