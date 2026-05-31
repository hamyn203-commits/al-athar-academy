import { User, Phone, Lock, Video, CheckCircle } from 'lucide-react';

export const STEPS = [
  { id: 1, title: 'بياناتك', fullTitle: 'البيانات الشخصية', icon: User },
  { id: 2, title: 'تحقق', fullTitle: 'تأكيد رقم الهاتف', icon: Phone },
  { id: 3, title: 'حسابك', fullTitle: 'البريد وكلمة المرور', icon: Lock },
  { id: 4, title: 'صورة وفيديو', fullTitle: 'الصورة وفيديو التلاوة', icon: Video },
  { id: 5, title: 'إرسال', fullTitle: 'المراجعة والإرسال', icon: CheckCircle },
];

export const COUNTRIES = [
  'مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عُمان', 'الأردن',
  'فلسطين', 'لبنان', 'سوريا', 'العراق', 'اليمن', 'المغرب', 'تونس', 'الجزائر',
  'ليبيا', 'السودان', 'تركيا', 'ماليزيا', 'إندonesia', 'باكستان', 'بريطانيا', 'أمريكا', 'أخرى',
];

export const TASK_TYPES = [
  { id: 'memorization', label: 'حفظ جديد' },
  { id: 'review-recent', label: 'مراجعة قريبة' },
  { id: 'review-far', label: 'مراجعة بعيدة' },
  { id: 'audio', label: 'تسجيل صوتي' },
  { id: 'test', label: 'اختبار' },
];

export const INITIAL_FORM = {
  personalInfo: {
    fullName: '', age: '', gender: 'male', country: 'مصر', address: '',
    phone: '', whatsapp: '', telegram: '',
  },
  academicInfo: {
    university: '', graduationYear: '',
  },
};

export const DRAFT_KEY = 'teacher_registration_draft';

export const VIDEO_GUIDE = [
  'مدة كل فيديو من 3 إلى 5 دقائق',
  'يظهر وجهك بوضوح أمام الكاميرا',
  'صوتك واضح بدون ضوضاء',
  'اقرأ من المصحف أو من حفظك — تلاوة قرآنية',
  'يمكنك رفع أكثر من فيديو',
];
