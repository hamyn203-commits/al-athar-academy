import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastProvider';
import { apiUrl } from '../../config';
import { INITIAL_FORM, DRAFT_KEY } from './constants';
import { uploadFileDirect } from '../../lib/fileUpload';

const emptyFiles = () => ({
  profilePhoto: null,
  idCard: null,
  graduationCertificate: null,
  tajweedCertificates: [],
  ijazat: [],
  recitationVideos: [],
});

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const MB = 1024 * 1024;
const FILE_RULES = {
  publicImage: {
    types: ['image/jpeg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.jfif', '.png'],
    maxBytes: 100 * MB,
    label: 'الصورة الشخصية',
  },
  privateDocument: {
    types: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.jfif', '.png', '.pdf'],
    maxBytes: 25 * MB,
    label: 'المستند',
  },
  recitationVideo: {
    types: ['video/mp4', 'video/webm', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.mov'],
    maxBytes: 100 * MB,
    label: 'فيديو التلاوة',
  },
};

function fileExtension(name = '') {
  const value = String(name || '');
  const index = value.lastIndexOf('.');
  return index >= 0 ? value.slice(index).toLowerCase() : '';
}

function validateSelectedFile(file, rule) {
  if (!file) return null;
  if (!Number.isFinite(Number(file.size)) || Number(file.size) <= 0) {
    return `${rule.label}: الملف فارغ أو غير صالح`;
  }
  if (Number(file.size) > rule.maxBytes) {
    return `${rule.label}: الحد الأقصى ${Math.round(rule.maxBytes / MB)} MB لكل ملف`;
  }
  if (!rule.types.includes(String(file.type || '').toLowerCase())) {
    return `${rule.label}: نوع الملف غير مدعوم`;
  }
  if (!rule.extensions.includes(fileExtension(file.name))) {
    return `${rule.label}: امتداد الملف غير مدعوم`;
  }
  return null;
}

function validateTeacherFiles(files) {
  const checks = [
    [files.profilePhoto, FILE_RULES.publicImage],
    [files.idCard, FILE_RULES.privateDocument],
    [files.graduationCertificate, FILE_RULES.privateDocument],
    ...((files.tajweedCertificates || []).map((file) => [file, FILE_RULES.privateDocument])),
    ...((files.ijazat || []).map((file) => [file, FILE_RULES.privateDocument])),
    ...((files.recitationVideos || []).map((file) => [file, FILE_RULES.recitationVideo])),
  ];

  for (const [file, rule] of checks) {
    const error = validateSelectedFile(file, rule);
    if (error) return error;
  }
  return null;
}

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
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.formData) setFormData(d.formData);
      if (d.credentials) setCredentials((p) => ({ ...p, email: d.credentials.email || '' }));
      if (d.step) setStep(d.step);
      // Verification proof is intentionally never restored from localStorage.
    } catch { /* ignore */ }
  }, []);

  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      formData, credentials: { email: credentials.email }, step,
    }));
  }, [formData, credentials.email, step]);

  useEffect(() => {
    const t = setTimeout(saveDraft, 500);
    return () => clearTimeout(t);
  }, [saveDraft]);

  const update = (section, field, value) => {
    setFieldError('');
    setFormData((p) => ({ ...p, [section]: { ...p[section], [field]: value } }));
  };

  const setFile = (field, file) => setFiles((p) => ({ ...p, [field]: file }));

  const resetVerification = () => {
    setVerificationCode('');
    setIsCodeSent(false);
    setEmailVerified(false);
    setVerifiedEmail('');
    setVerificationToken('');
  };

  const sendCode = async () => {
    const email = normalizeEmail(credentials.email);
    if (!emailLooksValid(email)) return toast.error('أدخل بريدًا إلكترونيًا صحيحًا أولاً');

    resetVerification();

    try {
      const r = await fetch(apiUrl('/api/auth/send-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'فشل إرسال كود التحقق');
      setIsCodeSent(true);
      toast.success('تم إرسال كود التحقق إلى بريدك الإلكتروني');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const verifyCode = async () => {
    const email = normalizeEmail(credentials.email);
    if (!emailLooksValid(email)) return toast.error('أدخل بريدًا إلكترونيًا صحيحًا');
    if (verificationCode.length !== 6) return toast.error('الكود مكوّن من 6 أرقام');

    try {
      const r = await fetch(apiUrl('/api/auth/verify-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'كود غير صحيح');
      if (!data.verificationToken) throw new Error('تعذر إنشاء إثبات التحقق');

      setEmailVerified(true);
      setVerifiedEmail(email);
      setVerificationToken(data.verificationToken);
      toast.success('تم تأكيد البريد الإلكتروني');
      setStep(3);
    } catch (e) {
      toast.error(e.message);
    }
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
      case 2: {
        const email = normalizeEmail(credentials.email);
        if (!emailLooksValid(email)) return 'أدخل بريدًا إلكترونيًا صحيحًا';
        if (!emailVerified || !verificationToken || verifiedEmail !== email) {
          return 'يجب تأكيد البريد الإلكتروني أولاً';
        }
        return null;
      }
      case 3:
        if (!credentials.password || credentials.password.length < 8) return 'كلمة المرور 8+ أحرف';
        if (credentials.password !== credentials.confirmPassword) return 'كلمتا المرور غير متطابقتين';
        return null;
      case 4:
        if (!files.profilePhoto) return 'ارفع صورة 4×6';
        if (!files.recitationVideos?.length) return 'ارفع فيديو تلاوة واحد على الأقل';
        return validateTeacherFiles(files);
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

    const verifiedEmailNow = normalizeEmail(credentials.email);
    if (!emailVerified || !verificationToken || verifiedEmail !== verifiedEmailNow) {
      toast.error('يجب إعادة تأكيد البريد الإلكتروني');
      setStep(2);
      return;
    }

    setSubmitting(true);
    const city = pCity(formData.personalInfo.address);

    try {
      const uploadOne = (file, purpose) => file
        ? uploadFileDirect(file, purpose, { verificationToken })
        : Promise.resolve(null);
      const uploadMany = (items, purpose) => Promise.all(
        (items || []).map((file) => uploadFileDirect(file, purpose, { verificationToken }))
      );

      const [
        profilePhoto,
        idCard,
        graduationCertificate,
        tajweedCertificates,
        ijazat,
        recitationVideo,
      ] = await Promise.all([
        uploadOne(files.profilePhoto, 'teacher-public'),
        uploadOne(files.idCard, 'teacher-private'),
        uploadOne(files.graduationCertificate, 'teacher-private'),
        uploadMany(files.tajweedCertificates, 'teacher-private'),
        uploadMany(files.ijazat, 'teacher-private'),
        uploadMany(files.recitationVideos, 'teacher-public'),
      ]);

      const payload = {
        personalInfo: JSON.stringify({
          ...formData.personalInfo,
          age: Number(formData.personalInfo.age),
          city,
          whatsapp: formData.personalInfo.whatsapp || formData.personalInfo.phone,
        }),
        academicInfo: JSON.stringify({
          university: formData.academicInfo.university,
          graduationYear: Number(formData.academicInfo.graduationYear),
          faculty: '—',
          specialization: 'تحفيظ قرآن',
          qualification: 'خريج',
        }),
        quranInfo: JSON.stringify({
          numberOfIjazat: 0,
          memorizedParts: 30,
          teachingExperience: 0,
          specializations: ['tajweed'],
        }),
        languages: JSON.stringify(['arabic']),
        availability: JSON.stringify([]),
        email: verifiedEmailNow,
        password: credentials.password,
        verificationToken,
        uploadedFiles: {
          profilePhoto,
          idCard,
          graduationCertificate,
          tajweedCertificates,
          ijazat,
          recitationVideo,
        },
      };

      const r = await fetch(apiUrl('/api/teachers/register'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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
    verificationCode, setVerificationCode, isCodeSent, emailVerified,
    verifiedEmail, fieldError,
    sendCode, verifyCode, resetVerification, next, prev, submit,
  };
}

function pCity(address) {
  const part = address?.split('،')?.[0]?.trim();
  return part || address?.slice(0, 40) || '—';
}