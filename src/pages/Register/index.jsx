import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, CheckCircle,
  Sparkles, CheckCircle2, Clock, BookOpen, Award, Globe, ArrowLeft, Star
} from 'lucide-react';
import Logo from '../../components/Logo';
import { useI18n } from '../../i18n';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  
  // Custom plan parameters from landing page planner
  const planPath = searchParams.get('path') || '';
  const planFreq = searchParams.get('freq') || '';
  const planLevel = searchParams.get('level') || '';

  const { locale } = useI18n();
  const isRtl = locale === 'ar';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // التحقق من تطابق كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 8) {
      setError(locale === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'student',
          ...(referralCode ? { referralCode } : {}),
          // Pass pre-selected plan parameters to auth registration if backend supports it
          ...(planPath ? { selectedPlan: { path: planPath, freq: planFreq, level: planLevel } } : {}),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }

      // حفظ الـ token وبيانات المستخدم
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // التوجيه إلى لوحة الطالب
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Translations for plan summaries
  const pathNames = {
    hifz: locale === 'ar' ? 'حفظ القرآن وتجويده' : 'Quran Memorization & Tajweed',
    tajweed: locale === 'ar' ? 'أحكام التجويد ومخارج الحروف' : 'Tajweed & Pronunciation Rules',
    arabic: locale === 'ar' ? 'اللغة العربية الفصحى' : 'Classical Arabic (Fus’ha)'
  };

  const levelNames = {
    beginner: locale === 'ar' ? 'مبتدئ' : 'Beginner',
    intermediate: locale === 'ar' ? 'متوسط' : 'Intermediate',
    advanced: locale === 'ar' ? 'متقدم' : 'Advanced'
  };

  const getEstimatedDuration = () => {
    const frequency = parseInt(planFreq) || 2;
    if (planPath === 'hifz') {
      if (frequency === 1) return locale === 'ar' ? '4.5 سنوات' : '4.5 Years';
      if (frequency === 2) return locale === 'ar' ? '2.5 سنة' : '2.5 Years';
      if (frequency === 3) return locale === 'ar' ? '1.5 سنة' : '1.5 Years';
      return locale === 'ar' ? '10 أشهر' : '10 Months';
    } else if (planPath === 'tajweed') {
      if (frequency === 1) return locale === 'ar' ? '6 أشهر' : '6 Months';
      if (frequency === 2) return locale === 'ar' ? '4 أشهر' : '4 Months';
      if (frequency === 3) return locale === 'ar' ? '3 أشهر' : '3 Months';
      return locale === 'ar' ? '6 أسابيع' : '6 Weeks';
    } else {
      if (frequency === 1) return locale === 'ar' ? '1.5 سنة' : '1.5 Years';
      if (frequency === 2) return locale === 'ar' ? '9 أشهر' : '9 Months';
      if (frequency === 3) return locale === 'ar' ? '6 أشهر' : '6 Months';
      return locale === 'ar' ? '3 أشهر' : '3 Months';
    }
  };

  const getEstimatedPrice = () => {
    const frequency = parseInt(planFreq) || 2;
    const monthlyHours = frequency * 4;
    const usdPrice = monthlyHours * 10;
    const egpPrice = monthlyHours * 50;
    return { usd: usdPrice, egp: egpPrice };
  };

  const planPrice = getEstimatedPrice();
  const planDuration = getEstimatedDuration();

  // Dynamic style values based on language direction
  const iconStyle = isRtl ? { right: '16px' } : { left: '16px' };
  const inputPadding = isRtl ? '14px 50px 14px 16px' : '14px 16px 14px 50px';

  return (
    <div className="geo-pattern-light min-h-screen flex items-center justify-center p-4 md:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Brand Intro & Plan Details */}
        <motion.div
          initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-[var(--athar-navy)] text-white shadow-xl relative overflow-hidden"
        >
          {/* Subtle Arabesque Watermark */}
          <div className="absolute inset-0 opacity-15 pointer-events-none geo-pattern-athar" aria-hidden="true" />
          
          <div className="relative">
            {/* Header Brand */}
            <div className="flex items-center gap-3 mb-8">
              <Logo size={42} showText={false} />
              <div>
                <h1 className="font-naskh text-lg font-bold tracking-wide">أكاديمية الأثر الطيب</h1>
                <p className="text-[10px] text-[var(--athar-gold-light)]">أثر يساوي حياة</p>
              </div>
            </div>

            <h2 className="font-naskh text-3xl md:text-4xl font-bold leading-snug mb-4">
              {locale === 'ar' ? 'ابدأ رحلتك القرآنية المباركة' : 'Start Your Blessed Quranic Journey'}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {locale === 'ar'
                ? 'انضم إلينا اليوم لتتعلم كتاب الله الكريم على يد نخبة من أمهر المعلمين والمعلمات المجازين أونلاين.'
                : 'Join us today to learn the Holy Quran from native certified scholars online at your own schedule.'}
            </p>

            {/* Custom Plan summary if present */}
            {planPath ? (
              <div className="rounded-2xl border border-[var(--athar-gold)]/30 bg-white/5 p-6 backdrop-blur-sm mt-8 space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--athar-gold)]/20 px-3 py-1 text-xs font-semibold text-[var(--athar-gold-light)]">
                  <Sparkles size={12} />
                  {locale === 'ar' ? 'خطة الدراسة المختارة' : 'Selected Study Plan'}
                </span>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">{locale === 'ar' ? 'المسار التعليمي:' : 'Learning Path:'}</p>
                    <p className="text-base font-bold text-[var(--athar-gold-light)]">{pathNames[planPath] || planPath}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs text-slate-400">{locale === 'ar' ? 'المستوى الحالي:' : 'Current Level:'}</p>
                      <p className="text-sm font-semibold">{levelNames[planLevel] || planLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{locale === 'ar' ? 'الحصص شهرياً:' : 'Sessions Monthly:'}</p>
                      <p className="text-sm font-semibold">{parseInt(planFreq) * 4} {locale === 'ar' ? 'حصص' : 'sessions'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs text-slate-400">{locale === 'ar' ? 'المدة المقدرة:' : 'Estimated Duration:'}</p>
                      <p className="text-sm font-bold text-emerald-400">{planDuration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{locale === 'ar' ? 'التكلفة الشهرية:' : 'Monthly Cost:'}</p>
                      <p className="text-sm font-bold text-[var(--athar-gold-light)]">{planPrice.egp} ج.م <span className="text-[10px] text-slate-300">/ {planPrice.usd}$</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Perks summary if no custom plan is passed
              <div className="space-y-4 mt-8">
                {[
                  { title: locale === 'ar' ? 'معلمون مجازون من الأزهر الشريف' : 'Al-Azhar Certified Native Tutors' },
                  { title: locale === 'ar' ? 'فصول حية تفاعلية 1-on-1 بالكامل' : '100% Live 1-on-1 Interactive Classes' },
                  { title: locale === 'ar' ? 'خطط حفظ ودراسة ذكية ومرنة' : 'Adaptive and Smart Memorization Plans' },
                  { title: locale === 'ar' ? 'شهادات تخرج إلكترونية معتمدة' : 'Verified Digital Graduation Certificates' }
                ].map((perk, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[var(--athar-gold)] mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-200">{perk.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Proof rating */}
          <div className="pt-8 mt-8 border-t border-white/10 relative">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-white">4.9 {locale === 'ar' ? 'على Trustpilot' : 'on Trustpilot'}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {locale === 'ar' ? 'انضم إلى +5000 طالب وطالبة حول العالم' : 'Trusted by +5,000 students globally'}
            </p>
          </div>
        </motion.div>

        {/* Right Column: Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 glass-card p-6 md:p-10 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6">
              <h2 className="font-naskh text-2xl md:text-3xl font-bold text-[var(--athar-text)]">
                {locale === 'ar' ? 'إنشاء حساب طالب' : 'Create Student Account'}
              </h2>
              <p className="text-sm text-[var(--athar-text-muted)] mt-1">
                {locale === 'ar' ? 'أدخل بياناتك لإنشاء حسابك وبدء التعلم' : 'Fill in your details to create your account'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm flex items-start gap-2.5"
              >
                <span className="font-bold shrink-0">!</span>
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--athar-text)] mb-2">
                  {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User size={18} style={iconStyle} className="absolute top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    style={{ padding: inputPadding }}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition focus:border-[var(--athar-gold)] focus:ring-2 focus:ring-[var(--athar-gold)]/10"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[var(--athar-text)] mb-2">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail size={18} style={iconStyle} className="absolute top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    style={{ padding: inputPadding }}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition focus:border-[var(--athar-gold)] focus:ring-2 focus:ring-[var(--athar-gold)]/10"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[var(--athar-text)] mb-2">
                  {locale === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
                </label>
                <div className="relative">
                  <Phone size={18} style={iconStyle} className="absolute top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+20 123 456 7890"
                    style={{ padding: inputPadding }}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition focus:border-[var(--athar-gold)] focus:ring-2 focus:ring-[var(--athar-gold)]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[var(--athar-text)] mb-2">
                  {locale === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock size={18} style={iconStyle} className="absolute top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    style={{ padding: inputPadding }}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition focus:border-[var(--athar-gold)] focus:ring-2 focus:ring-[var(--athar-gold)]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={isRtl ? { left: '16px' } : { right: '16px' }}
                    className="absolute top-1/2 transform -translate-y-1/2 background-none border-none cursor-pointer text-slate-400 p-1 flex items-center"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && formData.password.length >= 8 && (
                  <div className="mt-2 flex items-center gap-1.5 text-emerald-600 text-xs">
                    <CheckCircle size={14} />
                    {locale === 'ar' ? 'كلمة مرور قوية ومقبولة' : 'Strong secure password'}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[var(--athar-text)] mb-2">
                  {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock size={18} style={iconStyle} className="absolute top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    style={{ padding: inputPadding }}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition focus:border-[var(--athar-gold)] focus:ring-2 focus:ring-[var(--athar-gold)]/10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full justify-center text-sm py-3.5 shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {locale === 'ar' ? 'إنشاء الحساب وبدء الدراسة' : 'Create Account & Begin'}
                    {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Login redirection */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-[var(--athar-text-muted)] mb-3">
              {locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--athar-gold)]/40 bg-white px-8 py-2.5 text-xs font-bold text-[var(--athar-gold-muted)] hover:bg-[var(--athar-gold-50)] transition"
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <div className="mt-4">
              <button
                onClick={() => navigate('/')}
                className="text-xs text-[var(--athar-gold-muted)] hover:text-[var(--athar-gold)] hover:underline"
              >
                {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Homepage'}
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
