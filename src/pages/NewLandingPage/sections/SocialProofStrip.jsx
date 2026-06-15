import { useI18n } from '../../../i18n';
import { Quote } from 'lucide-react';

const getTestimonialItems = (locale) => {
  if (locale === 'id') {
    return [
      { name: 'Ahmad Mahmud', country: '🇪🇬 Mesir', text: 'Pengalaman luar biasa! Saya belajar Al-Quran secara terstruktur.' },
      { name: 'Sarah Johnson', country: '🇺🇸 AS', text: 'Guru profesional dan jadwal yang fleksibel.' },
      { name: 'Muhammad Al-Amri', country: '🇸🇦 Arab Saudi', text: 'Platform luar biasa untuk menghafal dengan guru bersertifikat.' },
      { name: 'Siti Rahma', country: '🇮🇩 Indonesia', text: 'Sangat terbantu belajar makhraj langsung dengan Syekh Mesir.' },
      { name: 'Yusuf Bakar', country: '🇹🇷 Turki', text: 'Platform terbaik untuk belajar Tajwid dalam bahasa Arab.' },
      { name: 'Fatima Al-Zahra', country: '🇲🇾 Malaysia', text: 'Anak-anak saya sangat menyukai program anak-anak!' },
    ];
  }
  if (locale === 'ar') {
    return [
      { name: 'أحمد محمود', country: '🇪🇬 مصر', text: 'تجربة رائعة! تعلمت القرآن بطريقة منظمة.' },
      { name: 'سارة جونسون', country: '🇺🇸 أمريكا', text: 'معلمون محترفون وجداول مرنة للغاية.' },
      { name: 'محمد العمري', country: '🇸🇦 السعودية', text: 'منصة ممتازة للحفظ مع معلمين مجازين.' },
      { name: 'أمينة حسن', country: '🇬🇧 بريطانيا', text: 'أداة التلاوة بالذكاء الاصطناعي مذهلة حقًا.' },
      { name: 'يوسف بكر', country: '🇹🇷 تركيا', text: 'أفضل منصة لتعلم التجويد بالعربية.' },
      { name: 'فاطمة الزهراء', country: '🇲🇾 ماليزيا', text: 'أطفالي يحبون برنامج الأطفال كثيراً!' },
    ];
  }
  return [
    { name: 'Ahmad Mahmoud', country: '🇪🇬 Egypt', text: 'Great experience! I learned Quran in an organized way.' },
    { name: 'Sarah Johnson', country: '🇺🇸 USA', text: 'Professional teachers and flexible scheduling.' },
    { name: 'Mohamed Al-Omari', country: '🇸🇦 KSA', text: 'Excellent platform for hifz with certified teachers.' },
    { name: 'Amina Hassan', country: '🇬🇧 UK', text: 'The AI recitation tool is simply incredible.' },
    { name: 'Yusuf Bakar', country: '🇹🇷 Turkey', text: 'Best platform to learn Tajweed in Arabic.' },
    { name: 'Fatima Al-Zahra', country: '🇲🇾 Malaysia', text: 'My kids love the kids program so much!' },
  ];
};

export default function SocialProofStrip() {
  const { locale } = useI18n();
  const items = getTestimonialItems(locale);
  const doubled = [...items, ...items];
  return (
    <section className="border-y border-[var(--athar-cream-dark)] bg-white py-5 overflow-hidden" aria-label="آراء الطلاب">
      <div className="marquee-track gap-5">
        {doubled.map((item, i) => (
          <div key={i} className="flex-shrink-0 flex items-center gap-3 rounded-2xl border border-[var(--athar-cream-dark)] bg-[var(--athar-gold-50)] px-5 py-3 mx-2.5" style={{ minWidth: '260px' }}>
            <Quote size={16} className="text-[var(--athar-gold)] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-[var(--athar-text-muted)] line-clamp-1">"{item.text}"</p>
              <p className="text-xs font-semibold text-[var(--athar-text)] mt-0.5">{item.name} · {item.country}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}