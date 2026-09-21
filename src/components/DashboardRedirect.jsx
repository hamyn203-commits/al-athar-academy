import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export function StudentLegacyRedirect() {
  const { user } = useAuth();
  if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export function TeacherLegacyRedirect() {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user) return <Navigate to="/teacher/register" replace />;
  return <Navigate to="/login" replace />;
}

export function GuardianLegacyRedirect() {
  const { user } = useAuth();
  if (user?.role === 'guardian' || user?.role === 'admin') return <Navigate to="/guardian/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

