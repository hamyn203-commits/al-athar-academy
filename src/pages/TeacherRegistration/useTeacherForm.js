import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastProvider';
import { INITIAL_FORM, DRAFT_KEY } from './constants';

const emptyFiles = () => ({
  profilePhoto: null, idCard: null, graduationCertificate: null,
  tajweedCertificates: [], ijazat: [],
  introductionVideo: null, recitationVideo: null, teachingMethodVideo: null,
  additionalVideos: [], audioRecordings: [],
});

export function useTeacherForm() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '', confirmPassword: '' });
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [files, setFiles] = useState(emptyFiles);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.formData) setFormData(d.formData);
      if (d.credentials) setCredentials((p) => ({ ...p, email: d.credentials.email || '' }));
      if (d.step) setStep(d.step);
      if (d.phoneVerified) setPhoneVerified(true);
    } catch { /* ignore */ }
  }, []);

  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      formData, credentials: { email: credentials.email }, step, phoneVerified,
    }));
  }, [formData, credentials.email, step, phoneVerified]);

  useEffect(() => {
    const t = setTimeout(saveDraft, 500);
    return () => clearTimeout(t);
  }, [saveDraft]);

  const update = (section, field, value) => {
    setFieldError('');
    setFormData((p) => ({ ...p, [section]: { ...p[section], [field]: value } }));
  };

  const setFile = (field, file) => setFiles((p) => ({ ...p, [field]: file }));

  const toggleSpec = (spec) => {
    const specs = formData.quranInfo.specializations;
    update('quranInfo', 'specializations',
      specs.includes(spec) ? specs.filter((s) => s !== spec) : [...specs, spec]);
  };

  const toggleLang = (lang) => {
    setFormData((p) => ({
      ...p,
      languages: p.languages.includes(lang) ? p.languages.filter((l) => l !== lang) : [...p.languages, lang],
    }));
  };

  const sendCode = async () => {
    if (!formData.personalInfo.phone) return toast.error('أدخل رقم الهاتف أولاً');
    if (!verificationMethod) return toast.error('اختر واتساب أو تليجرام');
    try {
      const r = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.personalInfo.phone,
          method: verificationMethod,
          whatsapp: formData.personalInfo.whatsapp,
          telegram: formData.personalInfo.telegram,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'فشل الإرسال');
      setIsCodeSent(true);
      toast.success(`تم إرسال الكود عبر ${verificationMethod === 'whatsapp' ? 'واتساب' : 'تليجرام'}`);
    } catch (e) { toast.error(e.message); }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) return toast.error('الكود 6 أرقام');
    try {
      const r = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.personalInfo.phone, code: verificationCode }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'كود غير صحيح');
      setPhoneVerified(true);
      toast.success('تم التحقق من الهاتف');
      setStep(3);
    } catch (e) { toast.error(e.message); }
  };

  const skipVerification = () => {
    setPhoneVerified(true);
    toast.info('تم التخطي — سيتواصل معك الأدمن للتحقق لاحقاً');
    setStep(3);
  };

  const validate = (s) => {
    const p = formData.personalInfo;
    const a = formData.academicInfo;
    switch (s) {
      case 1:
        if (!p.fullName?.trim()) return 'الاسم مطلوب';
        if (!p.age || Number(p.age) < 18) return 'العمر 18+';
        if (!p.gender) return 'اختر الجنس';
        if (!p.country) return 'اختر الدولة';
        if (!p.city?.trim()) return 'المدينة مطلوبة';
        if (!p.phone?.trim()) return 'الهاتف مطلوب';
        if (!credentials.email?.trim()) return 'البريد مطلوب';
        if (!credentials.password || credentials.password.length < 8) return 'كلمة المرور 8+ أحرف';
        if (credentials.password !== credentials.confirmPassword) return 'كلمتا المرور غير متطابقتين';
        return null;
      case 2:
        if (!phoneVerified) return 'تحقق من الهاتف أو اضغط تخطي';
        return null;
      case 3:
        if (!a.university?.trim()) return 'الجامعة مطلوبة';
        if (!a.faculty?.trim()) return 'الكلية مطلوبة';
        if (!a.graduationYear) return 'سنة التخرج مطلوبة';
        if (!a.specialization?.trim()) return 'التخصص مطلوب';
        if (!a.qualification?.trim()) return 'المؤهل مطلوب';
        return null;
      case 4:
        if (!formData.quranInfo.specializations.length) return 'اختر تخصصاً واحداً على الأقل';
        return null;
      case 5:
        if (!files.profilePhoto) return 'ارفع صورة شخصية';
        if (!files.idCard) return 'ارفع بطاقة شخصية';
        if (!files.graduationCertificate) return 'ارفع شهادة التخرج';
        return null;
      case 6:
        if (!files.introductionVideo) return 'ارفع فيديو تعريفي';
        if (!files.recitationVideo) return 'ارفع فيديو تلاوة';
        if (!files.teachingMethodVideo) return 'ارفع فيديو طريقة التدريس';
        return null;
      default: return null;
    }
  };

  const next = () => {
    const err = validate(step);
    if (err) { setFieldError(err); toast.error(err); return; }
    setFieldError('');
    if (step === 1) setStep(2);
    else if (step < 7) setStep(step + 1);
  };

  const prev = () => { if (step > 1) setStep(step - 1); };

  const submit = async () => {
    const err = validate(6);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('personalInfo', JSON.stringify({ ...formData.personalInfo, age: Number(formData.personalInfo.age) }));
    fd.append('academicInfo', JSON.stringify({ ...formData.academicInfo, graduationYear: Number(formData.academicInfo.graduationYear) }));
    fd.append('quranInfo', JSON.stringify(formData.quranInfo));
    fd.append('languages', JSON.stringify(formData.languages));
    fd.append('availability', JSON.stringify(formData.availability));
    fd.append('email', credentials.email);
    fd.append('password', credentials.password);
    Object.entries(files).forEach(([k, v]) => {
      if (!v) return;
      if (Array.isArray(v)) v.forEach((f) => fd.append(k, f));
      else fd.append(k, v);
    });
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await fetch('/api/teachers/register', { method: 'POST', headers, body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'فشل التسجيل');
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
      toast.success('تم إرسال طلبك بنجاح!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    step, setStep, submitted, submitting, credentials, setCredentials,
    formData, files, setFile, update, toggleSpec, toggleLang,
    verificationCode, setVerificationCode, isCodeSent, phoneVerified,
    verificationMethod, setVerificationMethod, fieldError,
    sendCode, verifyCode, skipVerification, next, prev, submit,
    setIsCodeSent,
  };
}
