import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function NotificationSettings() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ email: true, push: true, telegram: true, sms: false });
  const [telegramId, setTelegramId] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [saved, setSaved] = useState(false);

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
    const token = pushToken.trim() || `web-${Date.now()}`;
    await api.post('/api/notifications/push-token', { token, platform: 'web' }, { auth: true });
    setPushToken(token);
    alert('تم تسجيل Push');
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
          <h2 className="font-semibold">Push Token (Web)</h2>
          <button onClick={registerPush} className="btn-primary w-full text-sm">تفعيل إشعارات الويب</button>
          {pushToken && <p className="text-xs text-gray-400 break-all">{pushToken}</p>}
        </div>
      </main>
    </div>
  );
}
