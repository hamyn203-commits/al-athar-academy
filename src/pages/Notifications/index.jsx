import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function pickText(obj, locale = 'ar') {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[locale] || obj.ar || obj.en || '';
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/notifications');
      return;
    }
    load();
  }, [isAuthenticated, navigate]);

  const load = async () => {
    try {
      const data = await api.get('/api/notifications?limit=50', { auth: true });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`, {}, { auth: true });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await api.put('/api/notifications/read-all', {}, { auth: true });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell /> الإشعارات
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button onClick={markAll} className="text-sm text-emerald-600 flex items-center gap-1">
              <CheckCheck size={16} /> تعليم الكل
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">جاري التحميل...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا توجد إشعارات</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`bg-white border rounded-lg p-4 ${!n.isRead ? 'border-emerald-200 bg-emerald-50/50' : ''}`}
              >
                <div className="flex justify-between gap-2">
                  <h3 className="font-semibold">{pickText(n.title)}</h3>
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n._id)} className="text-xs text-emerald-600 shrink-0">
                      مقروء
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">{pickText(n.message)}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString('ar-EG')}</p>
                {n.data?.meetingLink && (
                  <a href={n.data.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 mt-2 inline-block">
                    انضم للحصة ←
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <Link to="/settings/notifications" className="block text-center mt-6 text-emerald-600 text-sm">
          إعدادات الإشعارات
        </Link>
      </main>
    </div>
  );
}
