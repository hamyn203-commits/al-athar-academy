import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useI18n } from '../i18n';
import {
  dashboardPathForRole,
  loginPathForLocale,
} from '../lib/navigation';

function useNavigationLocale() {
  const { locale: paramLocale } = useParams();
  const { locale } = useI18n();
  return paramLocale || locale;
}

export function StudentLegacyRedirect() {
  const { user } = useAuth();
  const locale = useNavigationLocale();

  if (user) {
    return <Navigate to={dashboardPathForRole(user.role, locale)} replace />;
  }

  return <Navigate to={loginPathForLocale(locale)} replace />;
}

export function TeacherLegacyRedirect() {
  const { user } = useAuth();
  const locale = useNavigationLocale();

  if (user) {
    return <Navigate to={dashboardPathForRole(user.role, locale)} replace />;
  }

  return <Navigate to={loginPathForLocale(locale)} replace />;
}

export function GuardianLegacyRedirect() {
  const { user } = useAuth();
  const locale = useNavigationLocale();

  if (user) {
    return <Navigate to={dashboardPathForRole(user.role, locale)} replace />;
  }

  return <Navigate to={loginPathForLocale(locale)} replace />;
}

export function AdminLegacyRedirect() {
  const { user } = useAuth();
  const locale = useNavigationLocale();

  if (user) {
    return <Navigate to={dashboardPathForRole(user.role, locale)} replace />;
  }

  return <Navigate to={loginPathForLocale(locale)} replace />;
}

export function AuthenticatedLanding({ children }) {
  const { user, isLoading } = useAuth();
  const locale = useNavigationLocale();

  if (isLoading) return null;

  if (user) {
    return <Navigate to={dashboardPathForRole(user.role, locale)} replace />;
  }

  return children;
}
