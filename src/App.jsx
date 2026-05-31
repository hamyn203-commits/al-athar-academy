import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ToastProvider } from './context/ToastProvider';
import { I18nProvider } from './i18n';
import { MarketProvider } from './context/MarketProvider';
import LocaleLayout from './components/LocaleLayout';
import { StudentLegacyRedirect, TeacherLegacyRedirect } from './components/DashboardRedirect';
import Logo from './components/Logo';
import QuranChatWidget from './components/QuranChatWidget';

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
const SetupAdmin = lazy(() => import('./pages/SetupAdmin'));
const AIHub = lazy(() => import('./pages/AIHub'));
const Donate = lazy(() => import('./pages/Donate'));
const WomenPortal = lazy(() => import('./pages/Women'));
const VideoLibrary = lazy(() => import('./pages/Library'));
const Careers = lazy(() => import('./pages/Careers'));
const RevertsProgram = lazy(() => import('./pages/Programs/Reverts'));
const KidsProgram = lazy(() => import('./pages/Programs/Kids'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const NotificationSettings = lazy(() => import('./pages/Settings/Notifications'));

function PageLoader() {
  return (
    <div className="loading-overlay">
      <Logo size={60} showText={false} />
      <div className="spinner spinner-lg" />
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>جاري التحميل...</span>
    </div>
  );
}

function pageRoutes() {
  return (
    <>
      <Route index element={<LandingPage />} />
      <Route path="login" element={<Login />} />
      <Route path="setup-admin" element={<SetupAdmin />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="register/student" element={<Register />} />
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
      <Route path="student/dashboard" element={<StudentDashboard />} />
      <Route path="guardian/dashboard" element={<GuardianDashboard />} />
      <Route path="teacher" element={<TeacherLegacyRedirect />} />
      <Route path="teacher/register" element={<TeacherRegistration />} />
      <Route path="teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="teachers" element={<Teachers />} />
      <Route path="teachers/:id" element={<TeacherProfile />} />
      <Route path="book-trial/:teacherId" element={<BookSession />} />
      <Route path="global-platform" element={<GlobalPlatform />} />
      <Route path="markets" element={<MarketsIndex />} />
      <Route path="markets/:slug" element={<MarketDetail />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="live" element={<LiveSessions />} />
      <Route path="live/:roomId" element={<LiveRoom />} />
      <Route path="ai" element={<AIHub />} />
      <Route path="donate" element={<Donate />} />
      <Route path="women" element={<WomenPortal />} />
      <Route path="library" element={<VideoLibrary />} />
      <Route path="careers" element={<Careers />} />
      <Route path="programs/reverts" element={<RevertsProgram />} />
      <Route path="programs/kids" element={<KidsProgram />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="settings/notifications" element={<NotificationSettings />} />
    </>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LocaleLayout />}>{pageRoutes()}</Route>
          <Route path="/:locale" element={<LocaleLayout />}>{pageRoutes()}</Route>
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
                <AppContent />
                <QuranChatWidget />
              </Router>
              </ToastProvider>
            </AuthProvider>
          </AppProvider>
        </MarketProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
