import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useI18n } from '../i18n';
import { localizedPath } from '../lib/locale';
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

  if (user?.role === 'teacher') {
    return <Navigate to={dashboardPathForRole('teacher', locale)} replace />;
  }

  if (user) {
    return <Navigate to={localizedPath('/teacher/register', locale)} replace />;
  }

  return <Navigate to={loginPathForLocale(locale)} replace />;
}

export function GuardianLegacyRedirect() {
  const { user } = useAuth();
  const locale = useNavigationLocale();

  if (user?.role === 'guardian' || user?.role === 'admin') {
    return <Navigate to={localizedPath('/guardian/dashboard', locale)} replace />;
  }

  if (user) {
    return <Navigate to={dashboardPathForRole(user.role, locale)} replace />;
  }

  return <Navigate to={loginPathForLocale(locale)} replace />;
}
