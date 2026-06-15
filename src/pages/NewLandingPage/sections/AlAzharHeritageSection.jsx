import { useI18n } from '../../../i18n';
import { useMarket } from '../../../context/MarketProvider';
import { Award, Globe, BookOpen } from 'lucide-react';
import { useReveal } from './_shared';

export default function AlAzharHeritageSection() {
  const { locale } = useI18n();
  const { marketSlug } = useMarket();
  const isIndonesian = marketSlug === 'indonesia-malaysia';
  const ref = useReveal();

  const points = [
    {
      title: locale === 'id' ? 'Silsilah Sanad Bersambung' : locale === 'ar' ? 'سند متصل متواتر' : 'Connected Sanad Chain',
      desc: locale === 'id' ? 'Guru kami memegang Ijazah & Sanad hafalan Quran yang bersambung langsung hingga Rasulullah ﷺ.' : locale === 'ar' ? 'إجازة وسند متصل من المعلم إلى التابعين ثم إلى رسول الله ﷺ في الحفظ والإتقان.' : 'Our tutors hold verified Ijazah and Sanad certificates going back to the Prophet ﷺ.',
      icon: Award
    },
    {
      title: locale === 'id' ? 'Pengajar Asli Mesir (Native)' : locale === 'ar' ? 'معلمون عرب من مصر' : 'Native Egyptian Scholars',
      desc: locale === 'id' ? 'Interaksi langsung dengan Ustadz/Ustadzah Mesir untuk melatih makhraj & lahjah Arabiyah yang fasih.' : locale === 'ar' ? 'تحدث ونطق سليم مع شيوخ مصريين ناطقين بالعربية الفصحى لضبط مخارج الحروف.' : 'Direct interaction with Cairo-based tutors to perfect your Arabic pronunciation and accent.',
      icon: Globe
    },
    {
      title: locale === 'id' ? 'Standar Kurikulum Azhari' : locale === 'ar' ? 'منهجية الأزهر الشريف' : 'Azhari Curriculum',
      desc: locale === 'id' ? 'Kurikulum terstruktur yang menggabungkan metode Iqro, tajwid teoretis, dan takhrij hafalan secara bertahap.' : locale === 'ar' ? 'منهج تعليمي منظم يجمع بين تصحيح التلاوة، التجويد النظري، والضبط العملي المتدرج.' : 'A structured methodology combining practical recitation, theoretical Tajweed, and gradual hifz.',
      icon: BookOpen
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[var(--athar-navy)] text-white">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='0.25' stroke-width='0.5'%3E%3Cpath d='M40 0 C40 20, 20 40, 0 40 C20 40, 40 60, 40 80 C40 60, 60 40, 80 40 C60 40, 40 20, 40 0 Z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--athar-gold)]/10 blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="page-container relative z-10">
        <div ref={ref} className="reveal text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--athar-gold)]/40 bg-[var(--athar-gold)]/10 px-3.5 py-1 text-xs font-semibold text-[var(--athar-gold-light)] mb-4">
            <Award size={12} />
            {locale === 'id' ? 'Keunggulan Akademik' : locale === 'ar' ? 'أصالة السند العلمي' : 'Academic Excellence'}
          </span>
          <h2 className="font-naskh text-4xl md:text-5xl font-bold leading-tight text-white mb-6">
            {locale === 'id' ? 'Sanad & Pengajar Al-Azhar Mesir' : locale === 'ar' ? 'السند الأزهري المتصل بالرسول ﷺ' : 'Azhari Sanad & Academic Heritage'}
          </h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            {locale === 'id' ? 'Belajar mengaji langsung dengan guru-guru lulusan Universitas Al-Azhar Kairo, Mesir yang memiliki Sanad (silsilah) periwayatan Quran yang bersambung.' : locale === 'ar' ? 'تعلّم القرآن الكريم بالتجويد ومخارج الحروف مع شيوخ ومعلمات مجازين من الأزهر الشريف بسند متصل إلى النبي صلى الله عليه وسلم.' : 'Learn Quran and Tajweed directly from native scholars graduated from Al-Azhar University in Cairo, holding authentic Sanad chains.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {points.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-[var(--athar-gold)]/40 transition-all duration-300 group shadow-lg">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--athar-gold)]/20 border border-[var(--athar-gold)]/30 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="text-[var(--athar-gold-light)]" size={24} />
                </span>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--athar-gold-light)] transition-colors">{pt.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{pt.desc}</p>
              </div>
            );
          })}
        </div>

        {isIndonesian && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-950/40 via-emerald-900/40 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 max-w-2xl mx-auto shadow-md">
              <span className="text-3xl">🇮🇩</span>
              <p className="text-left text-xs md:text-sm text-emerald-200 leading-relaxed">
                <strong>Catatan Khusus Indonesia:</strong> Kami memahami pentingnya Sanad dari Syekh Mesir. Semua kelas privat di Al-Athar diampu langsung oleh lulusan Al-Azhar Kairo asli Arab, bukan guru lokal.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}