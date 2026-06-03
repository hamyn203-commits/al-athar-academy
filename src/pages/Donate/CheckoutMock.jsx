import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, AlertCircle, Sparkles, CheckCircle2, ChevronRight, CornerDownLeft } from 'lucide-react';
import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

const LOCALIZATION = {
  ar: {
    title: 'بوابة الدفع الآمنة (تجريبي)',
    subtitle: 'أكاديمية الأثر الطيب - نظام الدفع الافتراضي',
    cardNumber: 'رقم البطاقة',
    cardExpiry: 'تاريخ الانتهاء',
    cardCvc: 'رمز التحقق (CVC)',
    cardName: 'اسم صاحب البطاقة',
    payNow: 'إتمام التبرع الآمن',
    paypalLogin: 'تسجيل الدخول إلى PayPal',
    paypalEmail: 'البريد الإلكتروني لـ PayPal',
    paypalPass: 'كلمة المرور',
    processing: 'جاري معالجة المعاملة المالية...',
    confirming: 'جاري تأكيد التبرع في خوادم الأثر...',
    successTitle: 'تم التبرع بنجاح!',
    successSub: 'جزاكم الله خيراً. تم إرسال إيصال التبرع إلى بريدك الإلكتروني.',
    goBack: 'العودة لصفحة التبرعات',
    securityNotice: 'هذه بيئة دفع تجريبية آمنة لمحاكاة التبرع الحي.',
    summary: 'ملخص التبرع',
    category: 'الفئة',
    amount: 'المبلغ',
    sponsorStudent: 'كفالة طالب علم',
    sponsorTeacher: 'كفالة معلم قرآن',
    sponsorHalaqa: 'كفالة حلقة تحفيظ',
    generalDonation: 'تبرع عام للأكاديمية',
  },
  en: {
    title: 'Secure Checkout Portal (Sandbox)',
    subtitle: 'Al-Athar Academy - Simulated Payment Gateway',
    cardNumber: 'Card Number',
    cardExpiry: 'Expiration Date',
    cardCvc: 'CVC / CVV',
    cardName: 'Cardholder Name',
    payNow: 'Complete Secure Donation',
    paypalLogin: 'Log in to PayPal',
    paypalEmail: 'PayPal Email Address',
    paypalPass: 'Password',
    processing: 'Processing secure payment...',
    confirming: 'Confirming donation with Al-Athar servers...',
    successTitle: 'Donation Completed!',
    successSub: 'May Allah reward you. A pledge confirmation has been sent to your email.',
    goBack: 'Return to Donate Page',
    securityNotice: 'This is a secure simulated environment to test live credit card processing.',
    summary: 'Donation Summary',
    category: 'Category',
    amount: 'Amount',
    sponsorStudent: 'Sponsor a Student',
    sponsorTeacher: 'Sponsor a Teacher',
    sponsorHalaqa: 'Sponsor a Halaqa',
    generalDonation: 'General Donation',
  },
  id: {
    title: 'Portal Pembayaran Aman (Sandbox)',
    subtitle: 'Akademi Al-Athar - Gerbang Pembayaran Simulasi',
    cardNumber: 'Nomor Kartu',
    cardExpiry: 'Tanggal Kedaluwarsa',
    cardCvc: 'Kode CVC / CVV',
    cardName: 'Nama Pemegang Kartu',
    payNow: 'Selesaikan Donasi Aman',
    paypalLogin: 'Masuk ke PayPal',
    paypalEmail: 'Alamat Email PayPal',
    paypalPass: 'Kata Sandi',
    processing: 'Memproses pembayaran aman...',
    confirming: 'Mengonfirmasi donasi dengan server Al-Athar...',
    successTitle: 'Donasi Berhasil Selesai!',
    successSub: 'Semoga Allah membalas kebaikan Anda. Konfirmasi donasi telah dikirim ke email Anda.',
    goBack: 'Kembali ke Halaman Donasi',
    securityNotice: 'Ini adalah lingkungan simulasi aman untuk menguji pemrosesan pembayaran langsung.',
    summary: 'Ringkasan Donasi',
    category: 'Kategori',
    amount: 'Jumlah',
    sponsorStudent: 'Sponsori Siswa',
    sponsorTeacher: 'Sponsori Guru',
    sponsorHalaqa: 'Sponsori Halaqa',
    generalDonation: 'Donasi Umum',
  }
};

export default function CheckoutMock() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAr = locale === 'ar';
  
  const strings = LOCALIZATION[locale] || LOCALIZATION.en;

  const donationId = searchParams.get('donationId');
  const provider = searchParams.get('provider') || 'stripe';
  const rawAmount = searchParams.get('amount') || '100';
  const currency = searchParams.get('currency') || 'USD';
  const categoryId = searchParams.get('category') || 'general';

  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [paypalForm, setPaypalForm] = useState({ email: '', password: '' });
  const [stage, setStage] = useState('input'); // input, processing, confirming, success
  const [error, setError] = useState('');

  // Auto-format card number with spaces
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardForm({ ...cardForm, number: formatted });
  };

  // Auto-format expiry MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardForm({ ...cardForm, expiry: value });
  };

  // Auto-format CVC
  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCardForm({ ...cardForm, cvc: value });
  };

  const getCategoryName = (id) => {
    if (id === 'student') return strings.sponsorStudent;
    if (id === 'teacher') return strings.sponsorTeacher;
    if (id === 'halaqa') return strings.sponsorHalaqa;
    return strings.generalDonation;
  };

  const executePayment = async (e) => {
    e.preventDefault();
    if (!donationId) {
      setError('Missing donation reference ID.');
      return;
    }

    setError('');
    setStage('processing');

    // Simulate payment gateway delay
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setStage('confirming');

    try {
      // Hit backend confirm endpoint
      await api.put(`/api/donations/${donationId}/confirm-mock`);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStage('success');
    } catch (err) {
      setError(err.message || 'Payment confirmation failed on server.');
      setStage('input');
    }
  };

  return (
    <>
      <SEOHead page={{ url: '/donate/checkout-mock', title: strings.title, description: strings.subtitle }} />
      <GlobalHeader />
      <main className="min-h-screen bg-slate-950 text-white py-16 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Glow circles for premium visual look */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-300">
            {stage === 'input' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1 rounded-full text-xs text-rose-400 font-semibold border border-rose-500/20">
                    <ShieldCheck size={14} />
                    <span>{provider === 'stripe' ? 'Stripe Checkout' : 'PayPal Secure'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Lock size={12} className="text-emerald-500" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>

                <div className="mb-6 text-right-rtl">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">{strings.title}</h1>
                  <p className="text-slate-400 text-sm mt-1">{strings.subtitle}</p>
                </div>

                {/* Donation summary card */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-6 text-right-rtl">
                  <span className="text-slate-500 text-xs uppercase tracking-wider">{strings.summary}</span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-300 text-sm">{strings.category}:</span>
                    <span className="font-semibold text-white text-sm">{getCategoryName(categoryId)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-bold">{strings.amount}:</span>
                    <span className="text-xl font-black text-rose-400">{rawAmount} {currency}</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 mb-6 flex items-center gap-3 text-rose-300 text-sm">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={executePayment} className="space-y-4">
                  {provider === 'stripe' ? (
                    <>
                      {/* Credit Card inputs */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium block text-right-rtl">{strings.cardNumber}</label>
                        <div className="relative">
                          <input required type="text" placeholder="4000 1234 5678 9010"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 px-4 text-white text-sm tracking-widest placeholder:text-slate-700 outline-none transition"
                            value={cardForm.number} onChange={handleCardNumberChange} />
                          <CreditCard className="absolute right-4 top-3 text-slate-600 pointer-events-none" size={18} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium block text-right-rtl">{strings.cardExpiry}</label>
                          <input required type="text" placeholder="MM/YY"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 px-4 text-white text-sm text-center placeholder:text-slate-700 outline-none transition"
                            value={cardForm.expiry} onChange={handleExpiryChange} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium block text-right-rtl">{strings.cardCvc}</label>
                          <input required type="text" placeholder="123"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 px-4 text-white text-sm text-center placeholder:text-slate-700 outline-none transition"
                            value={cardForm.cvc} onChange={handleCvcChange} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium block text-right-rtl">{strings.cardName}</label>
                        <input required type="text" placeholder="Abdullah Al-Fulan"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-700 outline-none transition"
                          value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* PayPal inputs */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium block text-right-rtl">{strings.paypalEmail}</label>
                        <input required type="email" placeholder="user@paypal.com"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-700 outline-none transition"
                          value={paypalForm.email} onChange={(e) => setPaypalForm({ ...paypalForm, email: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium block text-right-rtl">{strings.paypalPass}</label>
                        <input required type="password" placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-700 outline-none transition"
                          value={paypalForm.password} onChange={(e) => setPaypalForm({ ...paypalForm, password: e.target.value })} />
                      </div>
                    </>
                  )}

                  <button type="submit" className={`w-full py-4 rounded-xl text-sm font-bold shadow-lg transition duration-200 mt-2 flex items-center justify-center gap-2 ${provider === 'stripe' ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                    <span>{strings.payNow}</span>
                    <Sparkles size={16} />
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500 text-right-rtl">
                  <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
                  <p>{strings.securityNotice}</p>
                </div>
              </>
            )}

            {(stage === 'processing' || stage === 'confirming') && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin" />
                  <Lock className="absolute top-5 left-5 text-slate-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white transition-all">
                  {stage === 'processing' ? strings.processing : strings.confirming}
                </h3>
                <p className="text-slate-500 text-xs mt-2 font-mono">Securing gateway handshake...</p>
              </div>
            )}

            {stage === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center text-right-rtl">
                <CheckCircle2 className="text-emerald-500 mb-6 animate-bounce" size={72} />
                <h2 className="text-2xl font-black text-white">{strings.successTitle}</h2>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed max-w-xs">{strings.successSub}</p>

                <button onClick={() => navigate('/donate')}
                  className="mt-8 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50 py-3 px-6 rounded-xl text-sm font-semibold transition flex items-center gap-2">
                  <CornerDownLeft size={16} />
                  <span>{strings.goBack}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
