import {
  Award,
  BadgeCheck,
  Banknote,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Gamepad2,
  Gift,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Languages,
  LibraryBig,
  MapPinned,
  Medal,
  MessageCircleQuestion,
  MonitorPlay,
  PanelsTopLeft,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';

export const v4Markets = [
  {
    region: 'العالم العربي',
    countries: ['مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان', 'الأردن', 'العراق', 'المغرب', 'الجزائر', 'تونس'],
    services: ['تحفيظ القرآن', 'التجويد', 'الإجازات', 'اللغة العربية', 'الدراسات الإسلامية'],
    currency: 'SAR',
    language: 'ar',
  },
  {
    region: 'السوق الأمريكي',
    countries: ['الولايات المتحدة', 'كندا'],
    services: ['Quran Memorization', 'Arabic Language', 'Islamic Studies', 'Kids Programs', 'Reverts Programs'],
    currency: 'USD',
    language: 'en',
  },
  {
    region: 'السوق الأوروبي',
    countries: ['بريطانيا', 'فرنسا', 'ألمانيا', 'هولندا', 'بلجيكا', 'السويد'],
    services: ['تعليم القرآن', 'تعليم العربية', 'برامج الأطفال', 'برامج المسلمين الجدد'],
    currency: 'EUR',
    language: 'fr',
  },
  {
    region: 'السوق التركي',
    countries: ['تركيا'],
    services: ['القرآن الكريم', 'اللغة العربية', 'التجويد'],
    currency: 'TRY',
    language: 'tr',
  },
  {
    region: 'السوق الإندونيسي والماليزي',
    countries: ['إندونيسيا', 'ماليزيا'],
    services: ['حفظ القرآن', 'تعليم العربية', 'برامج الأطفال'],
    currency: 'IDR',
    language: 'id',
  },
  {
    region: 'السوق الباكستاني والهندي',
    countries: ['باكستان', 'الهند'],
    services: ['تحفيظ القرآن', 'التجويد', 'الإجازات'],
    currency: 'PKR',
    language: 'ur',
  },
];

export const v4Languages = [
  { code: 'ar', name: 'العربية', dir: 'RTL', seo: 'ar/al-athar-quran-academy' },
  { code: 'en', name: 'English', dir: 'LTR', seo: 'en/quran-memorization-online' },
  { code: 'fr', name: 'Français', dir: 'LTR', seo: 'fr/apprendre-le-coran' },
  { code: 'tr', name: 'Türkçe', dir: 'LTR', seo: 'tr/online-kuran-egitimi' },
  { code: 'de', name: 'Deutsch', dir: 'LTR', seo: 'de/koran-online-lernen' },
  { code: 'ur', name: 'الأردية', dir: 'RTL', seo: 'ur/quran-academy' },
  { code: 'id', name: 'Bahasa Indonesia', dir: 'LTR', seo: 'id/akademi-alquran-online' },
  { code: 'ms', name: 'Malay', dir: 'LTR', seo: 'ms/akademi-al-quran' },
];

export const v4Currencies = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP', 'TRY', 'PKR', 'IDR'];

export const v4TimeZones = [
  { city: 'نيويورك', zone: 'America/New_York' },
  { city: 'لندن', zone: 'Europe/London' },
  { city: 'الرياض', zone: 'Asia/Riyadh' },
  { city: 'إسطنبول', zone: 'Europe/Istanbul' },
  { city: 'القاهرة', zone: 'Africa/Cairo' },
  { city: 'جاكرتا', zone: 'Asia/Jakarta' },
];

export const v4TeacherPipeline = [
  'البيانات الشخصية',
  'المؤهلات والشهادات',
  'الإجازات والسند',
  'فيديوهات التلاوة',
  'تسجيلات صوتية',
  'مقابلة شخصية',
  'OTP وTelegram وWhatsApp وEmail Verification',
  'تقييم التجويد والصوت والخبرة والالتزام وتقييم الطلاب',
];

export const v4PortalSections = [
  {
    title: 'لوحة المعلم V4',
    icon: PanelsTopLeft,
    items: ['الأرباح اليومية والأسبوعية والشهرية', 'إدارة الطلاب والملاحظات والتقارير', 'الواجبات والاختبارات والتسجيلات الصوتية', 'المواعيد والإجازات والحصص المتاحة'],
  },
  {
    title: 'لوحة الطالب العالمية',
    icon: GraduationCap,
    items: ['الملف الأكاديمي والمستوى والإنجازات والشهادات', 'الحصص القادمة والسابقة والتسجيلات', 'رفع الواجبات والتسجيلات', 'تحميل جميع الشهادات'],
  },
  {
    title: 'لوحة ولي الأمر',
    icon: Users,
    items: ['الحضور والغياب', 'الواجبات والتقييمات', 'متابعة الحفظ والتقدم', 'ملخص أسبوعي للأسرة'],
  },
];

export const v4AiSystems = [
  {
    title: 'تقييم التلاوة بالذكاء الاصطناعي',
    icon: Bot,
    items: ['تحليل المدود', 'الغنة', 'أحكام النون الساكنة', 'الوقف والابتداء', 'مخارج الحروف', 'تقرير فوري قابل للمراجعة'],
  },
  {
    title: 'مساعد قرآني ذكي',
    icon: MessageCircleQuestion,
    items: ['خطة حفظ يومية', 'مراجعة ذكية', 'شرح التجويد', 'تدريب اللغة العربية'],
  },
  {
    title: 'مساعد للمعلمين',
    icon: Sparkles,
    items: ['إعداد الواجبات', 'إعداد الاختبارات', 'كتابة التقارير', 'اقتراح تدخلات تعليمية'],
  },
];

export const v4LearningSystems = [
  { title: 'LMS عالمي', icon: LibraryBig, items: ['دورات', 'مستويات', 'اختبارات', 'شهادات', 'تقييمات', 'واجبات'] },
  { title: 'نظام الاختبارات', icon: ClipboardCheck, items: ['اختيار من متعدد', 'صح وخطأ', 'صوتي', 'شفوي', 'عملي'] },
  { title: 'الشهادات الذكية', icon: FileCheck2, items: ['PDF تلقائي', 'QR Code', 'رقم تحقق', 'رابط تحقق إلكتروني'] },
  { title: 'نظام الاجتماعات', icon: Video, items: ['Zoom', 'Google Meet', 'مشاركة الشاشة', 'سبورة تفاعلية', 'تسجيل'] },
  { title: 'مكتبة الفيديو العالمية', icon: MonitorPlay, items: ['القرآن', 'التجويد', 'العربية', 'العقيدة', 'الفقه', 'السيرة'] },
];

export const v4GrowthSystems = [
  { title: 'المسلمون الجدد', icon: HeartHandshake, items: ['برامج تعريفية', 'إنجليزية وفرنسية وإسبانية', 'مسارات دعم فردية'] },
  { title: 'قسم الأطفال', icon: Gamepad2, items: ['ألعاب تعليمية', 'مكافآت', 'مسابقات', 'بيئة آمنة'] },
  { title: 'Gamification', icon: Medal, items: ['نقاط', 'أوسمة', 'مستويات', 'بطولات شهرية'] },
  { title: 'نظام السفراء', icon: Gift, items: ['دعوات الطلاب', 'خصومات', 'نقاط', 'حصص مجانية'] },
  { title: 'تطبيق الهاتف', icon: Smartphone, items: ['Android', 'iOS', 'إشعارات', 'حصص', 'تسجيلات', 'شهادات'] },
  { title: 'أكاديمية النساء', icon: ShieldCheck, items: ['قسم مستقل بالكامل', 'معلمات فقط', 'طالبات فقط'] },
  { title: 'نظام التبرعات', icon: CircleDollarSign, items: ['كفالة طالب', 'كفالة معلم', 'كفالة حلقة قرآن'] },
  { title: 'مركز التوظيف', icon: BriefcaseBusiness, items: ['معلمين', 'مترجمين', 'مشرفين'] },
];

export const v4Kpis = [
  { label: 'دولة مستهدفة', value: '100+', icon: Globe2 },
  { label: 'لغة مدعومة', value: '8', icon: Languages },
  { label: 'عملة عالمية', value: '9', icon: Banknote },
  { label: 'لوحة تشغيل', value: '3', icon: ChartNoAxesCombined },
  { label: 'مسارات AI', value: '3', icon: Bot },
  { label: 'نظام تعليمي', value: '5+', icon: BookOpen },
];

export const v4Roadmap = [
  { phase: 'المرحلة 1', title: 'التوسع العالمي', status: 'جاهز بالواجهة', icon: MapPinned },
  { phase: 'المرحلة 2', title: 'لوحات التشغيل العالمية', status: 'جاهز كنموذج تشغيلي', icon: PanelsTopLeft },
  { phase: 'المرحلة 3', title: 'AI وLMS والشهادات', status: 'جاهز للتوصيل بالـ API', icon: BadgeCheck },
  { phase: 'المرحلة 4', title: 'النمو والموبايل والتوظيف', status: 'جاهز كمنظومة نمو', icon: Award },
  { phase: 'V5', title: 'منصة تخدم مليون طالب', status: 'مؤسسة للتوسع', icon: CalendarClock },
];

export function formatCurrencyPreview(currency, locale = 'ar-EG') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(45);
}

export function formatZoneTime(zone, locale = 'ar-EG') {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: zone,
  }).format(new Date());
}

export const v4QuickActions = [
  { label: 'اختيار المسار', icon: BookOpen },
  { label: 'حجز حصة تجريبية', icon: Clock3 },
  { label: 'رفع تلاوة', icon: Bot },
  { label: 'إصدار شهادة', icon: FileCheck2 },
];
