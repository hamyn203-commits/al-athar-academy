import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, Lock, Mail, Phone, Eye, EyeOff, ArrowLeft, ArrowRight,
  CheckCircle2, Clock, Shield,
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useTeacherForm } from './useTeacherForm';
import StepProgress from './StepProgress';
import FileBox from './FileBox';
import { STEPS, COUNTRIES, SPEC_LABELS, LANG_OPTIONS } from './constants';

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
              ستصلك رسالة على بريدك عند الموافقة.
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
          {/* Hero */}
          <div className="text-center mb-8">
            <span className="section-label mb-4">انضم لفريق المعلمين</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">سجّل كمعلم قرآن</h1>
            <p className="text-slate-600 mt-2">7 خطوات بسيطة — بياناتك محفوظة تلقائياً</p>
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

              {/* Step 1 */}
              {f.step === 1 && (
                <div className="space-y-6">
                  <div className="flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <span>استخدم بريداً فعّالاً ورقم هاتف صحيح — سيتم التحقق منه في الخطوة التالية</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="الاسم الكامل *">
                      <input className={inputCls} value={f.formData.personalInfo.fullName}
                        onChange={(e) => f.update('personalInfo', 'fullName', e.target.value)} placeholder="الاسم رباعي" />
                    </Field>
                    <Field label="العمر *">
                      <input type="number" min={18} max={80} className={inputCls} value={f.formData.personalInfo.age}
                        onChange={(e) => f.update('personalInfo', 'age', e.target.value)} />
                    </Field>
                    <Field label="الجنس *">
                      <select className={inputCls} value={f.formData.personalInfo.gender}
                        onChange={(e) => f.update('personalInfo', 'gender', e.target.value)}>
                        <option value="">اختر</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </Field>
                    <Field label="الدولة *">
                      <select className={inputCls} value={f.formData.personalInfo.country}
                        onChange={(e) => f.update('personalInfo', 'country', e.target.value)}>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="المدينة *">
                      <input className={inputCls} value={f.formData.personalInfo.city}
                        onChange={(e) => f.update('personalInfo', 'city', e.target.value)} />
                    </Field>
                    <Field label="الهاتف *">
                      <input type="tel" dir="ltr" className={inputCls} placeholder="+201234567890"
                        value={f.formData.personalInfo.phone}
                        onChange={(e) => f.update('personalInfo', 'phone', e.target.value)} />
                    </Field>
                    <Field label="واتساب">
                      <input type="tel" dir="ltr" className={inputCls} value={f.formData.personalInfo.whatsapp}
                        onChange={(e) => f.update('personalInfo', 'whatsapp', e.target.value)} />
                    </Field>
                    <Field label="تليجرام">
                      <input className={inputCls} placeholder="@username" value={f.formData.personalInfo.telegram}
                        onChange={(e) => f.update('personalInfo', 'telegram', e.target.value)} />
                    </Field>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="grid md:grid-cols-2 gap-4">
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
                </div>
              )}

              {/* Step 2 */}
              {f.step === 2 && (
                <div className="space-y-5">
                  <p className="text-slate-600 text-sm">اختر طريقة استلام كود التحقق على <strong dir="ltr">{f.formData.personalInfo.phone}</strong></p>
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

              {/* Step 3 */}
              {f.step === 3 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {[['university', 'الجامعة *'], ['faculty', 'الكلية *'], ['graduationYear', 'سنة التخرج *'],
                    ['specialization', 'التخصص *'], ['qualification', 'المؤهل *']].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <input className={inputCls} type={key === 'graduationYear' ? 'number' : 'text'}
                        value={f.formData.academicInfo[key]}
                        onChange={(e) => f.update('academicInfo', key, e.target.value)} />
                    </Field>
                  ))}
                </div>
              )}

              {/* Step 4 */}
              {f.step === 4 && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="عدد الإجازات">
                      <input type="number" min={0} className={inputCls} value={f.formData.quranInfo.numberOfIjazat}
                        onChange={(e) => f.update('quranInfo', 'numberOfIjazat', Number(e.target.value))} />
                    </Field>
                    <Field label="الأجزاء المحفوظة">
                      <input type="number" min={0} max={30} className={inputCls} value={f.formData.quranInfo.memorizedParts}
                        onChange={(e) => f.update('quranInfo', 'memorizedParts', Number(e.target.value))} />
                    </Field>
                    <Field label="نوع الإجازة">
                      <input className={inputCls} value={f.formData.quranInfo.ijazaType}
                        onChange={(e) => f.update('quranInfo', 'ijazaType', e.target.value)} />
                    </Field>
                    <Field label="اسم الشيخ المجيز">
                      <input className={inputCls} value={f.formData.quranInfo.sheikhName}
                        onChange={(e) => f.update('quranInfo', 'sheikhName', e.target.value)} />
                    </Field>
                    <Field label="سنوات التدريس">
                      <input type="number" min={0} className={inputCls} value={f.formData.quranInfo.teachingExperience}
                        onChange={(e) => f.update('quranInfo', 'teachingExperience', Number(e.target.value))} />
                    </Field>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">التخصصات *</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SPEC_LABELS).map(([k, label]) => (
                        <button key={k} type="button" onClick={() => f.toggleSpec(k)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition ${
                            f.formData.quranInfo.specializations.includes(k)
                              ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-700'
                          }`}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">اللغات</p>
                    <div className="flex flex-wrap gap-2">
                      {LANG_OPTIONS.map(({ id, label }) => (
                        <button key={id} type="button" onClick={() => f.toggleLang(id)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition ${
                            f.formData.languages.includes(id)
                              ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200'
                          }`}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {f.step === 5 && (
                <div className="space-y-4">
                  <FileBox id="profilePhoto" label="صورة شخصية *" accept="image/*" file={f.files.profilePhoto}
                    onChange={(file) => f.setFile('profilePhoto', file)}
                    preview={(file) => <img src={URL.createObjectURL(file)} alt="" className="h-24 rounded-lg object-cover" />} />
                  <FileBox id="idCard" label="بطاقة شخصية *" accept="image/*,application/pdf" file={f.files.idCard}
                    onChange={(file) => f.setFile('idCard', file)} />
                  <FileBox id="gradCert" label="شهادة التخرج *" accept="image/*,application/pdf" file={f.files.graduationCertificate}
                    onChange={(file) => f.setFile('graduationCertificate', file)} />
                  <FileBox id="tajweed" label="شهادات التجويد (اختياري)" accept="image/*,application/pdf" multiple
                    files={f.files.tajweedCertificates} onChange={(files) => f.setFile('tajweedCertificates', files)} />
                  <FileBox id="ijazat" label="الإجازات (اختياري)" accept="image/*,application/pdf" multiple
                    files={f.files.ijazat} onChange={(files) => f.setFile('ijazat', files)} />
                </div>
              )}

              {/* Step 6 */}
              {f.step === 6 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">الفيديوهات تساعد الطلاب على معرفتك قبل الحجز (MP4 — حد أقصى 50MB)</p>
                  <FileBox id="introVid" label="فيديو تعريفي *" accept="video/*" file={f.files.introductionVideo}
                    onChange={(file) => f.setFile('introductionVideo', file)} />
                  <FileBox id="reciteVid" label="فيديو تلاوة *" accept="video/*" file={f.files.recitationVideo}
                    onChange={(file) => f.setFile('recitationVideo', file)} />
                  <FileBox id="teachVid" label="فيديو طريقة التدريس *" accept="video/*" file={f.files.teachingMethodVideo}
                    onChange={(file) => f.setFile('teachingMethodVideo', file)} />
                  <FileBox id="extraVid" label="فيديوهات إضافية (اختياري)" accept="video/*" multiple
                    files={f.files.additionalVideos} onChange={(files) => f.setFile('additionalVideos', files)} />
                  <FileBox id="audio" label="تسجيلات صوتية (اختياري)" accept="audio/*" multiple
                    files={f.files.audioRecordings} onChange={(files) => f.setFile('audioRecordings', files)} />
                </div>
              )}

              {/* Step 7 */}
              {f.step === 7 && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <ReviewBlock title="شخصي" items={[
                      f.formData.personalInfo.fullName,
                      `${f.formData.personalInfo.country} — ${f.formData.personalInfo.city}`,
                      f.formData.personalInfo.phone,
                      f.credentials.email,
                    ]} />
                    <ReviewBlock title="أكاديمي" items={[
                      f.formData.academicInfo.university,
                      f.formData.academicInfo.qualification,
                    ]} />
                    <ReviewBlock title="قرآني" items={[
                      `${f.formData.quranInfo.memorizedParts} جزء محفوظ`,
                      `${f.formData.quranInfo.numberOfIjazat} إجازة`,
                      f.formData.quranInfo.specializations.map((s) => SPEC_LABELS[s]).join('، '),
                    ]} />
                    <ReviewBlock title="ملفات" items={[
                      f.files.profilePhoto ? '✓ صورة شخصية' : '✗ صورة',
                      f.files.introductionVideo ? '✓ فيديو تعريفي' : '✗ فيديو',
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

              {/* Nav */}
              {f.step < 7 && (
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
              {f.step === 7 && (
                <button type="button" onClick={f.prev} className="btn-secondary mt-4">
                  <ArrowRight size={18} /> تعديل البيانات
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock size={14} /> ~10 دقائق</span>
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
