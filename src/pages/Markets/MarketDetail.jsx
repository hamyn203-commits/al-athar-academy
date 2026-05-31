import { Link, useParams, Navigate } from 'react-router-dom';
import { Clock3, Globe2, Users, BookOpen } from 'lucide-react';
import { useI18n } from '../../i18n';
import { getMarketBySlug } from '../../lib/market';
import { formatCurrencyPreview, formatZoneTime } from '../../data/v4Data';
import { localizedPath } from '../../lib/locale';
import { useMarket } from '../../context/MarketProvider';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

export default function MarketDetail() {
  const { slug } = useParams();
  const { locale } = useI18n();
  const { setMarket } = useMarket();
  const market = getMarketBySlug(slug);
  const isAr = locale === 'ar';

  if (!market) return <Navigate to={localizedPath('/markets', locale)} replace />;

  const selectMarket = () => setMarket(market.slug);

  return (
    <>
      <SEOHead page={{
        url: `/markets/${slug}`,
        title: isAr ? `${market.region} | أكاديمية الأثر V4` : `${market.regionEn} | Al-Athar V4`,
        description: isAr
          ? `تحفيظ القرآن في ${market.region} — ${market.currency} · ${market.timezone}`
          : `Quran education in ${market.regionEn} — ${market.currency} · ${market.timezone}`,
      }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <section className="py-16 px-4 bg-gradient-to-r from-emerald-700 to-green-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Globe2 className="mx-auto mb-4 opacity-90" size={48} />
            <h1 className="text-4xl font-bold mb-4">{isAr ? market.region : market.regionEn}</h1>
            <p className="text-emerald-100 text-lg mb-6">{market.countries.join(isAr ? ' · ' : ' · ')}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">{market.currency}</span>
              <span className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                <Clock3 size={16} />
                {formatZoneTime(market.timezone, market.language === 'en' ? 'en-US' : 'ar-EG')}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full">
                {formatCurrencyPreview(market.currency, market.language === 'en' ? 'en-US' : 'ar-EG')} / {isAr ? 'جلسة' : 'session'}
              </span>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold mb-6">{isAr ? 'الخدمات المتاحة' : 'Available Services'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {market.services.map((s) => (
              <div key={s} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow">
                <BookOpen className="text-emerald-600 shrink-0" size={22} />
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button type="button" onClick={selectMarket} className="btn-primary">
              {isAr ? 'اختر هذا السوق' : 'Select this market'}
            </button>
            <Link
              to={localizedPath(`/teachers?market=${market.slug}`, locale)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Users size={18} />
              {isAr ? 'معلمون في هذا السوق' : 'Teachers in this market'}
            </Link>
            <Link to={localizedPath('/register/student', locale)} className="btn-secondary">
              {isAr ? 'سجّل كطالب' : 'Register as student'}
            </Link>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
