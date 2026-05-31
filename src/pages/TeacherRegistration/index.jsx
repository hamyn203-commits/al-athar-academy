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

const inputCls = 'input-field w-full';

export default function TeacherRegistration() {
  const [showPass, setShowPass] = useState(false);
  const f = useTeacherForm();

  if (f.submitted) {
    return (
      <>
        <GlobalHeader />
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4" dir="rtl">
          <div className="card-modern max-w-lg w-full text-center p-10">
            <CheckCircle2 className="mx-auto text-emerald-600 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">تم إرسال طلبك! 🎉</h1>
            <p className="text-slate-600 mb-6">
              سيقوم فريق الأكاديمية بمراجعة بياناتك خلال <strong>24–48 ساعة</strong>.
              ستصلك رسالة على <strong>{f.credentials.email}</strong> عند الموافقة.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn-primary">تسجيل الدخول</Link>
              <Link to="/" className="btn-secondary">العودة للرئيسية</Link>
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
      <SEOHead page={{ title: 'تسجيل معلم', description: 'انضم كمعلم قرآن في أكاديمية الأثر الطيب', url: '/teacher/register' }} />
      <GlobalHeader />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white py-10" dir="rtl">
        <div className="page-container max-w-3xl">
          <div className="text-center mb-8">
            <span className="section-label mb-4">انضم لفريق المعلمين</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">سجّل كمعلم قرآن</h1>
            <p className="text-slate-600 mt-2">5 خطوات — بياناتك محفوظة تلقائياً</p>
          </div>

          <StepProgress current={f.step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={f.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="card-modern p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-1">{stepTitle}</h2>
              {f.fieldError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{f.fieldError}</p>
              )}

              {f.step === 1 && (
                <div className="space-y-4">
                  <div className="flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <span>أدخل بياناتك الأساسية — سيتم تأكيد الهاتف في الخطوة التالية</span>
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
                      <input type="tel" dir="ltr" className={inputCls} placeholder="+201234567890"
                        value={f.formData.personalInfo.phone}
                        onChange={(e) => f.update('personalInfo', 'phone', e.target.value)} />
                    </Field>
                    <Field label="واتساب (للتحقق)">
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
                  <p className="text-slate-600 text-sm">
                    اختر طريقة استلام كود التحقق على <strong dir="ltr">{f.formData.personalInfo.phone}</strong>
                    — مجاني عبر واتساب أو تليجرام
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {['whatsapp', 'telegram'].map((m) => (
                      <button key={m} type="button" onClick={() => f.setVerificationMethod(m)}
                        className={`p-5 rounded-xl border-2 text-center transition ${
                          f.verificationMethod === m ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'
                        }`}>
                        <span className="text-3xl">{m === 'whatsapp' ? '💬' : '✈️'}</span>
                        <p className="font-bold mt-2">{m === 'whatsapp' ? 'واتساب' : 'تليجرام'}</p>
                      </button>
                    ))}
                  </div>
                  {!f.isCodeSent ? (
                    <button type="button" onClick={f.sendCode} disabled={!f.verificationMethod}
                      className="btn-primary w-full disabled:opacity-50">إرسال كود التحقق</button>
                  ) : (
                    <div className="space-y-3">
                      <input className={`${inputCls} text-center text-2xl tracking-[0.5em]`} placeholder="000000"
                        maxLength={6} value={f.verificationCode}
                        onChange={(e) => f.setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                      <button type="button" onClick={f.verifyCode} className="btn-primary w-full">تحقق</button>
                      <button type="button" onClick={() => { f.setIsCodeSent(false); f.setVerificationCode(''); }}
                        className="text-sm text-slate-500 w-full">إعادة الإرسال</button>
                    </div>
                  )}
                  <button type="button" onClick={f.skipVerification}
                    className="w-full text-sm text-slate-500 hover:text-emerald-700 py-2 border-t border-slate-100 mt-2">
                    تخطي الآن — التحقق لاحقاً من الإدارة
                  </button>
                </div>
              )}

              {f.step === 3 && (
                <div className="space-y-4">
                  <div className="flex gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
                    <Mail size={18} className="shrink-0" />
                    <span>البريد لاستلام رسائل الموافقة والحصص والإشعارات</span>
                  </div>
                  <Field label="البريد الإلكتروني *">
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
                      <input type="email" dir="ltr" className={`${inputCls} pr-10`} value={f.credentials.email}
                        onChange={(e) => f.setCredentials((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                  </Field>
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
            <span className="flex items-center gap-1"><Shield size={14} /> بياناتك مشفرة</span>
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
