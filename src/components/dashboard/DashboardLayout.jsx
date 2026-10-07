import { LogOut } from 'lucide-react';
import BrandLogo from '../BrandLogo';
import NotificationBell from '../NotificationBell';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import '../../styles/dashboard-experience.css';

export default function DashboardLayout({ title, user, onLogout, children }) {
  const { locale, isRTL } = useI18n();
  const lp = (path) => localizedPath(path, locale);

  const greeting = locale === 'id'
    ? 'Halo, ' + (user?.name || '')
    : locale === 'ar'
      ? 'مرحبًا، ' + (user?.name || '')
      : 'Welcome, ' + (user?.name || '');

  const logoutLabel = locale === 'id' ? 'Keluar' : locale === 'ar' ? 'خروج' : 'Logout';

  const dashboardPath = {
    student: '/student/dashboard',
    teacher: '/teacher/dashboard',
    guardian: '/guardian/dashboard',
    admin: '/admin',
  }[user?.role] || '/';

  return (
    <div className="wn-dashboard-shell" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="wn-dashboard-header">
        <div className="wn-dashboard-header__bar" aria-hidden="true" />
        <div className="page-container wn-dashboard-header__inner">
          <div className="flex items-center gap-3 min-w-0">
            <div className="wn-dashboard-brand shrink-0">
              <BrandLogo size={42} to={lp(dashboardPath)} />
            </div>
            <div className="min-w-0">
              <h1 className="wn-dashboard-title truncate">{title}</h1>
              {user?.name ? <p className="wn-dashboard-greeting truncate">{greeting}</p> : null}
            </div>
          </div>

          <div className="wn-dashboard-actions">
            <NotificationBell />
            <button type="button" onClick={onLogout} className="wn-dashboard-action hover:!text-red-700 hover:!border-red-200">
              <LogOut size={15} />
              <span>{logoutLabel}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-container wn-dashboard-main">{children}</main>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="wn-stat-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="wn-stat-card__label">{label}</p>
          <p className="wn-stat-card__value">{value}</p>
        </div>
        {Icon ? <div className="wn-stat-card__icon"><Icon size={22} /></div> : null}
      </div>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="wn-dashboard-tabs">
      <div className="wn-dashboard-tabs__row">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={'wn-dashboard-tab ' + (active === tab.id ? 'is-active' : '')}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
