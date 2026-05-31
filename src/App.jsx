import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppProvider';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ToastProvider } from './context/ToastProvider';
import { I18nProvider } from './i18n';
import Logo from './components/Logo';
import ErrorBoundary from './components/shared/ErrorBoundary';

const LandingPage = lazy(() => import('./pages/NewLandingPage'));
const StudentPortal = lazy(() => import('./pages/StudentPortal/StudentPortal'));
const TeacherPortal = lazy(() => import('./pages/TeacherPortal/TeacherPortal'));
const LiveSessions = lazy(() => import('./pages/LiveSessions/LiveSessions'));
const LiveRoom = lazy(() => import('./pages/LiveRoom/LiveRoom'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFound'));
const TeacherRegistration = lazy(() => import('./pages/TeacherRegistration'));
const Teachers = lazy(() => import('./pages/Teachers'));
const TeacherProfile = lazy(() => import('./pages/TeacherProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const BookSession = lazy(() => import('./pages/BookSession'));
const GlobalPlatform = lazy(() => import('./pages/GlobalPlatform/GlobalPlatform'));
const Courses = lazy(() => import('./pages/Courses'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const CertificateView = lazy(() => import('./pages/Certificate'));

function PageLoader() {
  return (
    <div className="loading-overlay">
      <Logo size={60} showText={false} />
      <div className="spinner spinner-lg" />
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>جاري التحميل...</span>
    </div>
  );
}

function AppContent() {
  const { t } = useAppContext();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="bg-particle" style={{ top: '15%', left: '20%', width: '350px', height: '350px' }} />
      <div className="bg-particle" style={{ top: '60%', right: '10%', width: '400px', height: '400px' }} />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/verify-certificate/:certificateId" element={<CertificateView />} />
          <Route path="/student" element={<StudentPortal />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherPortal />} />
          <Route path="/teacher/register" element={<TeacherRegistration />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/:id" element={<TeacherProfile />} />
          <Route path="/book-trial/:teacherId" element={<BookSession />} />
          <Route path="/global-platform" element={<GlobalPlatform />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/live" element={<LiveSessions />} />
          <Route path="/live/:roomId" element={<LiveRoom />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <footer style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-light)', padding: '32px 0', marginTop: 'auto', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <Logo size={40} showText />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t.footer.rights} © {new Date().getFullYear()} | {t.footer.slogan}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AppProvider>
          <AuthProvider>
            <ToastProvider>
              <Router>
                <AppContent />
              </Router>
            </ToastProvider>
          </AuthProvider>
        </AppProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
