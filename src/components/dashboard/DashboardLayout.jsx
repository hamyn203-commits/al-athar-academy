import { LogOut, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

export default function DashboardLayout({ title, user, onLogout, children }) {
  const { locale, isRTL } = useI18n();

  const greeting = locale === 'id' ? `Halo, ${user?.name}` : locale === 'ar' ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`;
  const websiteLabel = locale === 'id' ? 'Situs' : locale === 'ar' ? 'الموقع' : 'Website';
  const logoutLabel = locale === 'id' ? 'Keluar' : locale === 'ar' ? 'خروج' : 'Logout';

  return (
    <div className="min-h-screen bg-[var(--athar-cream)]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ═══ الهيدر الأزهري ═══ */}
      <header className="bg-white shadow-sm border-b-2 border-[var(--azhar-gold-leaf)]/30 sticky top-0 z-40">
        <div className="h-0.5 w-full bg-gradient-to-r from-[var(--azhar-gold-dark)] via-[var(--azhar-gold-leaf)] to-[var(--azhar-gold-dark)]" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--azhar-green-deep)]" style={{ fontFamily: 'Amiri, serif' }}>{title}</h1>
            {user?.name && <p className="text-sm text-[var(--athar-text-muted)]">{greeting}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-[var(--azhar-green)] hover:text-[var(--azhar-green-deep)] hover:underline flex items-center gap-1">
              <Star size={14} fill="currentColor" />
              {websiteLabel}
            </Link>
            <button onClick={onLogout} className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--athar-text-muted)] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
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
    emerald: { text: 'text-[var(--azhar-green)]', bg: 'bg-[var(--azhar-green-50)]' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50' },
    yellow: { text: 'text-yellow-600', bg: 'bg-yellow-50' },
    green: { text: 'text-[var(--azhar-green)]', bg: 'bg-[var(--azhar-green-50)]' },
  };
  const c = colors[color] || colors.emerald;
  return (
    <div className="azhar-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--athar-text-muted)] text-xs mb-1">{label}</p>
          <p className={`text-2xl font-bold ${c.text}`} style={{ fontFamily: 'Amiri, serif' }}>{value}</p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
            <Icon className={c.text} size={24} />
          </div>
        )}
      </div>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="border-b border-[var(--athar-cream-dark)] mb-6">
      <div className="flex overflow-x-auto gap-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`px-5 py-3 font-semibold whitespace-nowrap text-sm transition-colors ${
              active === tab.id
                ? 'border-b-2 border-[var(--azhar-green)] text-[var(--azhar-green-deep)]'
                : 'text-[var(--athar-text-muted)] hover:text-[var(--azhar-green-deep)]'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
