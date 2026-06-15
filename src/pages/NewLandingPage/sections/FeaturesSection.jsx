import { useI18n } from '../../../i18n';
import { Shield, Clock, BookOpen, Award, Globe, Sparkles } from 'lucide-react';
import { useReveal, GoldDivider, FeatureCard } from './_shared';

export default function FeaturesSection() {
  const { t, locale } = useI18n();
  const ref = useReveal();

  const features = [
    { Icon: Shield, bg: 'bg-emerald-50', iconCls: 'text-emerald-600', title: t.features.feature1.title, desc: t.features.feature1.description, delay: '' },
    { Icon: Clock, bg: 'bg-blue-50', iconCls: 'text-blue-600', title: t.features.feature2.title, desc: t.features.feature2.description, delay: 'reveal-delay-1' },
    { Icon: BookOpen, bg: 'bg-purple-50', iconCls: 'text-purple-600', title: t.features.feature3.title, desc: t.features.feature3.description, delay: 'reveal-delay-2' },
    { Icon: Award, bg: 'bg-amber-50', iconCls: 'text-amber-600', title: t.features.feature4.title, desc: t.features.feature4.description, delay: 'reveal-delay-3' },
    { Icon: Globe, bg: 'bg-indigo-50', iconCls: 'text-indigo-600', title: t.features.feature5.title, desc: t.features.feature5.description, delay: 'reveal-delay-4' },
    { Icon: Sparkles, bg: 'bg-rose-50', iconCls: 'text-rose-600', title: t.features.feature6.title, desc: t.features.feature6.description, delay: 'reveal-delay-5' },
  ];

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, var(--athar-gold-50) 0%, #fff 40%, var(--athar-gold-50) 100%)' }}>
      <div className="absolute top-0 left-0 w-64 h-64 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.15' stroke-width='1'%3E%3Cpath d='M100 20l12 36 36 12-36 12-12 36-12-36-36-12 36-12z'/%3E%3Cpath d='M100 60l6 18 18 6-18 6-6 18-6-18-18-6 18-6z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
      }} aria-hidden="true" />
      <div className="page-container relative">
        <div ref={ref} className="reveal max-w-2xl mb-14">
          <span className="section-label mb-4">{locale === 'id' ? 'Mengapa Al-Athar?' : locale === 'ar' ? 'لماذا الأثر؟' : 'Why Al-Athar?'}</span>
          <h2 className="section-heading mt-4">{t.features.title}</h2>
          <GoldDivider />
          <p className="section-desc !mt-2">{t.features.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}