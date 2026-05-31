import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastProvider';
import { INITIAL_FORM, DRAFT_KEY } from './constants';

const emptyFiles = () => ({
  profilePhoto: null,
  idCard: null,
  graduationCertificate: null,
  tajweedCertificates: [],
  ijazat: [],
  recitationVideos: [],
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
          whatsapp: formData.personalInfo.whatsapp || formData.personalInfo.phone,
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
        if (!p.address?.trim()) return 'العنوان مطلوب';
        if (!a.university?.trim()) return 'اسم الجامعة / خريج أي مطلوب';
        if (!a.graduationYear) return 'سنة التخرج مطلوبة';
        if (!p.country) return 'اختر الدولة';
        if (!p.phone?.trim()) return 'رقم الهاتف مطلوب';
        return null;
      case 2:
        if (!phoneVerified) return 'تحقق من الهاتف أو اضغط تخطي';
        return null;
      case 3:
        if (!credentials.email?.trim()) return 'البريد مطلوب';
        if (!credentials.password || credentials.password.length < 8) return 'كلمة المرور 8+ أحرف';
        if (credentials.password !== credentials.confirmPassword) return 'كلمتا المرور غير متطابقتين';
        return null;
      case 4:
        if (!files.profilePhoto) return 'ارفع صورة 4×6';
        if (!files.recitationVideos?.length) return 'ارفع فيديو تلاوة واحد على الأقل';
        return null;
      default:
        return null;
    }
  };

  const next = () => {
    const err = validate(step);
    if (err) { setFieldError(err); toast.error(err); return; }
    setFieldError('');
    if (step < 5) setStep(step + 1);
  };

  const prev = () => { if (step > 1) setStep(step - 1); };

  const submit = async () => {
    const err = validate(4);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    const fd = new FormData();
    const city = pCity(formData.personalInfo.address);
    fd.append('personalInfo', JSON.stringify({
      ...formData.personalInfo,
      age: Number(formData.personalInfo.age),
      city,
      whatsapp: formData.personalInfo.whatsapp || formData.personalInfo.phone,
    }));
    fd.append('academicInfo', JSON.stringify({
      university: formData.academicInfo.university,
      graduationYear: Number(formData.academicInfo.graduationYear),
      faculty: '—',
      specialization: 'تحفيظ قرآن',
      qualification: 'خريج',
    }));
    fd.append('quranInfo', JSON.stringify({
      numberOfIjazat: 0,
      memorizedParts: 30,
      teachingExperience: 0,
      specializations: ['tajweed'],
    }));
    fd.append('languages', JSON.stringify(['arabic']));
    fd.append('availability', JSON.stringify([]));
    fd.append('email', credentials.email);
    fd.append('password', credentials.password);

    if (files.profilePhoto) fd.append('profilePhoto', files.profilePhoto);
    if (files.idCard) fd.append('idCard', files.idCard);
    if (files.graduationCertificate) fd.append('graduationCertificate', files.graduationCertificate);
    files.tajweedCertificates.forEach((f) => fd.append('tajweedCertificates', f));
    files.ijazat.forEach((f) => fd.append('ijazat', f));
    files.recitationVideos.forEach((f) => fd.append('recitationVideo', f));

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
    formData, files, setFile, update,
    verificationCode, setVerificationCode, isCodeSent, phoneVerified,
    verificationMethod, setVerificationMethod, fieldError,
    sendCode, verifyCode, skipVerification, next, prev, submit,
    setIsCodeSent,
  };
}

function pCity(address) {
  const part = address?.split('،')?.[0]?.trim();
  return part || address?.slice(0, 40) || '—';
}
