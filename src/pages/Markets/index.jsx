import { Link } from 'react-router-dom';
import { Globe2, ArrowRight, MapPinned } from 'lucide-react';
import { useI18n } from '../../i18n';
import { v4Markets, formatCurrencyPreview } from '../../data/v4Data';
import { localizedPath } from '../../lib/locale';
import { useMarket } from '../../context/MarketProvider';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

export default function MarketsIndex() {
  const { locale, t } = useI18n();
  const { marketSlug } = useMarket();
  const isAr = locale === 'ar';

  return (
    <>
      <SEOHead page={{
        url: '/markets',
        title: isAr ? 'أسواق أكاديمية الأثر العالمية | V4' : 'Al-Athar Global Markets | V4',
        description: isAr
          ? 'اختر سوقك: العربي، الأمريكي، الأوروبي، التركي، الإندونيسي، جنوب آسيا — أسعار وعملات محلية.'
          : 'Choose your market: Arab World, Americas, Europe, Turkey, Indonesia, South Asia — local pricing.',
      }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-sm font-semibold mb-4">
              <Globe2 size={16} /> V4 · {isAr ? 'التوسع العالمي' : 'Global Expansion'}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isAr ? 'أسواق أكاديمية الأثر' : 'Al-Athar Academy Markets'}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isAr
                ? 'كل سوق بخدماته ولغته وعملته ومنطقته الزمنية — اختر الأقرب إليك.'
                : 'Each market with its services, language, currency, and timezone — pick yours.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {v4Markets.map((m) => (
              <Link
                key={m.slug}
                to={localizedPath(`/markets/${m.slug}`, locale)}
                className={`block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition border-2 ${
                  marketSlug === m.slug ? 'border-emerald-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <MapPinned className="text-emerald-600" size={28} />
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    {formatCurrencyPreview(m.currency, m.language === 'en' ? 'en-US' : 'ar-EG')}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">{isAr ? m.region : m.regionEn}</h2>
                <p className="text-sm text-gray-500 mb-4">{m.countries.slice(0, 4).join(isAr ? '، ' : ', ')}…</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  {m.services.slice(0, 3).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                  {isAr ? 'استكشف السوق' : 'Explore market'} <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to={localizedPath('/teachers', locale)} className="btn-primary inline-flex items-center gap-2">
              {t?.teachers?.title || (isAr ? 'تصفح المعلمين' : 'Browse teachers')}
            </Link>
          </div>
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
