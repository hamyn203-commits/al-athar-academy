import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Gift,
  Star,
  Sparkles,
  Clock,
  Heart,
  Calendar,
  CheckCircle,
  Crown,
  Share2,
  Users,
  ChevronRight,
  BookOpen,
  Volume2
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { Link } from 'react-router-dom';
import { localizedPath } from '../../lib/locale';

export default function KidsCompetitionsAndAwards() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  // Semi-annual countdown calculation (Target: next 6-month cycle date)
  const [timeLeft, setTimeLeft] = useState({
    days: 42,
    hours: 14,
    minutes: 36,
    seconds: 18,
  });

  useEffect(() => {
    // Dynamic countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Little Champions Data
  const [champions, setChampions] = useState([
    {
      id: 1,
      name: isAr ? 'عبد الرحمن أحمد' : 'Abdulrahman Ahmed',
      age: 10,
      country: isAr ? 'مصر 🇪🇬' : 'Egypt 🇪🇬',
      branch: isAr ? 'فرع حفظ القرآن كاملاً' : 'Full Quran Recitation',
      award: isAr ? 'تاج الوقار الذهبي (المركز الأول)' : 'Golden Crown of Dignity (1st Place)',
      badgeColor: 'from-amber-400 to-amber-600',
      avatarBg: 'bg-amber-100 text-amber-900 border-amber-300',
      cheers: 428,
      achievement: isAr ? 'أتم الختمة مع إتقان متن الجزرية بدون أي خطأ' : 'Completed memorization with full Jazariyyah'
    },
    {
      id: 2,
      name: isAr ? 'مريم إبراهيم' : 'Maryam Ibrahim',
      age: 8,
      country: isAr ? 'السعودية 🇸🇦' : 'Saudi Arabia 🇸🇦',
      branch: isAr ? 'فرع الـ 5 أجزاء + تحفة الأطفال' : '5 Juz + Tuhfat Al-Atfal',
      award: isAr ? 'وسام الترتيل الندي (المركز الأول)' : 'Sweet Recitation Medal (1st Place)',
      badgeColor: 'from-emerald-400 to-teal-600',
      avatarBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      cheers: 395,
      achievement: isAr ? 'صوت عذب ندي وتطبيق متقن لأحكام الغنن والمدود' : 'Angelic recitation with perfect Tajweed application'
    },
    {
      id: 3,
      name: isAr ? 'عمر كمال' : 'Omar Kamal',
      age: 6,
      country: isAr ? 'بريطانيا 🇬🇧' : 'United Kingdom 🇬🇧',
      branch: isAr ? 'فرع البراعم ونور البيان' : 'Young Buds & Noor Al-Bayan',
      award: isAr ? 'وسام فصاحة اللسان ومخارج الحروف' : 'Phonetic Articulation Medal',
      badgeColor: 'from-blue-400 to-indigo-600',
      avatarBg: 'bg-blue-100 text-blue-900 border-blue-300',
      cheers: 312,
      achievement: isAr ? 'إتقان قراءة الكلمات بالرسم العثماني خلال 3 أشهر فقط' : 'Mastered reading Ottoman script in just 3 months'
    },
    {
      id: 4,
      name: isAr ? 'فاطمة الزهراء' : 'Fatima Az-Zahra',
      age: 7,
      country: isAr ? 'إندونيسيا 🇮🇩' : 'Indonesia 🇮🇩',
      branch: isAr ? 'فرع جزء عم والقاعدة النورانية' : 'Juz Amma & Al-Nooraniyyah',
      award: isAr ? 'وسام البراعم المتألقة' : 'Shining Bud Award',
      badgeColor: 'from-rose-400 to-pink-600',
      avatarBg: 'bg-rose-100 text-rose-900 border-rose-300',
      cheers: 284,
      achievement: isAr ? 'حفظت جزء عم كاملاً مع الترديد المتقن خلف المعلم' : 'Memorized Juz Amma with flawless pronunciation'
    }
  ]);

  // Encouragement interaction
  const [cheeredId, setCheeredId] = useState(null);
  const handleCheer = (id) => {
    setChampions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, cheers: c.cheers + 1 } : c))
    );
    setCheeredId(id);
    setTimeout(() => setCheeredId(null), 2500);
  };

  // Prizes showcase
  const prizes = [
    {
      id: 'bag',
      title: isAr ? 'حقيبة طالب القرآن المتميزة' : 'Elite Quran Student Backpack',
      tag: isAr ? 'الهدية الملكية' : 'Royal Gift Pack',
      color: 'border-amber-300 bg-gradient-to-b from-amber-50/80 to-white',
      desc: isAr
        ? 'حقيبة أزهرية فاخرة مطرزة بشعار الأكاديمية، تضم مصحف الحفظ الملون، دفتر المتابعة اليومية، قلم الأذكار، وسواكاً فاخراً وسجادة صلاة صغيرة.'
        : 'Embroidered premium bag including colored study Mushaf, daily tracker log, prayer rug, and Azhari stationary.',
      features: isAr ? [
        'مصحف الحفظ برسم عثماني فاخر',
        'مفكرة الأوراد والمتابعة اليومية للطفل',
        'سجادة صلاة مريحة ومبطنة خاصة بالأطفال',
        'ميدالية أبطال الأثر التذكارية'
      ] : [
        'Deluxe Ottoman script study Mushaf',
        'Daily homework & revision tracker',
        'Comfortable padded kids prayer rug',
        'Commemorative Little Champions medal'
      ]
    },
    {
      id: 'digital-quran',
      title: isAr ? 'المصحف الإلكتروني الناطق والمعلم' : 'Interactive Audio Speaking Mushaf',
      tag: isAr ? 'جهاز تقني متطور' : 'Smart Tech Device',
      color: 'border-emerald-300 bg-gradient-to-b from-emerald-50/80 to-white',
      desc: isAr
        ? 'جهاز إلكتروني ذكي بصوت نقي مزود بأصوات كبار قراء العالم الإسلامي، يتيح للطفل تكرار الآية وتسميعها ومقارنة تلاوته ذاتياً.'
        : 'Smart portable audio device with crystal sound, repeating verses by famous reciters for easy home rehearsal.',
      features: isAr ? [
        'خاصية تكرار الآية لتيسير الحفظ الذاتي',
        'أصوات المشايخ (الحصري، المنشاوي، العفاسي)',
        'تسجيل صوت الطفل والاستماع لتصحيح النطق',
        'بطارية قابلة للشحن وشاشة تفاعلية'
      ] : [
        'Loop repeat for effortless self-memorization',
        'Recitations by top master Sheikhs',
        'Voice recorder to audit child pronunciation',
        'Rechargeable long-life battery & screen'
      ]
    },
    {
      id: 'certificate-crown',
      title: isAr ? 'تاج الوقار والشهادة الفخرية المذهبة' : 'Crown of Dignity & Honorary Certificate',
      tag: isAr ? 'التكريم الأعظم' : 'Highest Honor',
      color: 'border-blue-300 bg-gradient-to-b from-blue-50/80 to-white',
      desc: isAr
        ? 'شهادة فخرية أزهرية معتمدة بماء الذهب مختومة من شيوخ الأكاديمية، مع تاج الوقار المذهب لإلباسه لوالدي الطفل تكريماً لهما.'
        : 'Gilded accreditation certificate signed by Azhar scholars, plus the golden Crown of Dignity for the parents.',
      features: isAr ? [
        'شهادة رسمية مطبوعة بماء الذهب ومختومة',
        'تاج الوقار المذهب لإلباسه للأب والأم',
        'درع كريستالي فاخر يحمل اسم الطالب الصغير',
        'نشر اسم البطل في لوحة الشرف العالمية'
      ] : [
        'Official gold-foil printed certificate',
        'Golden Crown of Dignity for proud parents',
        'Engraved crystal trophy with child name',
        'Global Hall of Fame spotlight feature'
      ]
    },
    {
      id: 'scholarship',
      title: isAr ? 'درع بطل الأثر ومنحة دراسية مجانية' : 'Al-Athar Hero Trophy & Full Scholarship',
      tag: isAr ? 'منحة التميز' : 'Full Scholarship',
      color: 'border-purple-300 bg-gradient-to-b from-purple-50/80 to-white',
      desc: isAr
        ? 'كأس المسابقة الذهبي مع مكافأة مالية تشجيعية ومنحة دراسية مجانية كاملة للدورة النصف سنوية القادمة بالأكاديمية.'
        : 'Championship gold trophy, cash encouragement award, and 100% free tuition for the next semester.',
      features: isAr ? [
        'كأس الأثر الذهبي المحفور للمركز الأول',
        'مكافأة مالية تشجيعية تُسلّم لولي الأمر',
        'منحة دراسية مجانية 6 أشهر كاملة',
        'لقاء مباشر مع كبار علماء الأزهر الشريف'
      ] : [
        'Engraved Championship Cup for 1st rank',
        'Financial incentive award for the family',
        '6 months 100% free academy scholarship',
        'Exclusive meet & greet with senior scholars'
      ]
    }
  ];

  return (
    <section className="space-y-16 py-8">
      {/* ══════════════════════════════════════════════════════════════════════════
          1. العد التنازلي للمسابقة النصف سنوية الكبرى (كل 6 أشهر)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 text-white p-8 md:p-12 shadow-2xl border-4 border-yellow-200/60">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs md:text-sm font-black shadow-inner">
            <Trophy size={18} className="text-yellow-200 animate-bounce" />
            <span>{isAr ? 'مسابقة براعم الأثر النصف سنوية الكبرى (الدورة الشتوية / الصيفية)' : 'Semi-Annual Grand Kids Quran Contest (Winter / Summer)'}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-md">
            {isAr ? 'العد التنازلي لانطلاق المسابقة الكبرى القادمة' : 'Countdown to the Next Grand Contest'}
          </h2>

          <p className="text-amber-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'تقام كل 6 أشهر وتضم 3 فروع تنافسية: فرع البراعم الصغار (جزء عم)، فرع الأشبال (5 أجزاء وتحفة الأطفال)، وفرع فرسان القرآن كاملاً مع الترتيل المتقن.'
              : 'Held every 6 months across 3 competitive branches: Young Buds (Juz Amma), Cubs (5 Juz & Tuhfa), and Knights (Full Quran with Tajweed).'}
          </p>

          {/* Countdown Clock */}
          <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl mx-auto pt-2">
            {[
              { label: isAr ? 'يوم' : 'Days', val: timeLeft.days },
              { label: isAr ? 'ساعة' : 'Hours', val: timeLeft.hours },
              { label: isAr ? 'دقيقة' : 'Mins', val: timeLeft.minutes },
              { label: isAr ? 'ثانية' : 'Secs', val: timeLeft.seconds },
            ].map((box, i) => (
              <div
                key={i}
                className="bg-white/95 text-slate-900 rounded-2xl p-3 md:p-5 shadow-lg flex flex-col items-center justify-center transform hover:scale-105 transition-transform"
              >
                <span className="text-2xl md:text-4xl font-black font-mono text-amber-700">
                  {String(box.val).padStart(2, '0')}
                </span>
                <span className="text-[11px] md:text-xs font-bold text-slate-600 mt-1">
                  {box.label}
                </span>
              </div>
            ))}
          </div>

          {/* Register Child Button */}
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to={localizedPath('/register/student?type=contest', locale)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm md:text-base bg-slate-950 text-white shadow-xl hover:bg-slate-900 hover:scale-105 transition-all border-2 border-yellow-300"
            >
              <Crown size={20} className="text-yellow-400" />
              <span>{isAr ? 'سجّل طفلك في المسابقة القادمة الآن' : 'Register Child for Next Contest'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. لوحة شرف الأبطال الصغار (Little Champions Hall of Fame)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-amber-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
              <Star size={16} className="fill-amber-400" />
              <span>{isAr ? 'لوحة الشرف النصف سنوية' : 'Semi-Annual Hall of Fame'}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">
              {isAr ? 'أبطال الأثر الصغار المتوّجون بالدورة السابقة' : 'Honored Champions of the Previous Contest'}
            </h3>
            <p className="text-slate-500 text-sm">
              {isAr
                ? 'تكريم نخبة الأطفال المتميزين في التلاوة والحفظ وإتقان مخارج الحروف برعاية شيوخ الأزهر'
                : 'Honoring outstanding kids in memorization, melodious recitation, and articulation.'}
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            {isAr ? 'الدورة 1447-1448 هـ' : '1447-1448 Edition'}
          </div>
        </div>

        {/* Champions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {champions.map((champ) => (
            <motion.div
              key={champ.id}
              whileHover={{ y: -6 }}
              className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Crown Icon for 1st places */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{champ.country}</span>
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Crown size={16} className="fill-amber-400" />
                </span>
              </div>

              {/* Avatar & Name */}
              <div className="text-center space-y-2">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-xl border-2 shadow-sm ${champ.avatarBg}`}>
                  {champ.name.charAt(0)}
                </div>
                <h4 className="font-bold text-lg text-slate-900">{champ.name}</h4>
                <p className="text-xs text-slate-400 font-semibold">{champ.age} {isAr ? 'سنوات' : 'years old'}</p>
              </div>

              {/* Award & Branch */}
              <div className="space-y-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-100 text-center">
                <p className="text-xs font-bold text-amber-900">{champ.award}</p>
                <p className="text-[11px] text-slate-600">{champ.branch}</p>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-center italic">
                "{champ.achievement}"
              </p>

              {/* Interactive Cheer Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCheer(champ.id)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    cheeredId === champ.id
                      ? 'bg-emerald-600 text-white scale-105'
                      : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  <Heart size={14} className={cheeredId === champ.id ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'} />
                  <span>
                    {cheeredId === champ.id
                      ? (isAr ? 'ما شاء الله تبارك الله! 🎉' : 'Masha\'Allah! 🎉')
                      : `${isAr ? 'ما شاء الله (' : 'Bless ('}${champ.cheers})`}
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. نماذج الجوائز والهدايا الفاخرة المعتمدة
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Gift size={15} />
            <span>{isAr ? 'جوائز تكريمية فاخرة تُرسل لمنازل الأبطال' : 'Deluxe Prizes Delivered to Winners\' Homes'}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">
            {isAr ? 'نماذج جوائز وهدايا براعم القرآن المتميزين' : 'Kids Contest Prizes & Gift Packages'}
          </h3>
          <p className="text-slate-600 text-sm">
            {isAr
              ? 'نحرص على مكافأة الطفل بهدايا عينية وأجهزة تعليمية تزيد شغفه بكتاب الله وتخلد لحظة فوزه'
              : 'Tangible and educational rewards fostering lifelong Quran devotion and celebration.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className={`rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-xl transition-all duration-300 ${prize.color}`}
            >
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/80 text-slate-800 border border-slate-200">
                  {prize.tag}
                </span>

                <h4 className="font-bold text-lg text-slate-900 leading-tight">
                  {prize.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {prize.desc}
                </p>

                <div className="pt-2 space-y-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {isAr ? 'محتويات الجائزة:' : 'Package Details:'}
                  </span>
                  <ul className="text-[11px] text-slate-600 space-y-1.5">
                    {prize.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={localizedPath('/register/student', locale)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white flex items-center justify-center gap-1 hover:bg-slate-800 transition"
                >
                  <span>{isAr ? 'تأهيل طفلي للمسابقة' : 'Qualify My Child'}</span>
                  <ChevronRight size={14} className={isAr ? 'rotate-180' : ''} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
