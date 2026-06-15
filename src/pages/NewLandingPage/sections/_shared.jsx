import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../../i18n';
import { Star } from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.IntersectionObserver) {
      el.classList.add('visible');
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          obs.disconnect();
        }
      },
      { threshold: 0.02 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function AnimatedCounter({ end, suffix = '' }) {
  const { locale } = useI18n();
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start;
      const tick = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / 1800, 1);
        setCount(Math.floor(p * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString(locale === 'ar' ? 'ar-EG' : locale === 'id' ? 'id-ID' : 'en-US')}{suffix}</span>;
}

export function GoldDivider({ center = false }) {
  return (
    <div className={`gold-divider my-5 ${center ? 'mx-auto' : ''}`} aria-hidden="true" />
  );
}

export function FeatureCard({ Icon, bg, iconCls, title, desc, delay }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`glass-card p-7 reveal ${delay}`}>
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${bg} mb-5`}>
        <Icon className={iconCls} size={22} strokeWidth={1.5} />
      </div>
      <h3 className="font-naskh text-xl font-semibold text-[var(--athar-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--athar-text-muted)] leading-relaxed">{desc}</p>
    </div>
  );
}

export function TimelineStep({ icon: Icon, label, title, desc, color, light, text, idx }) {
  const ref = useReveal();
  return (
    <div key={title} ref={ref} className={`reveal reveal-delay-${idx + 1} flex flex-col items-center text-center`}>
      <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ${light} ring-4 ring-white shadow-md mb-5 group-hover:scale-110 transition-transform`}>
        <Icon className={text} size={28} strokeWidth={1.5} />
        <span className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full ${color} text-white text-xs font-bold ring-2 ring-white`}>
          {idx + 1}
        </span>
      </div>
      <span className={`text-xs font-semibold ${text} mb-1`}>{label}</span>
      <h3 className="font-naskh text-lg font-bold text-[var(--athar-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--athar-text-muted)] leading-relaxed">{desc}</p>
    </div>
  );
}

export function TeacherCard({ teacher, idx, gradients, locale, t }) {
  const ref = useReveal();
  return (
    <article key={teacher.id} ref={ref} className={`glass-card overflow-hidden !p-0 reveal reveal-delay-${idx + 1}`}>
      <div className="h-1 bg-gradient-to-r from-[var(--athar-gold-200)] via-[var(--athar-gold)] to-[var(--athar-gold-200)]" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[teacher.from]} text-2xl font-bold text-white shadow-md`}>
            {teacher.initial}
          </div>
          <div>
            <h3 className="font-naskh text-lg font-bold text-[var(--athar-text)]">{teacher.name}</h3>
            <p className="text-sm text-[var(--athar-gold-muted)]">{teacher.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-5">
          <Star className="text-amber-400 fill-amber-400" size={15} />
          <span className="font-semibold text-sm text-[var(--athar-text)]">{teacher.rating}</span>
          <span className="text-xs text-[var(--athar-text-muted)]">({teacher.reviews} {t.teachers.reviews})</span>
        </div>
        <LocalizedLink
          to={`/teachers/${teacher.id}`}
          locale={locale}
          className="btn-gold w-full justify-center text-sm !py-2.5"
        >
          {t.teachers.bookTrial}
        </LocalizedLink>
      </div>
    </article>
  );
}