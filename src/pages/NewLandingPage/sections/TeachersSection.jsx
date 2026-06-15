import { useI18n } from '../../../i18n';
import LocalizedLink from '../../../components/LocalizedLink';
import { useReveal, GoldDivider, TeacherCard } from './_shared';

export default function TeachersSection() {
  const { t, locale } = useI18n();
  const ref = useReveal();

  const teachers = [
    { id: 1, name: locale === 'id' ? 'Syekh Ahmad Muhammad' : locale === 'ar' ? 'الشيخ أحمد محمد' : 'Sheikh Ahmad Muhammad', specialty: locale === 'id' ? 'Tahfidz Al-Quran' : locale === 'ar' ? 'تحفيظ القرآن' : 'Quran Memorization', rating: 4.9, reviews: 120, initial: locale === 'ar' ? 'أ' : 'A', from: 'emerald' },
    { id: 2, name: locale === 'id' ? 'Syekhah Fatima Ali' : locale === 'ar' ? 'الشيخة فاطمة علي' : 'Sheikha Fatima Ali', specialty: locale === 'id' ? 'Tajwid' : locale === 'ar' ? 'التجويد' : 'Tajweed', rating: 4.8, reviews: 95, initial: locale === 'ar' ? 'ف' : 'F', from: 'amber' },
    { id: 3, name: locale === 'id' ? 'Syekh Umar Hasan' : locale === 'ar' ? 'الشيخ عمر حسن' : 'Sheikh Omar Hassan', specialty: locale === 'id' ? 'Bahasa Arab' : locale === 'ar' ? 'اللغة العربية' : 'Arabic Language', rating: 4.9, reviews: 150, initial: locale === 'ar' ? 'ع' : 'U', from: 'blue' },
  ];

  const gradients = {
    emerald: 'from-emerald-400 to-teal-600',
    amber: 'from-amber-400 to-orange-500',
    blue: 'from-blue-400 to-indigo-600',
  };

  return (
    <section className="py-24 bg-white">
      <div className="page-container">
        <div ref={ref} className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <span className="section-label mb-4">{locale === 'id' ? 'Pengajar Unggulan' : locale === 'ar' ? 'نخبة المعلمين' : 'Featured Tutors'}</span>
            <h2 className="section-heading mt-4">{t.teachers.title}</h2>
            <GoldDivider />
            <p className="section-desc !mx-0 !mt-2">{t.teachers.subtitle}</p>
          </div>
          <LocalizedLink to="/teachers" locale={locale} className="btn-secondary shrink-0">{t.teachers.viewAll}</LocalizedLink>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {teachers.map((teacher, idx) => (
            <TeacherCard key={teacher.id} teacher={teacher} idx={idx} gradients={gradients} locale={locale} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}