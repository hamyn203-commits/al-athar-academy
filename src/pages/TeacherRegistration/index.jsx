import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, BookOpen, FileText, Video, CheckCircle, Phone, Mail, Lock, Camera, Upload, Info } from 'lucide-react';

const steps = [
  { id: 1, title: 'البيانات الأساسية', icon: User },
  { id: 2, title: 'التحقق من الهاتف', icon: Phone },
  { id: 3, title: 'البيانات الأكاديمية', icon: GraduationCap },
  { id: 4, title: 'البيانات القرآنية', icon: BookOpen },
  { id: 5, title: 'المستندات', icon: FileText },
  { id: 6, title: 'الوسائط', icon: Video },
  { id: 7, title: 'المراجعة والإرسال', icon: CheckCircle }
];

export default function TeacherRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
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
    additionalVideos: [],
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

  const sendVerificationCode = async () => {
    const phone = formData.personalInfo.phone;
    if (!phone) {
      alert('الرجاء إدخال رقم الهاتف أولاً');
      return;
    }

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          method: verificationMethod,
          whatsapp: formData.personalInfo.whatsapp,
          telegram: formData.personalInfo.telegram
        })
      });

      if (response.ok) {
        setIsCodeSent(true);
        alert(`تم إرسال كود التحقق عبر ${verificationMethod === 'whatsapp' ? 'واتساب' : 'تليجرام'}`);
      } else {
        const data = await response.json();
        alert(data.error || 'فشل إرسال كود التحقق');
      }
    } catch (error) {
      alert('حدث خطأ أثناء إرسال كود التحقق');
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert('الرجاء إدخال كود التحقق المكون من 6 أرقام');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.personalInfo.phone,
          code: verificationCode
        })
      });

      if (response.ok) {
        setPhoneVerified(true);
        alert('تم التحقق من رقم الهاتف بنجاح');
        setCurrentStep(prev => prev + 1);
      } else {
        const data = await response.json();
        alert(data.error || 'كود التحقق غير صحيح');
      }
    } catch (error) {
      alert('حدث خطأ أثناء التحقق');
    }
  };

  const validateStep = (step) => {
    const p = formData.personalInfo;
    switch (step) {
      case 1:
        if (!p.fullName?.trim()) return 'الاسم بالكامل مطلوب';
        if (!p.age || p.age < 18) return 'يجب أن يكون العمر 18 سنة على الأقل';
        if (!p.gender) return 'يرجى اختيار الجنس';
        if (!p.country?.trim()) return 'الدولة مطلوبة';
        if (!p.city?.trim()) return 'المدينة مطلوبة';
        if (!p.phone?.trim()) return 'رقم الهاتف مطلوب';
        if (!credentials.email?.trim()) return 'البريد الإلكتروني مطلوب';
        if (!credentials.password || credentials.password.length < 8) return 'كلمة المرور 8 أحرف على الأقل';
        if (credentials.password !== credentials.confirmPassword) return 'كلمتا المرور غير متطابقتين';
        return null;
      case 2:
        if (!phoneVerified) return 'يرجى التحقق من رقم الهاتف قبل المتابعة';
        return null;
      case 3:
        if (!formData.academicInfo.university?.trim()) return 'اسم الجامعة مطلوب';
        if (!formData.academicInfo.qualification?.trim()) return 'المؤهل العلمي مطلوب';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) { alert(error); return; }
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (credentials.password !== credentials.confirmPassword) {
      alert('كلمتا المرور غير متطابقتين');
      return;
    }

    if (credentials.password.length < 8) {
      alert('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('personalInfo', JSON.stringify(formData.personalInfo));
    formDataToSend.append('academicInfo', JSON.stringify(formData.academicInfo));
    formDataToSend.append('quranInfo', JSON.stringify(formData.quranInfo));
    formDataToSend.append('languages', JSON.stringify(formData.languages));
    formDataToSend.append('availability', JSON.stringify(formData.availability));
    formDataToSend.append('email', credentials.email);
    formDataToSend.append('password', credentials.password);

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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">البيانات الأساسية</h2>
              <p className="text-gray-600">أدخل بياناتك الشخصية ومعلومات الدخول</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="text-blue-600 mt-1" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">معلومات مهمة:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>تأكد من صحة رقم الهاتف لأنه سيتم التحقق منه</li>
                    <li>استخدم كلمة مرور قوية (8 أحرف على الأقل)</li>
                    <li>أدخل بريد إلكتروني فعال لاستلام الإشعارات</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">البيانات الشخصية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.personalInfo.fullName}
                    onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">السن *</label>
                  <input
                    type="number"
                    placeholder="العمر"
                    value={formData.personalInfo.age}
                    onChange={(e) => updateFormData('personalInfo', 'age', e.target.value)}
                    className="input-field"
                    min="18"
                    max="80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الجنس *</label>
                  <select
                    value={formData.personalInfo.gender}
                    onChange={(e) => updateFormData('personalInfo', 'gender', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الدولة *</label>
                  <input
                    type="text"
                    placeholder="الدولة"
                    value={formData.personalInfo.country}
                    onChange={(e) => updateFormData('personalInfo', 'country', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">المدينة *</label>
                  <input
                    type="text"
                    placeholder="المدينة"
                    value={formData.personalInfo.city}
                    onChange={(e) => updateFormData('personalInfo', 'city', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">العنوان التفصيلي</label>
                  <input
                    type="text"
                    placeholder="العنوان"
                    value={formData.personalInfo.address}
                    onChange={(e) => updateFormData('personalInfo', 'address', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6">معلومات الاتصال</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Phone className="inline ml-1" size={16} />
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    placeholder="+201234567890"
                    value={formData.personalInfo.phone}
                    onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">سيتم إرسال كود التحقق لهذا الرقم</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">واتساب (للتحقق)</label>
                  <input
                    type="tel"
                    placeholder="+201234567890"
                    value={formData.personalInfo.whatsapp}
                    onChange={(e) => updateFormData('personalInfo', 'whatsapp', e.target.value)}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">اختياري - للتحقق عبر واتساب</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تليجرام (للتحقق)</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formData.personalInfo.telegram}
                    onChange={(e) => updateFormData('personalInfo', 'telegram', e.target.value)}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">اختياري - للتحقق عبر تليجرام</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Mail className="inline ml-1" size={16} />
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">لاستلام الإشعارات والرسائل</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold border-b pb-2 mt-6">معلومات الدخول</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Lock className="inline ml-1" size={16} />
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    placeholder="8 أحرف على الأقل"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="input-field"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">8 أحرف على الأقل</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Lock className="inline ml-1" size={16} />
                    تأكيد كلمة المرور *
                  </label>
                  <input
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field"
                    required
                  />
                  {credentials.password && credentials.confirmPassword && credentials.password !== credentials.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">كلمتا المرور غير متطابقتين</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">التحقق من رقم الهاتف</h2>
              <p className="text-gray-600">اختر طريقة التحقق المفضلة لديك</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="text-yellow-600 mt-1" size={20} />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">لماذا نحتاج التحقق؟</p>
                  <p>لضمان صحة رقم الهاتف وحماية حسابك من الاستخدام غير المصرح به</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setVerificationMethod('whatsapp')}
                  className={`p-6 rounded-lg border-2 transition ${
                    verificationMethod === 'whatsapp'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <h3 className="font-bold text-lg mb-1">واتساب</h3>
                    <p className="text-sm text-gray-600">استلام كود التحقق عبر واتساب</p>
                    <p className="text-xs text-green-600 mt-2">مجاني ✓</p>
                  </div>
                </button>

                <button
                  onClick={() => setVerificationMethod('telegram')}
                  className={`p-6 rounded-lg border-2 transition ${
                    verificationMethod === 'telegram'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">✈️</div>
                    <h3 className="font-bold text-lg mb-1">تليجرام</h3>
                    <p className="text-sm text-gray-600">استلام كود التحقق عبر تليجرام</p>
                    <p className="text-xs text-blue-600 mt-2">مجاني ✓</p>
                  </div>
                </button>
              </div>

              {!isCodeSent && verificationMethod && (
                <button
                  onClick={sendVerificationCode}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                >
                  إرسال كود التحقق
                </button>
              )}

              {isCodeSent && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">أدخل كود التحقق المكون من 6 أرقام</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-field text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={verifyCode}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-semibold"
                  >
                    تحقق من الكود
                  </button>
                  <button
                    onClick={() => {
                      setIsCodeSent(false);
                      setVerificationCode('');
                    }}
                    className="w-full text-gray-600 py-2 hover:text-gray-800 transition"
                  >
                    إعادة الإرسال
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
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

      case 4:
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

      case 5:
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

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">الوسائط المطلوبة</h2>
              <p className="text-gray-600">أضف صور وفيديوهات تعريفية عنك</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4">
              <div className="flex items-start gap-3">
                <Video className="text-blue-600 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-lg mb-3 text-blue-900">📹 إرشادات مهمة للفيديوهات:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span><strong>المدة:</strong> 3-5 دقائق لكل فيديو</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span><strong>الوجه:</strong> واضح ومرئي بالكامل</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span><strong>الصوت:</strong> واضح بدون ضوضاء</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span><strong>الإضاءة:</strong> جيدة وطبيعية</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span><strong>الخلفية:</strong> بسيطة ونظيفة</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span><strong>الجودة:</strong> HD (720p) على الأقل</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-emerald-400 transition">
                <div className="text-center">
                  <Camera className="mx-auto text-gray-400 mb-3" size={48} />
                  <h3 className="font-bold text-lg mb-2">الصورة الشخصية *</h3>
                  <p className="text-sm text-gray-600 mb-4">صورة واضحة بحجم 4×6 (مثل صورة البطاقة)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('profilePhoto', e.target.files[0])}
                    className="hidden"
                    id="profilePhoto"
                  />
                  <label
                    htmlFor="profilePhoto"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    اختر صورة
                  </label>
                  {files.profilePhoto && (
                    <div className="mt-4">
                      <img
                        src={URL.createObjectURL(files.profilePhoto)}
                        alt="معاينة"
                        className="w-32 h-40 object-cover rounded-lg mx-auto border-4 border-emerald-200"
                      />
                      <p className="text-sm text-green-600 mt-2">✓ تم اختيار: {files.profilePhoto.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition">
                <div className="text-center">
                  <Video className="mx-auto text-gray-400 mb-3" size={48} />
                  <h3 className="font-bold text-lg mb-2">فيديو تعريفي بالنفس *</h3>
                  <p className="text-sm text-gray-600 mb-2">عرّف عن نفسك، خبراتك، وسبب رغبتك في التدريس</p>
                  <p className="text-xs text-blue-600 mb-4">💡 نصيحة: كن طبيعياً وابتسم وتحدث بوضوح</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('introductionVideo', e.target.files[0])}
                    className="hidden"
                    id="introductionVideo"
                  />
                  <label
                    htmlFor="introductionVideo"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    اختر فيديو
                  </label>
                  {files.introductionVideo && (
                    <div className="mt-4">
                      <video
                        src={URL.createObjectURL(files.introductionVideo)}
                        controls
                        className="w-full max-w-md mx-auto rounded-lg border-4 border-blue-200"
                      />
                      <p className="text-sm text-green-600 mt-2">✓ تم اختيار: {files.introductionVideo.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition">
                <div className="text-center">
                  <Video className="mx-auto text-gray-400 mb-3" size={48} />
                  <h3 className="font-bold text-lg mb-2">فيديو تلاوة قرآن *</h3>
                  <p className="text-sm text-gray-600 mb-2">اقرأ مقطع من القرآن الكريم (جزء عم أو أي سورة تحفظها)</p>
                  <p className="text-xs text-purple-600 mb-4">🎙️ نصيحة: ركز على التجويد والنطق الصحيح</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('recitationVideo', e.target.files[0])}
                    className="hidden"
                    id="recitationVideo"
                  />
                  <label
                    htmlFor="recitationVideo"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    اختر فيديو
                  </label>
                  {files.recitationVideo && (
                    <div className="mt-4">
                      <video
                        src={URL.createObjectURL(files.recitationVideo)}
                        controls
                        className="w-full max-w-md mx-auto rounded-lg border-4 border-purple-200"
                      />
                      <p className="text-sm text-green-600 mt-2">✓ تم اختيار: {files.recitationVideo.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-400 transition">
                <div className="text-center">
                  <Video className="mx-auto text-gray-400 mb-3" size={48} />
                  <h3 className="font-bold text-lg mb-2">فيديو شرح طريقة التدريس *</h3>
                  <p className="text-sm text-gray-600 mb-2">اشرح كيف تُدرّس وما هي طريقتك في تعليم الطلاب</p>
                  <p className="text-xs text-orange-600 mb-4">📚 نصيحة: اذكر أمثلة من خبرتك</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange('teachingMethodVideo', e.target.files[0])}
                    className="hidden"
                    id="teachingMethodVideo"
                  />
                  <label
                    htmlFor="teachingMethodVideo"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    اختر فيديو
                  </label>
                  {files.teachingMethodVideo && (
                    <div className="mt-4">
                      <video
                        src={URL.createObjectURL(files.teachingMethodVideo)}
                        controls
                        className="w-full max-w-md mx-auto rounded-lg border-4 border-orange-200"
                      />
                      <p className="text-sm text-green-600 mt-2">✓ تم اختيار: {files.teachingMethodVideo.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                  <h3 className="font-bold text-lg mb-2">فيديوهات إضافية (اختياري)</h3>
                  <p className="text-sm text-gray-600 mb-4">أضف فيديوهات أخرى تُظهر مهاراتك (يمكنك رفع أكثر من فيديو)</p>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileChange('additionalVideos', Array.from(e.target.files))}
                    className="hidden"
                    id="additionalVideos"
                  />
                  <label
                    htmlFor="additionalVideos"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    اختر فيديوهات
                  </label>
                  {files.additionalVideos && files.additionalVideos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600">✓ تم اختيار {files.additionalVideos.length} فيديو</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {files.additionalVideos.map((video, index) => (
                          <video
                            key={index}
                            src={URL.createObjectURL(video)}
                            controls
                            className="w-full rounded-lg border-2 border-green-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                  <h3 className="font-bold text-lg mb-2">تسجيلات صوتية (اختياري)</h3>
                  <p className="text-sm text-gray-600 mb-4">أضف تسجيلات صوتية لتلاواتك (يمكنك رفع أكثر من تسجيل)</p>
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => handleFileChange('audioRecordings', Array.from(e.target.files))}
                    className="hidden"
                    id="audioRecordings"
                  />
                  <label
                    htmlFor="audioRecordings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <Upload size={20} />
                    اختر تسجيلات
                  </label>
                  {files.audioRecordings && files.audioRecordings.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600">✓ تم اختيار {files.audioRecordings.length} تسجيل</p>
                      <div className="space-y-2 mt-2">
                        {files.audioRecordings.map((audio, index) => (
                          <audio
                            key={index}
                            src={URL.createObjectURL(audio)}
                            controls
                            className="w-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
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