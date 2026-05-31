import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Medal, ArrowRight, ShieldCheck } from 'lucide-react';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

const FEATURES = [
  { icon: Gamepad2, ar: 'ألعاب تعليمية ممتعة', en: 'Fun educational games' },
  { icon: Trophy, ar: 'مكافآت ونقاط', en: 'Rewards & points' },
  { icon: Medal, ar: 'مسابقات شهرية', en: 'Monthly competitions' },
  { icon: ShieldCheck, ar: 'بيئة آمنة للأطفال', en: 'Safe environment for kids' },
];

export default function KidsProgram() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  return (
    <>
      <SEOHead page={{ url: '/programs/kids', title: isAr ? 'برنامج الأطفال' : 'Kids Program', description: isAr ? 'تعليم القرآن للأطفال بطريقة ممتعة' : 'Fun Quran learning for children' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <section className="py-20 px-4 text-center max-w-3xl mx-auto">
          <Gamepad2 className="mx-auto text-amber-500 mb-6" size={56} />
          <h1 className="text-4xl font-bold mb-4">{isAr ? 'برنامج الأطفال' : 'Kids Program'}</h1>
          <p className="text-gray-600 text-lg mb-8">{isAr ? 'حفظ القرآن والتجويد للأطفال — ألعاب ومكافآت ومسابقات' : 'Quran memorization for kids — games, rewards, and competitions'}</p>
          <Link to={localizedPath('/register/student', locale)} className="btn-primary inline-flex items-center gap-2">
            {isAr ? 'سجّل طفلك' : 'Register Your Child'} <ArrowRight size={18} />
          </Link>
        </section>
        <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.ar} className="bg-white rounded-2xl p-6 shadow-md">
                <Icon className="text-amber-500 mb-3" size={32} />
                <h3 className="font-bold text-lg">{isAr ? f.ar : f.en}</h3>
              </div>
            );
          })}
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
