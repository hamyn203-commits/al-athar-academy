import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { enableWebPush, isPushSupported } from '../../lib/webPush';

export default function NotificationSettings() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ email: true, push: true, telegram: true, sms: false });
  const [telegramId, setTelegramId] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/settings/notifications');
      return;
    }
    api.get('/api/notifications/preferences', { auth: true })
      .then((d) => {
        if (d.preferences) setPrefs(d.preferences);
      })
      .catch(() => {});
  }, [isAuthenticated, navigate]);

  const savePrefs = async () => {
    await api.put('/api/notifications/preferences', { preferences: prefs }, { auth: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const registerTelegram = async () => {
    if (!telegramId.trim()) return;
    await api.post('/api/notifications/telegram-id', { telegramId }, { auth: true });
    alert('تم ربط Telegram');
  };

  const registerPush = async () => {
    setPushLoading(true);
    try {
      const token = await enableWebPush();
      setPushToken(token);
      setPrefs((p) => ({ ...p, push: true }));
      alert('تم تفعيل إشعارات الويب');
    } catch (err) {
      alert(err.message || 'فشل تفعيل الإشعارات');
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <main className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">إعدادات الإشعارات</h1>

        <div className="bg-white border rounded-xl p-6 space-y-4">
          {[
            { key: 'email', label: 'البريد الإلكتروني' },
            { key: 'push', label: 'إشعارات المتصفح' },
            { key: 'telegram', label: 'Telegram' },
            { key: 'sms', label: 'WhatsApp / SMS' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={!!prefs[key]}
                onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                className="w-5 h-5 accent-emerald-600"
              />
            </label>
          ))}

          <button onClick={savePrefs} className="btn-primary w-full">
            {saved ? '✓ تم الحفظ' : 'حفظ التفضيلات'}
          </button>
        </div>

        <div className="bg-white border rounded-xl p-6 mt-4 space-y-3">
          <h2 className="font-semibold">ربط Telegram</h2>
          <input
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="Chat ID"
            className="w-full border rounded-lg p-2"
          />
          <button onClick={registerTelegram} className="text-emerald-600 text-sm">ربط</button>
        </div>

        <div className="bg-white border rounded-xl p-6 mt-4 space-y-3">
          <h2 className="font-semibold">إشعارات PWA</h2>
          {!isPushSupported() ? (
            <p className="text-sm text-gray-500">المتصفح لا يدعم الإشعارات — ثبّت التطبيق من <Link to="/app" className="text-emerald-600">/app</Link></p>
          ) : (
            <>
              <button onClick={registerPush} disabled={pushLoading} className="btn-primary w-full text-sm">
                {pushLoading ? 'جاري التفعيل...' : 'تفعيل إشعارات الويب'}
              </button>
              {pushToken && <p className="text-xs text-gray-400 break-all">✓ مسجّل: {pushToken.slice(0, 24)}…</p>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
