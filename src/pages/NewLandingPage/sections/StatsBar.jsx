import { useI18n } from '../../../i18n';
import { Users, GraduationCap, Globe, Clock } from 'lucide-react';
import { useReveal, AnimatedCounter } from './_shared';

export default function StatsBar() {
  const { t } = useI18n();
  const ref = useReveal();
  const stats = [
    { icon: Users, value: 5000, label: t.stats.students, suffix: '+' },
    { icon: GraduationCap, value: 200, label: t.stats.teachers, suffix: '+' },
    { icon: Globe, value: 38, label: t.stats.countries, suffix: '+' },
    { icon: Clock, value: 7600, label: t.stats.sessions, suffix: '+' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--athar-cream-dark)] rounded-2xl overflow-hidden shadow-sm ring-1 ring-[var(--athar-gold)]/20">
          {stats.map(({ icon: Icon, value, label, suffix }) => (
            <div key={label} className="bg-white flex flex-col items-center justify-center py-8 px-4 text-center group hover:bg-[var(--athar-gold-50)] transition-colors duration-200">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--athar-gold-100)] mb-3 group-hover:scale-110 transition-transform">
                <Icon className="text-[var(--athar-gold)]" size={22} strokeWidth={1.5} />
              </span>
              <p className="font-naskh text-3xl font-bold text-[var(--athar-text)]">
                <AnimatedCounter end={value} suffix={suffix} />
              </p>
              <p className="text-sm text-[var(--athar-text-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}