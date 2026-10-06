import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock3, XCircle, RefreshCw } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import LocalizedLink from '../../components/LocalizedLink';
import { useI18n } from '../../i18n';
import api from '../../lib/api';
import '../../styles/public-experience.css';

const TERMINAL = new Set(['succeeded', 'failed', 'cancelled', 'refunded']);

export default function PaymentReturn() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [params] = useSearchParams();
  const paymentId = params.get('payment') || '';
  const courseSlug = params.get('course') || '';
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!paymentId) {
      setError(isAr ? 'مرجع الدفع غير موجود.' : 'Payment reference is missing.');
      setPolling(false);
      return undefined;
    }

    let cancelled = false;
    let attempts = 0;
    let timer;

    const load = async () => {
      attempts += 1;
      try {
        const data = await api.get('/api/payments/' + encodeURIComponent(paymentId) + '/status', { auth: true });
        if (cancelled) return;

        const next = data?.payment || null;
        setPayment(next);
        setError('');

        if (TERMINAL.has(next?.status) || attempts >= 15) {
          setPolling(false);
          return;
        }

        timer = window.setTimeout(load, 2000);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || (isAr ? 'تعذر قراءة حالة الدفع.' : 'Unable to read payment status.'));
        setPolling(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [paymentId, isAr]);

  const status = payment?.status || (polling ? 'pending' : '');
  const view = useMemo(() => {
    if (error) {
      return {
        Icon: XCircle,
        title: isAr ? 'تعذر التحقق من الدفع' : 'Unable to verify payment',
        text: error,
        tone: 'text-rose-600',
      };
    }

    if (status === 'succeeded') {
      return {
        Icon: CheckCircle,
        title: isAr ? 'تم تأكيد الدفع' : 'Payment confirmed',
        text: isAr
          ? 'تم تأكيد العملية من خادم الدفع، وأصبح التسجيل في الدورة متاحًا.'
          : 'The payment was confirmed by the server and your course enrollment is now active.',
        tone: 'text-emerald-600',
      };
    }

    if (status === 'failed' || status === 'cancelled') {
      return {
        Icon: XCircle,
        title: isAr ? 'لم تكتمل عملية الدفع' : 'Payment was not completed',
        text: isAr
          ? 'لم يتم تفعيل التسجيل. يمكنك المحاولة مرة أخرى من صفحة الدورة.'
          : 'Enrollment was not activated. You can try again from the course page.',
        tone: 'text-rose-600',
      };
    }

    if (status === 'refunded') {
      return {
        Icon: RefreshCw,
        title: isAr ? 'تم رد المبلغ' : 'Payment refunded',
        text: isAr
          ? 'تم تسجيل رد المبلغ وإيقاف التسجيل المرتبط بهذه العملية.'
          : 'The refund was recorded and the related enrollment has been disabled.',
        tone: 'text-amber-600',
      };
    }

    return {
      Icon: Clock3,
      title: isAr ? 'جارٍ التحقق من الدفع' : 'Verifying payment',
      text: isAr
        ? 'ننتظر تأكيد Paymob الآمن من الخادم. لا تغلق الصفحة إذا كنت قد أتممت الدفع للتو.'
        : 'We are waiting for the secure server callback from Paymob. Keep this page open if you just paid.',
      tone: 'text-[var(--wn-emerald)]',
    };
  }, [error, status, isAr]);

  const Icon = view.Icon;

  return (
    <>
      <GlobalHeader />
      <main className="wn-public-shell min-h-[70vh]">
        <section className="wn-utility-wrap">
          <div className="wn-utility-card max-w-xl mx-auto text-center">
            <Icon size={52} className={'mx-auto ' + view.tone + (polling ? ' animate-pulse' : '')} />
            <h1 className="mt-4 font-[var(--wn-font-display)] text-2xl text-[var(--wn-emerald-deep)]">
              {view.title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--wn-text-secondary)]">{view.text}</p>

            <div className="mt-6 grid gap-2">
              {status === 'succeeded' && courseSlug ? (
                <LocalizedLink to={'/courses/' + courseSlug} locale={locale} className="wn-btn wn-btn--primary wn-btn--block">
                  {isAr ? 'الذهاب إلى الدورة' : 'Go to course'}
                </LocalizedLink>
              ) : null}
              {courseSlug ? (
                <LocalizedLink to={'/courses/' + courseSlug} locale={locale} className="wn-btn wn-btn--secondary wn-btn--block">
                  {isAr ? 'العودة إلى صفحة الدورة' : 'Back to course'}
                </LocalizedLink>
              ) : (
                <LocalizedLink to="/courses" locale={locale} className="wn-btn wn-btn--secondary wn-btn--block">
                  {isAr ? 'عرض الدورات' : 'Browse courses'}
                </LocalizedLink>
              )}
            </div>

            <p className="mt-5 text-[11px] text-[var(--wn-text-tertiary)]">
              {isAr
                ? 'حالة التسجيل تعتمد على تأكيد الخادم الموقّع، وليس على بيانات صفحة الرجوع.'
                : 'Enrollment depends on the signed server callback, not on redirect-page parameters.'}
            </p>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
