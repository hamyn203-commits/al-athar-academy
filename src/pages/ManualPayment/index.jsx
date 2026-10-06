import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Copy, CreditCard, Upload } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import LocalizedLink from '../../components/LocalizedLink';
import { useI18n } from '../../i18n';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import { uploadFileDirect } from '../../lib/fileUpload';

function textValue(value, locale) {
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.ar || value?.en || '';
}

export default function ManualPayment() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const toast = useToast();
  const [params] = useSearchParams();
  const slug = params.get('course') || '';
  const [course, setCourse] = useState(null);
  const [config, setConfig] = useState(null);
  const [method, setMethod] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/courses/' + encodeURIComponent(slug)),
      api.get('/api/payments/config'),
    ]).then(([courseData, paymentConfig]) => {
      setCourse(courseData);
      setConfig(paymentConfig);
      setMethod(paymentConfig?.methods?.[0]?.id || '');
    }).catch((error) => toast.error(error.message || (isAr ? 'تعذر تحميل بيانات الدفع' : 'Unable to load payment details')));
  }, [slug, toast, isAr]);

  const selectedMethod = useMemo(
    () => config?.methods?.find((item) => item.id === method),
    [config, method]
  );

  const copyDestination = async () => {
    if (!selectedMethod?.destination) return;
    await navigator.clipboard.writeText(selectedMethod.destination);
    toast.success(isAr ? 'تم النسخ' : 'Copied');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!proof) return toast.error(isAr ? 'ارفع إثبات التحويل أولًا' : 'Upload the transfer proof first');
    if (!method) return toast.error(isAr ? 'اختر طريقة التحويل' : 'Select a transfer method');

    setSubmitting(true);
    try {
      const storageFile = await uploadFileDirect(proof, 'payment-proof');
      const result = await api.post(
        '/api/payments/course/' + encodeURIComponent(slug) + '/manual',
        {
          method,
          transferReference: transferReference.trim(),
          proofReference: storageFile.url,
          proofFilename: storageFile.name,
          proofContentType: storageFile.contentType,
          proofSize: storageFile.size,
        },
        { auth: true }
      );
      setPaymentId(result.paymentId);
      toast.success(isAr ? 'تم إرسال إثبات التحويل للمراجعة' : 'Transfer proof submitted for review');
    } catch (error) {
      if (error.code === 'PAYMENT_REVIEW_PENDING' && error.data?.paymentId) {
        setPaymentId(error.data.paymentId);
      }
      toast.error(error.message || (isAr ? 'تعذر إرسال إثبات التحويل' : 'Unable to submit transfer proof'));
    } finally {
      setSubmitting(false);
    }
  };

  if (paymentId) {
    return (
      <>
        <GlobalHeader />
        <main className="wn-detail-shell min-h-[70vh] grid place-items-center px-4">
          <div className="wn-detail-card max-w-2xl w-full p-8 text-center">
            <CheckCircle size={52} className="mx-auto text-emerald-600 mb-4" />
            <h1 className="text-2xl font-bold mb-3">{isAr ? 'التحويل قيد المراجعة' : 'Transfer under review'}</h1>
            <p className="text-gray-600 mb-2">
              {isAr
                ? 'لن يتم تفعيل الدورة إلا بعد أن تتأكد الإدارة من وصول المبلغ فعليًا.'
                : 'The course will be activated only after the administration verifies that the funds were actually received.'}
            </p>
            <p className="text-xs text-gray-400 mb-6">Payment ID: {paymentId}</p>
            <LocalizedLink to="/student/dashboard" locale={locale} className="wn-btn wn-btn--primary">
              {isAr ? 'العودة إلى لوحة الطالب' : 'Back to student dashboard'}
            </LocalizedLink>
          </div>
        </main>
        <GlobalFooter />
      </>
    );
  }

  return (
    <>
      <GlobalHeader />
      <main className="wn-detail-shell">
        <div className="page-container py-10 max-w-3xl">
          <div className="wn-detail-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <CreditCard className="text-emerald-700" />
              <div>
                <h1 className="text-2xl font-bold">{isAr ? 'إرسال إثبات التحويل' : 'Submit transfer proof'}</h1>
                <p className="text-sm text-gray-500">{textValue(course?.title, locale) || slug}</p>
              </div>
            </div>

            {!config?.configured ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                {isAr ? 'طرق التحويل لم يتم تفعيلها بعد.' : 'Transfer methods are not configured yet.'}
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-sm text-gray-600">{isAr ? 'المبلغ المطلوب' : 'Amount due'}</p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {course?.price} {course?.currency || 'EGP'}
                  </p>
                  {config.recipientName ? <p className="text-xs text-gray-500 mt-1">{isAr ? 'اسم المستلم: ' : 'Recipient: '}{config.recipientName}</p> : null}
                </div>

                <label className="block">
                  <span className="text-sm font-semibold">{isAr ? 'طريقة التحويل' : 'Transfer method'}</span>
                  <select value={method} onChange={(event) => setMethod(event.target.value)} className="mt-2 w-full border rounded-xl px-3 py-3">
                    {config.methods.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isAr && item.id === 'mobile_wallet' ? 'محفظة إلكترونية' : item.label}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedMethod ? (
                  <div className="rounded-xl border p-4">
                    <p className="text-xs text-gray-500 mb-1">{isAr ? 'حوّل إلى' : 'Transfer to'}</p>
                    <div className="flex items-center justify-between gap-3">
                      <strong className="break-all">{selectedMethod.destination}</strong>
                      <button type="button" onClick={copyDestination} className="wn-btn wn-btn--secondary !px-3 !py-2"><Copy size={15} /></button>
                    </div>
                  </div>
                ) : null}

                <label className="block">
                  <span className="text-sm font-semibold">{isAr ? 'رقم/مرجع العملية (إن وجد)' : 'Transfer reference (if available)'}</span>
                  <input value={transferReference} onChange={(event) => setTransferReference(event.target.value)} maxLength={160} className="mt-2 w-full border rounded-xl px-3 py-3" />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">{isAr ? 'صورة أو PDF لإثبات التحويل' : 'Transfer proof image or PDF'}</span>
                  <div className="mt-2 border-2 border-dashed rounded-xl p-5 text-center">
                    <Upload size={26} className="mx-auto mb-2 text-emerald-700" />
                    <input
                      required
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(event) => setProof(event.target.files?.[0] || null)}
                    />
                    {proof ? <p className="text-xs text-emerald-700 mt-2">{proof.name}</p> : null}
                  </div>
                </label>

                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'رفع الإيصال لا يعني قبول الدفع تلقائيًا. الإدارة ستتحقق من وصول المبلغ ثم تفعّل الاشتراك.'
                    : 'Uploading a receipt does not automatically approve payment. Administration verifies actual receipt of funds before activation.'}
                </p>

                <button type="submit" disabled={submitting} className="wn-btn wn-btn--primary wn-btn--block wn-btn--lg disabled:opacity-60">
                  {submitting ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال للمراجعة' : 'Submit for review')}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
