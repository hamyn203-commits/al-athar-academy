import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import SEOHead from '../../components/SEOHead';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import {
  formatCurrencyPreview,
  formatZoneTime,
  v4AiSystems,
  v4Currencies,
  v4GrowthSystems,
  v4Kpis,
  v4Languages,
  v4LearningSystems,
  v4Markets,
  v4PortalSections,
  v4QuickActions,
  v4Roadmap,
  v4TeacherPipeline,
  v4TimeZones,
} from '../../data/v4Data';
import { ArrowLeft, Check, Globe2 } from 'lucide-react';

const sections = [
  { id: 'global', label: 'التوسع العالمي' },
  { id: 'operations', label: 'التشغيل واللوحات' },
  { id: 'learning', label: 'AI وLMS' },
  { id: 'growth', label: 'النمو والمستقبل' },
];

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="v4-section-title">
      <span className="badge-gold">{eyebrow}</span>
      <h2 className="text-gradient-gold">{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="v4-list">
      {items.map((item) => (
        <li key={item}>
          <Check size={16} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FeatureCard({ title, icon: Icon, items }) {
  return (
    <article className="premium-card v4-feature-card">
      <div className="v4-card-icon">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <BulletList items={items} />
    </article>
  );
}

function GlobalTab() {
  const { locale } = useI18n();
  const localizedMarkets = useMemo(
    () => v4Markets.map((market) => ({
      ...market,
      price: formatCurrencyPreview(market.currency, market.language === 'en' ? 'en-US' : 'ar-EG'),
    })),
    []
  );

  return (
    <div className="v4-tab-stack">
      <SectionTitle
        eyebrow="المرحلة الأولى"
        title="منصة قرآن عالمية متعددة الأسواق"
        description="كل سوق يظهر بخدماته ولغته وعملته، مع مسار SEO مستقل لكل لغة وسعر محلي قابل للتوسع."
      />

      <div className="v4-market-grid">
        {localizedMarkets.map((market) => (
          <Link
            to={localizedPath(`/markets/${market.slug}`, locale)}
            className="premium-card v4-market-card"
            key={market.slug}
          >
            <div>
              <span className="badge-terracotta">{market.currency} · {market.price}</span>
              <h3>{market.region}</h3>
              <p>{market.countries.join('، ')}</p>
            </div>
            <BulletList items={market.services} />
          </Link>
        ))}
      </div>

      <div className="v4-two-column">
        <article className="premium-card">
          <h3>نظام تعدد اللغات العالمي</h3>
          <div className="v4-language-grid">
            {v4Languages.map((lang) => (
              <div className="v4-language-row" key={lang.code}>
                <strong>{lang.name}</strong>
                <span>{lang.dir}</span>
                <code translate="no">{lang.seo}</code>
              </div>
            ))}
          </div>
        </article>

        <article className="premium-card">
          <h3>العملات والمناطق الزمنية</h3>
          <div className="v4-currency-strip">
            {v4Currencies.map((currency) => (
              <span key={currency}>{currency}</span>
            ))}
          </div>
          <div className="v4-zone-list">
            {v4TimeZones.map((zone) => (
              <div key={zone.zone}>
                <strong>{zone.city}</strong>
                <span>{formatZoneTime(zone.zone)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function OperationsTab() {
  return (
    <div className="v4-tab-stack">
      <SectionTitle
        eyebrow="العمليات"
        title="لوحات الطالب والمعلم وولي الأمر"
        description="واجهات تشغيلية تترجم متطلبات الملف إلى وحدات واضحة جاهزة للتوصيل بالبيانات الحقيقية."
      />

      <div className="v4-feature-grid">
        {v4PortalSections.map((section) => (
          <FeatureCard key={section.title} {...section} />
        ))}
      </div>

      <div className="premium-card v4-pipeline-card">
        <div>
          <span className="badge-gold">إدارة المعلمين العالمية</span>
          <h3>مسار تسجيل وتحقق وتقييم كامل</h3>
        </div>
        <div className="v4-pipeline">
          {v4TeacherPipeline.map((step, index) => (
            <div className="v4-pipeline-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningTab() {
  return (
    <div className="v4-tab-stack">
      <SectionTitle
        eyebrow="التعليم الذكي"
        title="AI للتلاوة ومنظومة LMS وشهادات"
        description="كل وحدة موضوعة كنظام مستقل: تحليل، تعليم، تقييم، اجتماعات، مكتبة، وشهادات تحقق."
      />

      <div className="v4-feature-grid">
        {v4AiSystems.map((system) => (
          <FeatureCard key={system.title} {...system} />
        ))}
      </div>

      <div className="v4-feature-grid compact">
        {v4LearningSystems.map((system) => (
          <FeatureCard key={system.title} {...system} />
        ))}
      </div>
    </div>
  );
}

function GrowthTab() {
  const links = [
    { to: '/donate', label: 'التبرعات' },
    { to: '/women', label: 'أكاديمية النساء' },
    { to: '/library', label: 'مكتبة الفيديو' },
    { to: '/careers', label: 'التوظيف' },
    { to: '/programs/reverts', label: 'المسلمون الجدد' },
    { to: '/programs/kids', label: 'برنامج الأطفال' },
  ];

  return (
    <div className="v4-tab-stack">
      <SectionTitle
        eyebrow="النمو العالمي"
        title="الأطفال، المسلمين الجدد، النساء، الموبايل، التبرعات والتوظيف"
        description="وحدات V4.2 جاهزة — اضغط للانتقال لكل قسم."
      />

      <div className="flex flex-wrap gap-3 mb-6">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="btn-premium-outline">{l.label}</Link>
        ))}
      </div>

      <div className="v4-feature-grid compact">
        {v4GrowthSystems.map((system) => (
          <FeatureCard key={system.title} {...system} />
        ))}
      </div>

      <div className="v4-roadmap">
        {v4Roadmap.map((item) => (
          <article className="premium-card" key={item.title}>
            <item.icon size={22} aria-hidden="true" />
            <span>{item.phase}</span>
            <h3>{item.title}</h3>
            <p>{item.status}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function GlobalPlatform() {
  return (
    <>
      <SEOHead page={{
        url: '/global-platform',
        title: 'أكاديمية الأثر V4 | منصة تعليم إسلامية عالمية',
        description: 'V4: توسع عالمي، 9 لغات، 6 أسواق، AI، LMS، لوحات تشغيل — ترقية أكاديمية الأثر.',
      }} />
      <Header />
      <main id="main-content" className="v4-page">
        <section className="v4-hero">
          <div className="v4-hero-content">
            <span className="badge-gold">
              <Globe2 size={16} aria-hidden="true" />
              Al-Athar Academy V4.0
            </span>
            <h1>أكاديمية الأثر العالمية</h1>
            <p>
              تحويل أكاديمية الأثر من أكاديمية لتحفيظ القرآن إلى منصة تعليم إسلامية عالمية متعددة اللغات، العملات، المناطق الزمنية، واللوحات التشغيلية مع دعم الذكاء الاصطناعي.
            </p>
            <div className="v4-actions">
              <Link to="/markets" className="btn-premium-outline">
                <Globe2 size={18} aria-hidden="true" />
                استكشاف الأسواق
              </Link>
              {v4QuickActions.slice(1).map((action) => (
                <button type="button" className="btn-premium-outline" key={action.label}>
                  <action.icon size={18} aria-hidden="true" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="v4-kpi-grid" aria-label="مؤشرات منصة V4">
            {v4Kpis.map((kpi) => (
              <article className="v4-kpi-card" key={kpi.label}>
                <kpi.icon size={22} aria-hidden="true" />
                <strong>{kpi.value}</strong>
                <span>{kpi.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="container v4-tabs-wrap">
          <nav className="v4-tabs" aria-label="أقسام منصة V4">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.label}
              </a>
            ))}
          </nav>

          <section id="global" className="v4-anchor-section">
            <GlobalTab />
          </section>
          <section id="operations" className="v4-anchor-section">
            <OperationsTab />
          </section>
          <section id="learning" className="v4-anchor-section">
            <LearningTab />
          </section>
          <section id="growth" className="v4-anchor-section">
            <GrowthTab />
          </section>

          <a className="v4-next-link" href="/#contact">
            ابدأ تفعيل المنظومة مع فريق الأكاديمية
            <ArrowLeft size={18} aria-hidden="true" />
          </a>
        </section>
      </main>
    </>
  );
}
