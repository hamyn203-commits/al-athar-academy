import { useState, useEffect } from 'react';
import { useI18n } from '../../../i18n';
import { Zap, Mic, BookOpen, Sparkles, ArrowLeft, Play } from 'lucide-react';
import LocalizedLink from '../../../components/LocalizedLink';
import { useReveal, GoldDivider } from './_shared';

const BAR_HEIGHTS = [12, 10, 16, 8, 13, 9, 14, 7, 11, 15];

export default function AISectionModern() {
  const { locale } = useI18n();
  const ref = useReveal();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState(-1);
  const [scores, setScores] = useState({ tajweed: 82, makharij: 78, waqf: 85 });

  useEffect(() => {
    if (!isPlaying) { setCurrentWord(-1); return; }
    const timers = [
      setTimeout(() => { setCurrentWord(0); setScores(prev => ({ ...prev, makharij: 83 })); }, 800),
      setTimeout(() => { setCurrentWord(1); setScores(prev => ({ ...prev, waqf: 88 })); }, 1800),
      setTimeout(() => { setCurrentWord(2); setScores(prev => ({ ...prev, tajweed: 70 })); }, 2800),
      setTimeout(() => { setCurrentWord(3); setScores({ tajweed: 89, makharij: 88, waqf: 92 }); }, 4200),
      setTimeout(() => setIsPlaying(false), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isPlaying]);

  const words = [
    { text: "الْحَمْدُ", correct: true },
    { text: "لِلَّهِ", correct: true },
    { text: "رَبِّ", correct: false, errorText: locale === 'id' ? 'Peringatan Harakat: Dibaca dhommah (Rabbu) padahal seharusnya kasrah (Rabbi)' : locale === 'ar' ? 'تنبيه تشكيل: نُطقت بالضم (رَبُّ) والموضع مجرور بالكسرة (رَبِّ)' : 'Harakat Warning: Pronounced with dhommah (Rabbu) instead of kasrah (Rabbi)' },
    { text: "الْعَالَمِينَ", correct: true }
  ];

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--athar-gold-50) 0%, var(--athar-gold-100) 50%, var(--athar-gold-50) 100%)' }}>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.25' stroke-width='0.7'%3E%3Cpath d='M60 12l8 24 24 8-24 8-8 24-8-24-24-8 24-8z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} aria-hidden="true" />
      <div className="page-container relative">
        <div ref={ref} className="reveal grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="section-label mb-4"><Zap size={14} aria-hidden="true" />{locale === 'id' ? 'Didukung AI' : locale === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}</span>
            <h2 className="font-naskh text-4xl font-bold text-[var(--athar-text)] mt-4">{locale === 'id' ? 'Pusat AI Penghafalan' : locale === 'ar' ? 'مركز AI لرحلة الحفظ' : 'AI Hub for Hifz'}</h2>
            <GoldDivider />
            <p className="text-[var(--athar-text-muted)] leading-relaxed">{locale === 'id' ? 'Asisten Quran, analisis suara tajwid, dan rencana hifz harian — seperti platform Hifz global terbaik.' : locale === 'ar' ? 'مساعد قرآن، تحليل تلاوة بالصوت، وخطط حفظ يومية — مثل أفضل منصات Hifz العالمية.' : 'Quran assistant, voice analysis, and daily hifz planner — like the top global Hifz platforms.'}</p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Mic, text: locale === 'id' ? 'Analisis tajwid & bacaan suara' : locale === 'ar' ? 'تحليل التجويد والتلاوة بالصوت' : 'Tajweed & voice analysis' },
                { icon: BookOpen, text: locale === 'id' ? 'Rencana harian Sabak / Sabki / Manzil' : locale === 'ar' ? 'خطط سباق / سبق / منزل يومية' : 'Daily Sabak / Sabki / Manzil plans' },
                { icon: Sparkles, text: locale === 'id' ? 'Asisten pintar untuk guru & siswa' : locale === 'ar' ? 'مساعد ذكي للمعلم والطالب' : 'Smart assistant for tutor & student' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-[var(--athar-text)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 shadow-sm border border-[var(--athar-gold)]/20">
                    <Icon size={16} className="text-[var(--athar-gold)]" strokeWidth={1.5} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <LocalizedLink to="/ai" locale={locale} className="btn-gold mt-8 inline-flex">
              {locale === 'id' ? 'Coba Pusat AI' : locale === 'ar' ? 'جرّب مركز AI' : 'Try AI Center'}
              <ArrowLeft size={18} aria-hidden="true" />
            </LocalizedLink>
          </div>

          <div className="glass-card p-7 border-2 transition-all relative overflow-hidden" style={{ borderColor: isPlaying ? 'var(--athar-gold)' : 'rgba(201,162,39,0.2)' }}>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-[var(--athar-gold-100)] text-[var(--athar-gold)]'}`}>
                  {isPlaying ? <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" /> : <Mic size={18} strokeWidth={1.5} />}
                </span>
                <div>
                  <p className="text-xs text-[var(--athar-text-muted)]">{isPlaying ? (locale === 'id' ? 'Mendengarkan bacaan...' : locale === 'ar' ? 'جاري الاستماع للتلاوة...' : 'Listening...') : (locale === 'id' ? 'Simulasi Rekaman' : locale === 'ar' ? 'محاكاة تلاوة تجريبية' : 'Simulated Recitation')}</p>
                  <p className="text-sm font-semibold text-[var(--athar-text)]">{locale === 'id' ? 'Surah Al-Fatihah (Ayat 2)' : locale === 'ar' ? 'سورة الفاتحة (الآية 2)' : 'Surah Al-Fatihah (Verse 2)'}</p>
                </div>
              </div>
              <button onClick={() => setIsPlaying(!isPlaying)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition shadow-sm ${isPlaying ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-[var(--athar-gold-100)] text-[var(--athar-gold-muted)] border border-[var(--athar-gold)]/30 hover:bg-[var(--athar-gold-200)]'}`}>
                <Play size={10} className={isPlaying ? 'hidden' : 'inline'} />
                {isPlaying ? (locale === 'id' ? 'Hentikan Demo' : locale === 'ar' ? 'إيقاف المحاكاة' : 'Stop Demo') : (locale === 'id' ? 'Mulai Demo' : locale === 'ar' ? 'تشغيل المحاكاة' : 'Start Demo')}
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-center">
              <p className="font-naskh text-2xl font-bold leading-loose text-slate-800 flex items-center justify-center gap-2 flex-wrap">
                {words.map((w, idx) => {
                  const isHighlighted = idx === currentWord;
                  const isPast = idx < currentWord;
                  let colorClass = 'text-slate-400';
                  if (isHighlighted) colorClass = w.correct ? 'text-emerald-600 font-extrabold scale-105' : 'text-red-600 font-extrabold scale-105';
                  else if (isPast) colorClass = w.correct ? 'text-slate-800' : 'text-red-500';
                  return (
                    <span key={idx} className={`transition-all duration-300 relative group cursor-help ${colorClass}`}>
                      {w.text}
                      {!w.correct && idx <= currentWord && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 z-10 pointer-events-none leading-normal">
                          {w.errorText}
                        </span>
                      )}
                    </span>
                  );
                })}
              </p>
              <div className="flex items-center justify-center gap-1 h-6 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                  <div key={bar} className="w-1 rounded-full bg-[var(--athar-gold)] transition-all duration-300" style={{ height: isPlaying ? `${BAR_HEIGHTS[bar - 1]}px` : '4px', opacity: isPlaying ? 0.8 : 0.3 }} />
                ))}
              </div>
            </div>

            {[
              { label: locale === 'id' ? 'Tajwid & Intonasi' : locale === 'ar' ? 'التجويد ونبرات الصوت' : 'Tajweed & Intonation', val: scores.tajweed, color: 'bg-[var(--athar-gold)]' },
              { label: locale === 'id' ? 'Makhraj Huruf' : locale === 'ar' ? 'مخارج الحروف الفموية' : 'Makhraj & Articulation', val: scores.makharij, color: 'bg-emerald-500' },
              { label: locale === 'id' ? 'Waqaf & Ibtida' : locale === 'ar' ? 'الوقف والابتداء والقراءة الصحيحة' : 'Waqf & Recitation Flow', val: scores.waqf, color: 'bg-blue-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--athar-text-muted)]">{label}</span>
                  <span className="font-bold text-[var(--athar-text)]">{val}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--athar-gold-200)] overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}

            <p className="mt-4 text-xs text-[var(--athar-text-muted)] border-t border-[var(--athar-gold)]/20 pt-4 text-center">
              {isPlaying ? (locale === 'id' ? 'AI sedang menganalisis dan mencocokkan bacaan...' : locale === 'ar' ? 'الذكاء الاصطناعي يقوم بتحليل التلاوة ومطابقتها...' : 'AI is analyzing and matching the recitation...') : (locale === 'id' ? 'Coba bacaan suara Anda di dasbor siswa untuk penilaian instan' : locale === 'ar' ? 'جرّب التلاوة بصوتك في لوحة الطالب للحصول على تقييم فوري' : 'Try reciting in the student dashboard for instant feedback')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}