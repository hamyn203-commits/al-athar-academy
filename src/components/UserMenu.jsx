import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { localizedPath, DEFAULT_LOCALE } from '../lib/locale';

const DASHBOARD_BY_ROLE = {
  student: '/student/dashboard',
  teacher: '/teacher/dashboard',
  guardian: '/guardian/dashboard',
  admin: '/admin',
};

export default function UserMenu({ locale = DEFAULT_LOCALE }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  if (!isAuthenticated || !user) return null;

  const lp = (path) => localizedPath(path, locale);
  const dashboard = lp(DASHBOARD_BY_ROLE[user.role] || '/student/dashboard');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
          {user.name?.charAt(0) || 'U'}
        </div>
        <span className="hidden lg:block text-sm font-medium text-gray-800 max-w-[100px] truncate">
          {user.name}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border z-50 py-2">
          <div className="px-4 py-2 border-b">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link
            to={dashboard}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
          >
            <LayoutDashboard size={16} /> لوحة التحكم
          </Link>
          <Link
            to={lp('/ai')}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
          >
            <User size={16} /> مركز AI
          </Link>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
