import { User, Phone, GraduationCap, BookOpen, FileText, Video, CheckCircle } from 'lucide-react';

export const STEPS = [
  { id: 1, title: 'أساسي', fullTitle: 'البيانات الأساسية', icon: User },
  { id: 2, title: 'تحقق', fullTitle: 'التحقق من الهاتف', icon: Phone },
  { id: 3, title: 'أكاديمي', fullTitle: 'البيانات الأكاديمية', icon: GraduationCap },
  { id: 4, title: 'قرآني', fullTitle: 'البيانات القرآنية', icon: BookOpen },
  { id: 5, title: 'مستندات', fullTitle: 'المستندات', icon: FileText },
  { id: 6, title: 'وسائط', fullTitle: 'الفيديو والصوت', icon: Video },
  { id: 7, title: 'مراجعة', fullTitle: 'المراجعة والإرسال', icon: CheckCircle },
];

export const COUNTRIES = [
  'مصر', 'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عُمان', 'الأردن',
  'فلسطين', 'لبنان', 'سوريا', 'العراق', 'اليمن', 'المغرب', 'تونس', 'الجزائر',
  'ليبيا', 'السودان', 'تركيا', 'ماليزيا', 'إندonesia', 'باكستان', 'بريطانيا', 'أمريكا', 'أخرى',
];

export const SPEC_LABELS = {
  children: 'أطفال', adults: 'كبار', women: 'نساء', 'non-arabic': 'غير عرب',
  tajweed: 'تجويد', ijaza: 'إجازة', 'arabic-language': 'لغة عربية',
};

export const LANG_OPTIONS = [
  { id: 'arabic', label: 'العربية' },
  { id: 'english', label: 'English' },
  { id: 'french', label: 'Français' },
  { id: 'turkish', label: 'Türkçe' },
  { id: 'urdu', label: 'اردو' },
];

export const INITIAL_FORM = {
  personalInfo: {
    fullName: '', age: '', gender: '', country: 'مصر', city: '', address: '',
    phone: '', whatsapp: '', telegram: '',
  },
  academicInfo: {
    university: '', faculty: '', graduationYear: '', specialization: '', qualification: '',
  },
  quranInfo: {
    numberOfIjazat: 0, ijazaType: '', sheikhName: '', sanad: '',
    memorizedParts: 30, teachingExperience: 0, specializations: [],
  },
  languages: [],
  availability: [],
};

export const DRAFT_KEY = 'teacher_registration_draft';
