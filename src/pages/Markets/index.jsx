import { Link } from 'react-router-dom';
import { Globe2, ArrowLeft, ArrowRight, MapPinned, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n';
import { v4Markets, formatCurrencyPreview } from '../../data/v4Data';
import { localizedPath } from '../../lib/locale';
import { useMarket } from '../../context/MarketProvider';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import '../../styles/public-experience.css';

export default function MarketsIndex() {
  const { locale } = useI18n();
  const { marketSlug } = useMarket();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <>
      <SEOHead page={{ url:'/markets', title:isAr ? 'الأسواق والمناطق | وحي ونماء' : 'Markets | Wahy Wa Namaa', description:isAr ? 'اختر المنطقة الأقرب لك لعرض الإعدادات المحلية المتاحة.' : 'Choose the region closest to you to view available local settings.' }} />
      <GlobalHeader />
      <main className="wn-public-shell">
        <section className="wn-public-hero">
          <div className="page-container wn-public-hero__inner">
            <div>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> {isAr ? 'تعلم من أي مكان' : 'LEARN FROM ANYWHERE'}</span>
              <h1>{isAr ? 'اختر المنطقة الأقرب لك' : 'Choose the region closest to you'}</h1>
              <p>{isAr ? 'تساعد إعدادات السوق على عرض العملة والمنطقة الزمنية والخدمات المتاحة بصورة أنسب للمستخدم.' : 'Market settings help present currency, timezone, and available services in a way that better fits the learner.'}</p>
            </div>
            <div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit" /><div className="wn-public-orbit__core"><Globe2 size={46} strokeWidth={1.25} /></div></div>
          </div>
        </section>

        <section className="page-container wn-public-copy-section">
          <div className="wn-ecosystem-grid">
            {v4Markets.map((market) => (
              <Link key={market.slug} to={localizedPath('/markets/'+market.slug,locale)} className={'wn-market-card '+(marketSlug===market.slug?'is-active':'')}>
                <div className="flex items-start justify-between gap-3">
                  <MapPinned size={23} className="text-[var(--wn-emerald)]" />
                  <span className="text-[11px] font-bold text-[var(--wn-gold-dark)]">{market.currency} · {formatCurrencyPreview(market.currency, market.language==='en'?'en-US':'ar-EG')}</span>
                </div>
                <h2 className="mt-3">{isAr ? market.region : market.regionEn}</h2>
                <p className="mt-1">{market.countries.slice(0,4).join(isAr?'، ':', ')}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-[var(--wn-emerald-dark)]">{isAr ? 'تفاصيل المنطقة' : 'Region details'} <ArrowIcon size={13} /></span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
