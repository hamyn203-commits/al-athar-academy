import {
  BarChart3, BookOpen, CalendarClock, CreditCard, FileText, GraduationCap, History,
  Home, LogOut, Mail, Menu, Settings, ShieldCheck, TrendingUp, Users,
  WalletCards, X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo';
import NotificationBell from '../../components/NotificationBell';
import { useI18n } from '../../i18n';
import { dashboardPathForRole } from '../../lib/navigation';

const NAV_ITEMS = [
  { id: 'overview', label: 'مركز القيادة', icon: Home },
  { id: 'teachers', label: 'المعلمون', icon: GraduationCap },
  { id: 'people', label: 'الطلاب والأسر', icon: Users },
  { id: 'sessions', label: 'مركز الحصص', icon: CalendarClock },
  { id: 'payments', label: 'المدفوعات', icon: CreditCard, route: 'payments' },
  { id: 'withdrawals', label: 'السحوبات والمالية', icon: WalletCards },
  { id: 'courses', label: 'الدورات والمحتوى', icon: BookOpen },
  { id: 'messages', label: 'الدعم والرسائل', icon: Mail },
  { id: 'growth', label: 'التحليلات والنمو', icon: TrendingUp },
  { id: 'blog', label: 'المدونة', icon: FileText },
  { id: 'audit', label: 'سجل الإدارة', icon: History },
];

export default function AdminDashboardShell({
  user,
  active,
  onChange,
  onNavigate,
  onLogout,
  search,
  children,
}) {
  const { locale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleHome = dashboardPathForRole('admin', locale);

  const today = useMemo(() => new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date()), []);

  const selectItem = (item) => {
    setMobileOpen(false);
    if (item.route) {
      onNavigate?.(item.route);
      return;
    }
    onChange?.(item.id);
  };

  return (
    <div className="wn-admin-app" dir="rtl">
      <button
        type="button"
        className="wn-admin-mobile-toggle"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label="فتح قائمة الإدارة"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen ? <button type="button" className="wn-admin-sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" /> : null}

      <aside className={`wn-admin-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="wn-admin-sidebar__brand">
          <BrandLogo size={62} variant="light" layout="vertical" to={roleHome} />
        </div>

        <div className="wn-admin-sidebar__divider" />

        <nav className="wn-admin-sidebar__nav" aria-label="أقسام لوحة الإدارة">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const selected = !item.route && active === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => selectItem(item)}
                className={selected ? 'is-active' : ''}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="wn-admin-sidebar__system">
          <button type="button" onClick={() => onChange?.('system')} className={active === 'system' ? 'is-active' : ''}>
            <Settings size={18} />
            <span>النظام</span>
          </button>
          <Link to={roleHome}>
            <ShieldCheck size={18} />
            <span>لوحة الإدارة</span>
          </Link>
        </div>

        <div className="wn-admin-sidebar__profile">
          <div className="wn-admin-sidebar__avatar">{user?.name?.slice(0, 1) || 'A'}</div>
          <div>
            <strong>{user?.name || 'Admin'}</strong>
            <small>مدير الأكاديمية</small>
          </div>
          <button type="button" onClick={onLogout} aria-label="تسجيل الخروج"><LogOut size={17} /></button>
        </div>
      </aside>

      <div className="wn-admin-stage">
        <header className="wn-admin-topbar">
          <div className="wn-admin-topbar__search">{search}</div>
          <div className="wn-admin-topbar__actions">
            <NotificationBell />
            <span className="wn-admin-topbar__date">{today}</span>
            <span className="wn-admin-topbar__locale">AR</span>
          </div>
        </header>

        <main className="wn-admin-canvas">
          <section className="wn-admin-welcome">
            <div className="wn-admin-welcome__copy">
              <span>وَحْيٌ وَنَمَاء · ADMIN OS</span>
              <h1>مرحبًا بك يا مدير الأكاديمية</h1>
              <p>نظرة تشغيلية شاملة على ما يحدث داخل الأكاديمية الآن.</p>
            </div>
            <div className="wn-admin-welcome__ornament">
              <BarChart3 size={30} />
              <span>إدارة · متابعة · نمو</span>
            </div>
          </section>

          {children}
        </main>
      </div>
    </div>
  );
}
