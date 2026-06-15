import { useI18n } from '../../../i18n';
import { BookMarked, Mic, BookOpen, Award } from 'lucide-react';
import { useReveal, GoldDivider, TimelineStep } from './_shared';

export default function CourseTimelineSection() {
  const { locale } = useI18n();
  const ref = useReveal();

  const sectionLabel = locale === 'id' ? 'Alur Belajar' : locale === 'ar' ? 'مسار التعلم' : 'Learning Path';
  const heading = locale === 'id' ? 'Perjalanan Anda Dari Nol hingga Ijazah' : locale === 'ar' ? 'رحلتك من الصفر إلى الإجازة' : 'Your Journey from Zero to Ijazah';
  const desc = locale === 'id' ? 'Empat langkah terstruktur dari awal hingga menguasai bacaan' : locale === 'ar' ? 'أربع مراحل واضحة تأخذك من البداية حتى الاحتراف' : 'Four clear steps taking you from beginner to master';

  const steps = [
    { icon: BookMarked, label: locale === 'id' ? 'Pemula' : locale === 'ar' ? 'مبتدئ' : 'Beginner', title: locale === 'id' ? 'Belajar Membaca' : locale === 'ar' ? 'تعلّم القراءة' : 'Learn Reading', desc: locale === 'id' ? 'Dasar-dasar pelafalan & tajwid dengan guru ahli' : locale === 'ar' ? 'أساسيات النطق والتجويد مع معلم متخصص' : 'Pronunciation & Tajweed basics with an expert tutor', color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    { icon: Mic, label: locale === 'id' ? 'Menengah' : locale === 'ar' ? 'متوسط' : 'Intermediate', title: locale === 'id' ? 'Perbaiki Pelafalan' : locale === 'ar' ? 'صحّح التلاوة' : 'Correct Recitation', desc: locale === 'id' ? 'Analisis suara interaktif dengan AI secara instan' : locale === 'ar' ? 'تحليل صوتي بالذكاء الاصطناعي وتصحيح فوري' : 'Interactive AI audio analysis & instant feedback', color: 'bg-[var(--athar-gold)]', light: 'bg-[var(--athar-gold-100)]', text: 'text-[var(--athar-gold-muted)]' },
    { icon: BookOpen, label: locale === 'id' ? 'Lanjutan' : locale === 'ar' ? 'متقدم' : 'Advanced', title: locale === 'id' ? 'Mulai Hafalan' : locale === 'ar' ? 'ابدأ الحفظ' : 'Start Memorization', desc: locale === 'id' ? 'Sistem hafalan Sabak/Sabki/Manzil yang teruji' : locale === 'ar' ? 'نظام سباق/سبق/منزل المُثبَت علمياً' : 'Proven Sabak/Sabki/Manzil hifz system', color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    { icon: Award, label: locale === 'id' ? 'Lulusan' : locale === 'ar' ? 'خريج' : 'Graduate', title: locale === 'id' ? 'Dapatkan Sertifikat' : locale === 'ar' ? 'احصل على شهادتك' : 'Get Certified', desc: locale === 'id' ? 'Sertifikat resmi terverifikasi setelah lulus' : locale === 'ar' ? 'شهادة معتمدة رقمياً بعد إتمام الدورة' : 'Accredited digital certificate upon completion', color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal text-center max-w-2xl mx-auto mb-16">
          <span className="section-label mb-4">{sectionLabel}</span>
          <h2 className="section-heading mt-4">{heading}</h2>
          <GoldDivider center />
          <p className="section-desc mx-auto !mt-2">{desc}</p>
        </div>
        <div className="relative">
          <div className="absolute top-10 right-10 left-10 h-0.5 hidden lg:block" style={{ background: 'linear-gradient(90deg, var(--athar-gold-200), var(--athar-gold), var(--athar-gold-200))' }} aria-hidden="true" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <TimelineStep key={step.title} idx={idx} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}