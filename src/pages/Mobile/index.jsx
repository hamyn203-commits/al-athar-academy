import { Link } from 'react-router-dom';
import { Smartphone, Download, Share, Bell, WifiOff } from 'lucide-react';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import PwaInstallPrompt from '../../components/PwaInstallPrompt';

const STEPS = [
  { icon: Download, ar: 'اضغط «ثبّت التطبيق» عند ظهور الشريط السفلي', en: 'Tap "Install app" when the banner appears' },
  { icon: Share, ar: 'أو من Safari: مشاركة ← إضافة إلى الشاشة الرئيسية', en: 'Or in Safari: Share → Add to Home Screen' },
  { icon: Bell, ar: 'فعّل الإشعارات من إعدادات الحساب', en: 'Enable notifications in account settings' },
  { icon: WifiOff, ar: 'صفحات رئيسية تعمل بدون إنترنت بعد التثبيت', en: 'Key pages work offline after install' },
];

export default function MobileAppPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const lp = (p) => localizedPath(p, locale);

  return (
    <>
      <SEOHead page={{ url: '/app', title: isAr ? 'تطبيق الهاتف' : 'Mobile App', description: isAr ? 'ثبّت أكاديمية الأثر على هاتفك' : 'Install Al-Athar Academy on your phone' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <Smartphone className="mx-auto text-emerald-600 mb-6" size={56} />
          <h1 className="text-3xl font-bold mb-3">{isAr ? 'تطبيق أكاديمية الأثر' : 'Al-Athar Mobile App'}</h1>
          <p className="text-gray-600 mb-10">{isAr ? 'PWA — بدون متجر، تحديثات فورية، وصول للحصص والشهادات' : 'PWA — no store needed, instant updates, access lessons & certificates'}</p>

          <div className="space-y-4 text-right mb-10">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.ar} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                  <Icon className="text-emerald-600 shrink-0 mt-0.5" size={22} />
                  <p className="text-sm text-gray-700">{isAr ? s.ar : s.en}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <Link to={lp('/register/student')} className="btn-primary">{isAr ? 'إنشاء حساب' : 'Create account'}</Link>
            <Link to={lp('/settings/notifications')} className="text-emerald-700 font-medium hover:underline">{isAr ? 'فعّل الإشعارات ←' : 'Enable notifications →'}</Link>
            <Link to={lp('/leaderboard')} className="text-emerald-700 font-medium hover:underline">{isAr ? 'لوحة المتصدرين ←' : 'Leaderboard →'}</Link>
          </div>
        </div>
      </main>
      <GlobalFooter />
      <PwaInstallPrompt />
    </>
  );
}
