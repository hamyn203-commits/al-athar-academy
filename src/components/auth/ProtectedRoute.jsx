import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import BrandLogo from '../BrandLogo';

function GuardLoader() {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <BrandLogo size={58} />
      <div className="spinner spinner-lg" />
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
        جاري التحقق من الجلسة...
      </span>
    </div>
  );
}

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { locale } = useParams();

  if (isLoading) return <GuardLoader />;

  const localePrefix = locale ? `/${locale}` : '';
  const loginPath = `${localePrefix}/login` || '/login';
  const homePath = localePrefix || '/';

  if (!isAuthenticated || !user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${loginPath}?redirect=${redirect}`} replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to={homePath} replace />;
  }

  return children;
}
