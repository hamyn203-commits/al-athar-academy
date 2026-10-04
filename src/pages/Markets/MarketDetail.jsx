import { Link, useParams, Navigate } from 'react-router-dom';
import { Clock3, Globe2, Users, BookOpen, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n';
import { getMarketBySlug } from '../../lib/market';
import { formatCurrencyPreview, formatZoneTime } from '../../data/v4Data';
import { localizedPath } from '../../lib/locale';
import { useMarket } from '../../context/MarketProvider';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import '../../styles/public-experience.css';

export default function MarketDetail() {
  const { slug } = useParams();
  const { locale } = useI18n();
  const { setMarket } = useMarket();
  const market = getMarketBySlug(slug);
  const isAr = locale === 'ar';

  if (!market) return <Navigate to={localizedPath('/markets', locale)} replace />;

  return (
    <>
      <SEOHead page={{ url:'/markets/'+slug, title:(isAr?market.region:market.regionEn)+' | Wahy Wa Namaa', description:isAr ? 'إعدادات وخدمات وحي ونماء لهذه المنطقة.' : 'Wahy Wa Namaa settings and services for this region.' }} />
      <GlobalHeader />
      <main className="wn-public-shell">
        <section className="wn-public-hero">
          <div className="page-container wn-public-hero__inner">
            <div>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> {isAr ? 'إعدادات المنطقة' : 'REGION SETTINGS'}</span>
              <h1>{isAr ? market.region : market.regionEn}</h1>
              <p>{market.countries.join(' · ')}</p>
              <div className="wn-detail-meta">
                <span>{market.currency}</span>
                <span><Clock3 size={14} /> {formatZoneTime(market.timezone,market.language==='en'?'en-US':'ar-EG')}</span>
                <span>{formatCurrencyPreview(market.currency,market.language==='en'?'en-US':'ar-EG')}</span>
              </div>
            </div>
            <div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit" /><div className="wn-public-orbit__core"><Globe2 size={46} strokeWidth={1.25} /></div></div>
          </div>
        </section>

        <section className="page-container wn-public-copy-section">
          <div className="wn-public-feature-grid">
            {market.services.map((service) => <article key={service} className="wn-public-feature-card"><span><BookOpen size={20}/></span><h3>{service}</h3></article>)}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <button type="button" onClick={() => setMarket(market.slug)} className="wn-btn wn-btn--primary">{isAr?'استخدام هذه المنطقة':'Use this region'}</button>
            <Link to={localizedPath('/teachers?market='+market.slug,locale)} className="wn-btn wn-btn--secondary"><Users size={16}/>{isAr?'استكشف المعلمين':'Explore teachers'}</Link>
            <Link to={localizedPath('/register/student',locale)} className="wn-btn wn-btn--secondary">{isAr?'إنشاء حساب طالب':'Create learner account'}</Link>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
