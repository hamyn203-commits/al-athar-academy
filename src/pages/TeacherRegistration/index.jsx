import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, Lock, Mail, Eye, EyeOff, ArrowLeft, ArrowRight,
  CheckCircle2, Clock, Shield, Video,
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useTeacherForm } from './useTeacherForm';
import StepProgress from './StepProgress';
import FileBox from './FileBox';
import { STEPS, COUNTRIES, VIDEO_GUIDE } from './constants';
import '../../styles/public-experience.css';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';

const inputCls = 'input-field w-full';

export default function TeacherRegistration() {
  const { locale } = useI18n();
  const [showPass, setShowPass] = useState(false);
  const f = useTeacherForm();

  if (f.submitted) {
    return (
      <>
        <GlobalHeader />
        <div className="wn-teacher-register-shell min-h-screen flex items-center justify-center p-4" dir="rtl">
          <div className="wn-teacher-register-card max-w-lg w-full text-center p-10">
            <CheckCircle2 className="mx-auto text-emerald-600 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">تم إرسال طلبك! 🎉</h1>
            <p className="text-slate-600 mb-6">
              سيقوم فريق الأكاديمية بمراجعة البيانات، وستصلك رسالة على <strong>{f.credentials.email}</strong> عند تحديث حالة الطلب.
            </p>
            <div className="flex flex-col gap-3">
              <Link to={localizedPath('/login', locale)} className="btn-primary">تسجيل الدخول</Link>
              <Link to={localizedPath('/', locale)} className="btn-secondary">العودة للرئيسية</Link>
            </div>
          </div>
        </div>
        <GlobalFooter />
      </>
    );
  }

  const stepTitle = STEPS.find((s) => s.id === f.step)?.fullTitle;

  return (
    <>
      <SEOHead page={{ title: 'تسجيل معلم', description: 'انضم كمعلم قرآن في أكاديمية وَحْيٌ وَنَمَاء', url: '/teacher/register' }} />
      <GlobalHeader />

      <div className="wn-teacher-register-shell min-h-screen py-10" dir="rtl">
        <div className="page-container max-w-3xl">
          <div className="text-center mb-8">
            <span className="section-label mb-4">انضم لفريق المعلمين</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">سجّل كمعلم قرآن</h1>
            <p className="text-slate-600 mt-2">5 خطوات واضحة لإكمال ملف التقديم</p>
          </div>

          <StepProgress current={f.step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={f.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="wn-teacher-register-card p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-1">{stepTitle}</h2>
              {f.fieldError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{f.fieldError}</p>
              )}

              {f.step === 1 && (
                <div className="space-y-4">
                  <div className="flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <span>أدخل بياناتك الأساسية — سيتم تأكيد البريد الإلكتروني في الخطوة التالية</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="الاسم الكامل *">
                      <input className={inputCls} value={f.formData.personalInfo.fullName}
                        onChange={(e) => f.update('personalInfo', 'fullName', e.target.value)} placeholder="الاسم رباعي" />
                    </Field>
                    <Field label="السن *">
                      <input type="number" min={18} max={80} className={inputCls} value={f.formData.personalInfo.age}
                        onChange={(e) => f.update('personalInfo', 'age', e.target.value)} />
                    </Field>
                    <Field label="العنوان *">
                      <input className={inputCls} value={f.formData.personalInfo.address}
                        onChange={(e) => f.update('personalInfo', 'address', e.target.value)} placeholder="المدينة، الشارع..." />
                    </Field>
                    <Field label="خريج أي (الجامعة) *">
                      <input className={inputCls} value={f.formData.academicInfo.university}
                        onChange={(e) => f.update('academicInfo', 'university', e.target.value)} />
                    </Field>
                    <Field label="سنة التخرج *">
                      <input type="number" className={inputCls} value={f.formData.academicInfo.graduationYear}
                        onChange={(e) => f.update('academicInfo', 'graduationYear', e.target.value)} />
                    </Field>
                    <Field label="البلد *">
                      <select className={inputCls} value={f.formData.personalInfo.country}
                        onChange={(e) => f.update('personalInfo', 'country', e.target.value)}>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="رقم التليفون *">
                      <input type="tel" dir="ltr" className={inputCls} placeholder="+2010XXXXXXXX"
                        value={f.formData.personalInfo.phone}
                        onChange={(e) => f.update('personalInfo', 'phone', e.target.value)} />
                    </Field>
                    <Field label="واتساب (اختياري للتواصل)">
                      <input type="tel" dir="ltr" className={inputCls} placeholder="نفس الرقم أو مختلف"
                        value={f.formData.personalInfo.whatsapp}
                        onChange={(e) => f.update('personalInfo', 'whatsapp', e.target.value)} />
                    </Field>
                    <Field label="تليجرام (اختياري)">
                      <input className={inputCls} placeholder="@username" value={f.formData.personalInfo.telegram}
                        onChange={(e) => f.update('personalInfo', 'telegram', e.target.value)} />
                    </Field>
                  </div>
                </div>
              )}

              {f.step === 2 && (
                <div className="space-y-5">
                  <div className="flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                    <Mail size={18} className="shrink-0 mt-0.5" />
                    <span>سنرسل كود تحقق من 6 أرقام إلى بريدك الإلكتروني. الكود صالح لمدة 10 دقائق.</span>
                  </div>
                  <Field label="البريد الإلكتروني *">
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
                      <input
                        type="email"
                        dir="ltr"
                        className={`${inputCls} pr-10`}
                        value={f.credentials.email}
                        disabled={f.isCodeSent}
                        onChange={(e) => f.setCredentials((p) => ({ ...p, email: e.target.value }))}
                        placeholder="name@example.com"
                      />
                    </div>
                  </Field>
                  {!f.isCodeSent ? (
                    <button type="button" onClick={f.sendCode}
                      className="btn-primary w-full">إرسال كود التحقق إلى البريد</button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 text-center">
                        تم إرسال الكود إلى <strong dir="ltr">{f.credentials.email}</strong>
                      </p>
                      <input className={`${inputCls} text-center text-2xl tracking-[0.5em]`} placeholder="000000"
                        inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={f.verificationCode}
                        onChange={(e) => f.setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                      <button type="button" onClick={f.verifyCode} className="btn-primary w-full">تأكيد البريد</button>
                      <button type="button" onClick={f.resetVerification}
                        className="text-sm text-slate-500 w-full">تغيير البريد أو إعادة الإرسال</button>
                    </div>
                  )}
                </div>
              )}

              {f.step === 3 && (
                <div className="space-y-4">
                  <div className="flex gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <span>تم تأكيد البريد <strong dir="ltr">{f.verifiedEmail}</strong> وسيُستخدم للحساب والإشعارات.</span>
                  </div>
                  <Field label="كلمة المرور *">
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
                      <input type={showPass ? 'text' : 'password'} className={`${inputCls} pr-10 pl-10`}
                        value={f.credentials.password}
                        onChange={(e) => f.setCredentials((p) => ({ ...p, password: e.target.value }))} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute left-3 top-3 text-slate-400">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="تأكيد كلمة المرور *">
                    <input type="password" className={inputCls} value={f.credentials.confirmPassword}
                      onChange={(e) => f.setCredentials((p) => ({ ...p, confirmPassword: e.target.value }))} />
                  </Field>
                </div>
              )}

              {f.step === 4 && (
                <div className="space-y-5">
                  <FileBox id="profilePhoto" label="صورة شخصية 4×6 *" accept="image/*" file={f.files.profilePhoto}
                    onChange={(file) => f.setFile('profilePhoto', file)}
                    preview={(file) => <img src={URL.createObjectURL(file)} alt="" className="h-32 rounded-lg object-cover" />} />

                  <div className="border-t border-slate-100 pt-4">
                    <p className="font-semibold text-slate-800 mb-3">مستندات اختيارية (تحت كل سؤال إن وُجد)</p>
                    <div className="space-y-3">
                      <FileBox id="idCard" label="بطاقة شخصية (اختياري)" accept="image/*,application/pdf" file={f.files.idCard}
                        onChange={(file) => f.setFile('idCard', file)} />
                      <FileBox id="gradCert" label="شهادة التخرج (اختياري)" accept="image/*,application/pdf" file={f.files.graduationCertificate}
                        onChange={(file) => f.setFile('graduationCertificate', file)} />
                      <FileBox id="tajweed" label="شهادات التجويد (اختياري)" accept="image/*,application/pdf" multiple
                        files={f.files.tajweedCertificates} onChange={(files) => f.setFile('tajweedCertificates', files)} />
                      <FileBox id="ijazat" label="الإجازات (اختياري)" accept="image/*,application/pdf" multiple
                        files={f.files.ijazat} onChange={(files) => f.setFile('ijazat', files)} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="text-emerald-600" size={20} />
                      <p className="font-semibold text-slate-800">فيديو تلاوة قرآنية *</p>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1 mb-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
                      {VIDEO_GUIDE.map((t) => <li key={t}>• {t}</li>)}
                    </ul>
                    <FileBox id="reciteVid" label="ارفع فيديو/فيديوهات التلاوة (3–5 دقائق)" accept="video/*" multiple
                      files={f.files.recitationVideos} onChange={(files) => f.setFile('recitationVideos', files)} />
                  </div>
                </div>
              )}

              {f.step === 5 && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <ReviewBlock title="البيانات" items={[
                      f.formData.personalInfo.fullName,
                      `السن: ${f.formData.personalInfo.age}`,
                      f.formData.personalInfo.address,
                      `${f.formData.personalInfo.country}`,
                      f.formData.personalInfo.phone,
                    ]} />
                    <ReviewBlock title="التعليم" items={[
                      f.formData.academicInfo.university,
                      `تخرج ${f.formData.academicInfo.graduationYear}`,
                    ]} />
                    <ReviewBlock title="الحساب" items={[f.credentials.email]} />
                    <ReviewBlock title="الملفات" items={[
                      f.files.profilePhoto ? '✓ صورة 4×6' : '✗ صورة',
                      f.files.recitationVideos?.length ? `✓ ${f.files.recitationVideos.length} فيديو تلاوة` : '✗ فيديو',
                    ]} />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900">
                    <Shield size={18} className="shrink-0" />
                    <span>بالضغط على إرسال، أنت توافق على مراجعة بياناتك من قبل إدارة الأكاديمية</span>
                  </div>
                  <button type="button" onClick={f.submit} disabled={f.submitting}
                    className="btn-primary w-full py-4 text-base disabled:opacity-50">
                    {f.submitting ? 'جاري الإرسال...' : 'إرسال الطلب للمراجعة'}
                  </button>
                </div>
              )}

              {f.step < 5 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                  <button type="button" onClick={f.prev} disabled={f.step === 1}
                    className="btn-secondary disabled:opacity-40">
                    <ArrowRight size={18} /> السابق
                  </button>
                  <button type="button" onClick={f.next} className="btn-primary">
                    التالي <ArrowLeft size={18} />
                  </button>
                </div>
              )}
              {f.step === 5 && (
                <button type="button" onClick={f.prev} className="btn-secondary mt-4">
                  <ArrowRight size={18} /> تعديل البيانات
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock size={14} /> ~8 دقائق</span>
            <span className="flex items-center gap-1"><Shield size={14} /> بياناتك مخصصة للمراجعة</span>
          </div>
        </div>
      </div>
      <GlobalFooter />
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ReviewBlock({ title, items }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="font-bold text-slate-800 mb-2">{title}</p>
      {items.filter(Boolean).map((t, i) => <p key={i} className="text-slate-600">{t}</p>)}
    </div>
  );
}