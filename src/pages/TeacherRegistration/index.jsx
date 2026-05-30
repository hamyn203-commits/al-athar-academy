import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, BookOpen, FileText, Video, CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, title: 'البيانات الشخصية', icon: User },
  { id: 2, title: 'البيانات الأكاديمية', icon: GraduationCap },
  { id: 3, title: 'البيانات القرآنية', icon: BookOpen },
  { id: 4, title: 'المستندات', icon: FileText },
  { id: 5, title: 'الوسائط', icon: Video },
  { id: 6, title: 'المراجعة والإرسال', icon: CheckCircle }
];

export default function TeacherRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      age: '',
      gender: '',
      country: '',
      city: '',
      address: '',
      phone: '',
      whatsapp: '',
      telegram: ''
    },
    academicInfo: {
      university: '',
      faculty: '',
      graduationYear: '',
      specialization: '',
      qualification: ''
    },
    quranInfo: {
      numberOfIjazat: 0,
      ijazaType: '',
      sheikhName: '',
      sanad: '',
      memorizedParts: 30,
      teachingExperience: 0,
      specializations: []
    },
    languages: [],
    availability: []
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    idCard: null,
    graduationCertificate: null,
    tajweedCertificates: [],
    ijazat: [],
    introductionVideo: null,
    recitationVideo: null,
    teachingMethodVideo: null,
    audioRecordings: []
  });

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileChange = (field, file) => {
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('personalInfo', JSON.stringify(formData.personalInfo));
    formDataToSend.append('academicInfo', JSON.stringify(formData.academicInfo));
    formDataToSend.append('quranInfo', JSON.stringify(formData.quranInfo));
    formDataToSend.append('languages', JSON.stringify(formData.languages));
    formDataToSend.append('availability', JSON.stringify(formData.availability));

    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        if (Array.isArray(file)) {
          file.forEach(f => formDataToSend.append(key, f));
        } else {
          formDataToSend.append(key, file);
        }
      }
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teachers/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/teacher/pending');
      } else {
        alert(data.error || 'حدث خطأ أثناء التسجيل');
      }
    } catch (error) {
      alert('حدث خطأ أثناء التسجيل');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">البيانات الشخصية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="الاسم بالكامل"
                value={formData.personalInfo.fullName}
                onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="السن"
                value={formData.personalInfo.age}
                onChange={(e) => updateFormData('personalInfo', 'age', e.target.value)}
                className="input-field"
              />
              <select
                value={formData.personalInfo.gender}
                onChange={(e) => updateFormData('personalInfo', 'gender', e.target.value)}
                className="input-field"
              >
                <option value="">اختر الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              <input
                type="text"
                placeholder="الدولة"
                value={formData.personalInfo.country}
                onChange={(e) => updateFormData('personalInfo', 'country', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="المدينة"
                value={formData.personalInfo.city}
                onChange={(e) => updateFormData('personalInfo', 'city', e.target.value)}
                className="input-field"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={formData.personalInfo.phone}
                onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
                className="input-field"
              />
              <input
                type="tel"
                placeholder="واتساب (اختياري)"
                value={formData.personalInfo.whatsapp}
                onChange={(e) => updateFormData('personalInfo', 'whatsapp', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="تليجرام (اختياري)"
                value={formData.personalInfo.telegram}
                onChange={(e) => updateFormData('personalInfo', 'telegram', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">البيانات الأكاديمية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="الجامعة"
                value={formData.academicInfo.university}
                onChange={(e) => updateFormData('academicInfo', 'university', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="الكلية"
                value={formData.academicInfo.faculty}
                onChange={(e) => updateFormData('academicInfo', 'faculty', e.target.value)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="سنة التخرج"
                value={formData.academicInfo.graduationYear}
                onChange={(e) => updateFormData('academicInfo', 'graduationYear', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="التخصص"
                value={formData.academicInfo.specialization}
                onChange={(e) => updateFormData('academicInfo', 'specialization', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="المؤهل العلمي"
                value={formData.academicInfo.qualification}
                onChange={(e) => updateFormData('academicInfo', 'qualification', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">البيانات القرآنية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="عدد الإجازات"
                value={formData.quranInfo.numberOfIjazat}
                onChange={(e) => updateFormData('quranInfo', 'numberOfIjazat', parseInt(e.target.value))}
                className="input-field"
              />
              <input
                type="text"
                placeholder="نوع الإجازة"
                value={formData.quranInfo.ijazaType}
                onChange={(e) => updateFormData('quranInfo', 'ijazaType', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="اسم الشيخ المجيز"
                value={formData.quranInfo.sheikhName}
                onChange={(e) => updateFormData('quranInfo', 'sheikhName', e.target.value)}
                className="input-field"
              />
              <input
                type="number"
                placeholder="عدد الأجزاء المحفوظة"
                value={formData.quranInfo.memorizedParts}
                onChange={(e) => updateFormData('quranInfo', 'memorizedParts', parseInt(e.target.value))}
                min="0"
                max="30"
                className="input-field"
              />
              <input
                type="number"
                placeholder="سنوات الخبرة في التدريس"
                value={formData.quranInfo.teachingExperience}
                onChange={(e) => updateFormData('quranInfo', 'teachingExperience', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">التخصصات</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['children', 'adults', 'women', 'non-arabic', 'tajweed', 'ijaza', 'arabic-language'].map(spec => (
                  <label key={spec} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.quranInfo.specializations.includes(spec)}
                      onChange={(e) => {
                        const specs = e.target.checked
                          ? [...formData.quranInfo.specializations, spec]
                          : formData.quranInfo.specializations.filter(s => s !== spec);
                        updateFormData('quranInfo', 'specializations', specs);
                      }}
                    />
                    <span>{spec === 'children' ? 'أطفال' : spec === 'adults' ? 'كبار' : spec === 'women' ? 'نساء' : spec === 'non-arabic' ? 'غير ناطقين بالعربية' : spec === 'tajweed' ? 'تجويد' : spec === 'ijaza' ? 'إجازة' : 'لغة عربية'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">المستندات المطلوبة</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">صورة شخصية (4×6)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('profilePhoto', e.target.files[0])}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">بطاقة شخصية</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('idCard', e.target.files[0])}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">شهادة التخرج</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('graduationCertificate', e.target.files[0])}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">شهادات التجويد (اختياري)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleFileChange('tajweedCertificates', Array.from(e.target.files))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">الإجازات (اختياري)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleFileChange('ijazat', Array.from(e.target.files))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">الوسائط المطلوبة</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">شروط الفيديوهات:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>مدة كل فيديو: 3-5 دقائق</li>
                <li>وضوح الوجه والصوت</li>
                <li>إضاءة جيدة</li>
                <li>عدم وجود ضوضاء</li>
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">فيديو تعريفي بالنفس</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('introductionVideo', e.target.files[0])}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">فيديو تلاوة قرآن</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('recitationVideo', e.target.files[0])}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">فيديو شرح طريقة التدريس</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange('teachingMethodVideo', e.target.files[0])}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">تسجيلات صوتية (اختياري)</label>
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={(e) => handleFileChange('audioRecordings', Array.from(e.target.files))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">المراجعة والإرسال</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-bold mb-2">البيانات الشخصية</h3>
                <p>{formData.personalInfo.fullName}</p>
                <p>{formData.personalInfo.country} - {formData.personalInfo.city}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">البيانات الأكاديمية</h3>
                <p>{formData.academicInfo.university} - {formData.academicInfo.faculty}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">البيانات القرآنية</h3>
                <p>عدد الإجازات: {formData.quranInfo.numberOfIjazat}</p>
                <p>الأجزاء المحفوظة: {formData.quranInfo.memorizedParts}</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              إرسال الطلب للمراجعة
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">تسجيل كمعلم</h1>

        <div className="flex justify-between mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  currentStep >= step.id ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep >= step.id ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                }`}>
                  <Icon size={24} />
                </div>
                <span className="text-xs mt-2 text-center">{step.title}</span>
              </div>
            );
          })}
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {renderStep()}

          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              السابق
            </button>
            {currentStep < steps.length && (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                التالي
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}