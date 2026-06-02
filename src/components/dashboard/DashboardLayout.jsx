import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

export default function DashboardLayout({ title, user, onLogout, children }) {
  const { locale, isRTL } = useI18n();

  const greeting = locale === 'id' ? `Halo, ${user?.name}` : locale === 'ar' ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`;
  const websiteLabel = locale === 'id' ? 'Situs' : locale === 'ar' ? 'الموقع' : 'Website';
  const logoutLabel = locale === 'id' ? 'Keluar' : locale === 'ar' ? 'خروج' : 'Logout';

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {user?.name && <p className="text-sm text-gray-500">{greeting}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-emerald-600 hover:underline">{websiteLabel}</Link>
            <button onClick={onLogout} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50">
              <LogOut size={16} /> {logoutLabel}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'emerald' }) {
  const colors = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs mb-1">{label}</p>
          <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        </div>
        {Icon && <Icon className={colors[color]} size={28} />}
      </div>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex overflow-x-auto gap-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`px-5 py-3 font-semibold whitespace-nowrap text-sm transition-colors ${
              active === tab.id ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-800'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
