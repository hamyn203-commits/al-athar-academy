import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Globe2, Mail, RefreshCw, Video, Wallet, MessageCircleMore } from 'lucide-react';
import { apiUrl } from '../../config';

const FEATURE_META = {
  email: { label: 'البريد الإلكتروني', icon: Mail },
  'manual-payment': { label: 'الدفع اليدوي', icon: Wallet },
  livekit: { label: 'الفصول المباشرة LiveKit', icon: Video },
  whatsapp: { label: 'WhatsApp', icon: MessageCircleMore },
};

const BLOCKER_LABEL = {
  CUSTOM_DOMAIN_NOT_CONFIGURED: 'الدومين الرسمي غير مربوط',
  EMAIL_DOMAIN_NOT_VERIFIED: 'دومين الإرسال غير موثق',
  FEATURE_E2E_NOT_VERIFIED: 'الاختبار الحقيقي E2E لم يكتمل',
  FEATURE_NOT_CONFIGURED: 'الخدمة غير مهيأة',
};

function statusPill(ok, yes = 'جاهز', no = 'غير جاهز') {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
      ok
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-800'
    }`}>
      {ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
      {ok ? yes : no}
    </span>
  );
}

export default function LaunchReadinessPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/launch-readiness'), {
        credentials: 'include',
        cache: 'no-store',
      });
      const body = await response.json().catch(() => null);
      if (body) {
        setData(body);
        setLastCheckedAt(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60000);

    const onFocus = () => load();
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  const blockersByFeature = useMemo(() => {
    const map = new Map();
    for (const blocker of data?.blockers || []) {
      const key = blocker.feature || 'platform';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(blocker.code);
    }
    return map;
  }, [data]);

  if (!data && loading) {
    return (
      <section className="wn-dashboard-surface mb-6">
        <div className="flex items-center gap-2 text-slate-500">
          <RefreshCw size={16} className="animate-spin" />
          جاري فحص جاهزية الإطلاق...
        </div>
      </section>
    );
  }

  if (!data) return null;

  const platformBlockers = blockersByFeature.get('platform') || [];
  const allReady = data.ready === true;

  return (
    <section className="wn-dashboard-surface mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 size={19} className={allReady ? 'text-emerald-600' : 'text-amber-600'} />
            <h3 className="font-black text-slate-900">جاهزية الإطلاق العام</h3>
            {statusPill(allReady, 'GO', 'NO-GO')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            هذه اللوحة تقرأ بوابة الإطلاق الفعلية. لا تعني صحة السيرفر وحدها أن الإطلاق التجاري جاهز.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          فحص الآن
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        {(data.requiredFeatures || []).map((featureName) => {
          const feature = data.features?.[featureName] || {};
          const meta = FEATURE_META[featureName] || { label: featureName, icon: CheckCircle2 };
          const Icon = meta.icon;
          const blockers = blockersByFeature.get(featureName) || [];
          const configured = feature.configured === true;
          const e2eVerified = feature.e2eVerified === true;
          const domainVerified = featureName === 'email' ? feature.domainVerified === true : null;

          return (
            <div key={featureName} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={17} className="text-slate-600" />
                  <strong className="text-sm text-slate-900">{meta.label}</strong>
                </div>
                {statusPill(blockers.length === 0)}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between gap-2">
                  <span>الإعداد</span>
                  <strong className={configured ? 'text-emerald-700' : 'text-amber-700'}>
                    {configured ? 'مكتمل' : 'ناقص'}
                  </strong>
                </div>

                {featureName === 'email' && (
                  <div className="flex justify-between gap-2">
                    <span>توثيق الدومين</span>
                    <strong className={domainVerified ? 'text-emerald-700' : 'text-amber-700'}>
                      {domainVerified ? 'موثق' : 'غير موثق'}
                    </strong>
                  </div>
                )}

                <div className="flex justify-between gap-2">
                  <span>اختبار E2E الحقيقي</span>
                  <strong className={e2eVerified ? 'text-emerald-700' : 'text-amber-700'}>
                    {e2eVerified ? 'ناجح' : 'مطلوب'}
                  </strong>
                </div>
              </div>

              {blockers.length > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-2 space-y-1">
                  {blockers.map((code) => (
                    <p key={code} className="text-[11px] text-amber-800">
                      • {BLOCKER_LABEL[code] || code}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">
            الدومين الرسمي: {data.customDomainConfigured ? 'مربوط ✓' : 'غير مربوط'}
          </p>
          {platformBlockers.map((code) => (
            <p key={code} className="text-xs text-amber-700 mt-1">
              {BLOCKER_LABEL[code] || code}
            </p>
          ))}
        </div>
        {lastCheckedAt && (
          <span className="text-[11px] text-slate-400">
            آخر فحص: {lastCheckedAt.toLocaleTimeString('ar-EG')}
          </span>
        )}
      </div>
    </section>
  );
}
