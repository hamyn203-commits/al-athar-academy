import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ToastProvider } from './context/ToastProvider';
import { I18nProvider, useI18n } from './i18n';
import { MarketProvider } from './context/MarketProvider';
import LocaleLayout from './components/LocaleLayout';
import { StudentLegacyRedirect, TeacherLegacyRedirect, GuardianLegacyRedirect } from './components/DashboardRedirect';
import BrandLogo from './components/BrandLogo';
import QuranChatWidget from './components/QuranChatWidget';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RealtimeBridge from './components/RealtimeBridge';
import { localizedPath } from './lib/locale';

const LandingPage = lazy(() => import('./pages/NewLandingPage'));
const LiveSessions = lazy(() => import('./pages/LiveSessions/LiveSessions'));
const LiveRoom = lazy(() => import('./pages/LiveRoom/LiveRoom'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFound'));
const TeacherRegistration = lazy(() => import('./pages/TeacherRegistration'));
const Teachers = lazy(() => import('./pages/Teachers'));
const TeacherProfile = lazy(() => import('./pages/TeacherProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const GuardianDashboard = lazy(() => import('./pages/GuardianDashboard'));
const BookSession = lazy(() => import('./pages/BookSession'));
const FreeTrial = lazy(() => import('./pages/FreeTrial/FreeTrial'));
const GlobalPlatform = lazy(() => import('./pages/GlobalPlatform/GlobalPlatform'));
const MarketsIndex = lazy(() => import('./pages/Markets'));
const MarketDetail = lazy(() => import('./pages/Markets/MarketDetail'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const CourseLearn = lazy(() => import('./pages/CourseLearn'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQPage = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const CertificateView = lazy(() => import('./pages/Certificate'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AIHub = lazy(() => import('./pages/AIHub'));
const Donate = lazy(() => import('./pages/Donate'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn'));
const ManualPayment = lazy(() => import('./pages/ManualPayment'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const WomenPortal = lazy(() => import('./pages/Women'));
const VideoLibrary = lazy(() => import('./pages/Library'));
const Careers = lazy(() => import('./pages/Careers'));
const RevertsProgram = lazy(() => import('./pages/Programs/Reverts'));
const KidsProgram = lazy(() => import('./pages/Programs/Kids'));
const TracksPage = lazy(() => import('./pages/Tracks'));
const MobileAppPage = lazy(() => import('./pages/Mobile'));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const NotificationSettings = lazy(() => import('./pages/Settings/Notifications'));
const MeetingRoom = lazy(() => import('./pages/Meeting/MeetingRoom'));

function PageLoader() {
  return (
    <div className="loading-overlay">
      <BrandLogo size={58} />
      <div className="spinner spinner-lg" />
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>جاري التحميل...</span>
    </div>
  );
}

function pageRoutes() {
  return (
    <>
      <Route index element={<RoleAwareHome />} />
      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="register" element={<Register />} />
      <Route path="register/student" element={<Register />} />
      <Route path="register/guardian" element={<Register />} />
      <Route path="register/teacher" element={<TeacherRegistration />} />
      <Route path="about" element={<About />} />
      <Route path="faq" element={<FAQPage />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="terms" element={<Terms />} />
      <Route path="courses" element={<Courses />} />
      <Route path="courses/:slug" element={<CourseDetail />} />
      <Route path="courses/:slug/learn" element={<CourseLearn />} />
      <Route path="courses/:slug/learn/:lessonId" element={<CourseLearn />} />
      <Route path="blog" element={<Blog />} />
      <Route path="blog/:slug" element={<BlogDetail />} />
      <Route path="contact" element={<Contact />} />
      <Route path="verify-certificate/:certificateId" element={<CertificateView />} />
      <Route path="student" element={<StudentLegacyRedirect />} />
      <Route path="student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="guardian" element={<GuardianLegacyRedirect />} />
      <Route path="guardian/dashboard" element={<ProtectedRoute roles={['guardian', 'admin']}><GuardianDashboard /></ProtectedRoute>} />
      <Route path="teacher" element={<TeacherLegacyRedirect />} />
      <Route path="teacher/register" element={<TeacherRegistration />} />
      <Route path="teacher/dashboard" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="teachers" element={<Teachers />} />
      <Route path="teachers/:id" element={<TeacherProfile />} />
      <Route path="free-trial" element={<FreeTrial />} />
      <Route path="trial" element={<FreeTrial />} />
      <Route path="book-trial/:teacherId" element={<BookSession />} />
      <Route path="global-platform" element={<GlobalPlatform />} />
      <Route path="markets" element={<MarketsIndex />} />
      <Route path="markets/:slug" element={<MarketDetail />} />
      <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
      <Route path="live" element={<ProtectedRoute><LiveSessions /></ProtectedRoute>} />
      <Route path="live/:roomId" element={<ProtectedRoute><LiveRoom /></ProtectedRoute>} />
      <Route path="meeting/:sessionId" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
      <Route path="ai" element={<AIHub />} />
      <Route path="donate" element={<Donate />} />
      <Route path="payment/return" element={<ProtectedRoute roles={['student', 'admin']}><PaymentReturn /></ProtectedRoute>} />
      <Route path="payment/manual" element={<ProtectedRoute roles={['student']}><ManualPayment /></ProtectedRoute>} />
      <Route path="women" element={<WomenPortal />} />
      <Route path="library" element={<VideoLibrary />} />
      <Route path="careers" element={<Careers />} />
      <Route path="programs/reverts" element={<RevertsProgram />} />
      <Route path="programs/kids" element={<KidsProgram />} />
      <Route path="kids" element={<KidsProgram />} />
      <Route path="tracks" element={<TracksPage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="app" element={<MobileAppPage />} />
      <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
    </>
  );
}

function RoleAwareHome() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();

  if (isLoading) return <PageLoader />;

  const roleHome = {
    student: '/student/dashboard',
    teacher: '/teacher/dashboard',
    guardian: '/guardian/dashboard',
    admin: '/admin',
  }[user?.role];

  if (isAuthenticated && roleHome) {
    return <Navigate replace to={localizedPath(roleHome, locale)} />;
  }

  return <LandingPage />;
}

function GlobalWidgets() {
  const location = useLocation();
  const path = location.pathname.replace(/^\/(ar|en|id)(?=\/|$)/, '') || '/';
  const isWorkspace = /^\/(student|teacher|guardian|admin|live|meeting)(\/|$)/.test(path);

  return (
    <>
      {!isWorkspace && <QuranChatWidget />}
      <PwaInstallPrompt />
    </>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LocaleLayout />}>
            {pageRoutes()}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/:locale" element={<LocaleLayout />}>
            {pageRoutes()}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <MarketProvider>
          <AppProvider>
            <AuthProvider>
              <ToastProvider>
              <Router>
                <RealtimeBridge />
                <AppContent />
                <GlobalWidgets />
              </Router>
              </ToastProvider>
            </AuthProvider>
          </AppProvider>
        </MarketProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}