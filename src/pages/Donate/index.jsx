import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, CircleDollarSign, Users, BookOpen, CheckCircle } from 'lucide-react';
import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

const PM_STRINGS = {
  ar: {
    method: 'طريقة الدفع التفاعلية',
    stripe: 'بطاقة ائتمان (Stripe)',
    paypal: 'حساب PayPal الإلكتروني',
    manual: 'تعهد بالتبرع غير المباشر (نقدي/تحويل)',
    payButton: 'الانتقال لبوابة الدفع الآمنة',
    pledgeButton: 'تعهد بالتبرع الآن',
  },
  en: {
    method: 'Interactive Payment Method',
    stripe: 'Credit/Debit Card (Stripe)',
    paypal: 'PayPal Account',
    manual: 'Manual Pledge (Cash/Bank Transfer)',
    payButton: 'Proceed to Secure Payment',
    pledgeButton: 'Submit Donation Pledge',
  },
  id: {
    method: 'Metode Pembayaran Interaktif',
    stripe: 'Kartu Kredit/Debit (Stripe)',
    paypal: 'Akun PayPal',
    manual: 'Komitmen Manual (Tunai/Transfer Bank)',
    payButton: 'Lanjutkan ke Pembayaran Aman',
    pledgeButton: 'Kirim Komitmen Donasi',
  }
};

const CATEGORIES = [
  { id: 'student', icon: Users, ar: 'كفالة طالب', en: 'Sponsor a Student' },
  { id: 'teacher', icon: BookOpen, ar: 'كفالة معلم', en: 'Sponsor a Teacher' },
  { id: 'halaqa', icon: HeartHandshake, ar: 'كفالة حلقة قرآن', en: 'Sponsor a Halaqa' },
  { id: 'general', icon: CircleDollarSign, ar: 'تبرع عام', en: 'General Donation' },
];

const GOAL = 10000;

export default function Donate() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isAr = locale === 'ar';
  const [stats, setStats] = useState({ totalAmount: 0, totalDonors: 0 });
  const [form, setForm] = useState({ name: '', email: '', phone: '', amount: 100, currency: 'USD', category: 'general', message: '', isAnonymous: false });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [payConfig, setPayConfig] = useState({ paymentEnabled: false });

  useEffect(() => {
    Promise.all([
      api.get('/api/donations/stats'),
      api.get('/api/donations/config'),
    ]).then(([stats, cfg]) => {
      setStats(stats);
      setPayConfig(cfg);
    }).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/donations', form);
      if (paymentMethod === 'manual') {
        setDone(true);
      } else {
        navigate(`/donate/checkout-mock?donationId=${res.id}&provider=${paymentMethod}&amount=${form.amount}&currency=${form.currency}&category=${form.category}`);
      }
    } catch (err) {
      alert(err.message || (isAr ? 'فشل الإرسال' : 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead page={{ url: '/donate', title: isAr ? 'تبرع | أكاديمية الأثر' : 'Donate | Al-Athar', description: isAr ? 'كفالة طالب أو معلم أو حلقة قرآن' : 'Sponsor students, teachers, or halaqas' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <HeartHandshake className="mx-auto text-rose-600 mb-4" size={48} />
            <h1 className="text-4xl font-bold mb-3">{isAr ? 'ساهم في نشر العلم' : 'Support Islamic Education'}</h1>
            <p className="text-gray-600">{isAr ? 'تبرعك يساعد طلاباً محتاجين على تعلم القرآن' : 'Your donation helps students learn the Quran'}</p>
            {stats.totalDonors > 0 && (
              <p className="mt-4 text-sm text-rose-700 font-semibold">{stats.totalDonors} {isAr ? 'متبرع' : 'donors'} · ${stats.totalAmount}</p>
            )}
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{isAr ? 'هدف الحملة' : 'Campaign goal'}</span>
                <span>${stats.totalAmount || 0} / ${GOAL}</span>
              </div>
              <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats.totalAmount || 0) / GOAL) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = form.category === c.id;
              return (
                <button key={c.id} type="button" onClick={() => setForm({ ...form, category: c.id })}
                  className={`p-5 rounded-2xl border-2 text-right transition ${active ? 'border-rose-500 bg-rose-50' : 'border-gray-100 bg-white hover:border-rose-200'}`}>
                  <Icon className={`mb-2 ${active ? 'text-rose-600' : 'text-gray-400'}`} size={28} />
                  <p className="font-bold">{isAr ? c.ar : c.en}</p>
                </button>
              );
            })}
          </div>

          {done ? (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
              <CheckCircle className="mx-auto text-emerald-600 mb-4" size={56} />
              <h2 className="text-2xl font-bold mb-2">{isAr ? 'شكراً لتبرعك!' : 'Thank you!'}</h2>
              <p className="text-gray-600">{isAr ? 'سنتواصل معك لإتمام عملية التبرع' : 'We will contact you to complete your pledge'}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input required placeholder={isAr ? 'الاسم' : 'Name'} className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input required type="email" placeholder={isAr ? 'البريد' : 'Email'} className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input placeholder={isAr ? 'الهاتف' : 'Phone'} className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <div className="flex gap-2">
                  <input required type="number" min={1} className="input-field flex-1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  <select className="input-field w-24" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    {['USD', 'EUR', 'SAR', 'AED', 'EGP'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <textarea placeholder={isAr ? 'رسالة (اختياري)' : 'Message (optional)'} className="input-field min-h-[80px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              
              <div className="space-y-2 border-t border-gray-150 pt-4 text-right-rtl">
                <label className="text-sm font-bold text-gray-700 block text-right-rtl">{PM_STRINGS[locale]?.method || PM_STRINGS.en.method}</label>
                <div className="grid gap-2">
                  {['stripe', 'paypal', 'manual'].map((method) => {
                    const active = paymentMethod === method;
                    const labels = PM_STRINGS[locale] || PM_STRINGS.en;
                    return (
                      <label key={method} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${active ? 'border-rose-500 bg-rose-50/30' : 'border-gray-100 hover:border-gray-200'} ${isAr ? 'flex-row-reverse' : ''}`}>
                        <input type="radio" name="paymentMethod" value={method} checked={active} onChange={() => setPaymentMethod(method)} className="text-rose-600 focus:ring-rose-500" />
                        <span className="text-sm font-semibold text-gray-800 flex-1 text-right-rtl">{labels[method]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 text-right-rtl">
                <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
                {isAr ? 'تبرع مجهول' : 'Anonymous donation'}
              </label>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? '...' : (paymentMethod === 'manual' 
                  ? (PM_STRINGS[locale]?.pledgeButton || PM_STRINGS.en.pledgeButton) 
                  : (PM_STRINGS[locale]?.payButton || PM_STRINGS.en.payButton))}
              </button>
              <p className="text-xs text-gray-400 text-center">
                {payConfig.paymentEnabled
                  ? (isAr ? 'يمكنك أيضاً الدفع مباشرة عبر الرابط أدناه' : 'You can also pay directly via the link below')
                  : (isAr ? 'سنتواصل معك لإتمام التبرع — أو فعّل STRIPE_DONATION_URL' : 'We will contact you to complete your pledge')}
              </p>
              {payConfig.paymentEnabled && (
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  {payConfig.stripeUrl && (
                    <a href={payConfig.stripeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2 text-sm">
                      {isAr ? 'ادفع عبر Stripe' : 'Pay with Stripe'}
                    </a>
                  )}
                  {payConfig.paypalUrl && (
                    <a href={payConfig.paypalUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2 text-sm !bg-blue-600">
                      PayPal
                    </a>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
