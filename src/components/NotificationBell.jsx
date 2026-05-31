import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

function pickText(obj, locale = 'ar') {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[locale] || obj.ar || obj.en || '';
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!api.getToken()) return;
      const data = await api.get('/api/notifications?limit=10', { auth: true });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, {}, { auth: true });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all', {}, { auth: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'session-request': '📅',
      'session-accepted': '✅',
      'session-rejected': '❌',
      'session-completed': '🎓',
      'course-enrollment': '📚',
      'certificate-issued': '🏆',
      'homework-assigned': '📝',
      'system': '🔔',
    };
    return icons[type] || '🔔';
  };

  const getNotificationLink = (notification) => {
    if (notification.data?.meetingLink) return notification.data.meetingLink;
    const links = {
      'session-request': '/teacher/dashboard',
      'session-accepted': '/student/dashboard',
      'session-rejected': '/student/dashboard',
      'course-enrollment': '/student/dashboard',
      'certificate-issued': '/student/dashboard',
    };
    return links[notification.type] || '/notifications';
  };

  const isExternal = (url) => url?.startsWith('http');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 transition"
        aria-label="الإشعارات"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">الإشعارات</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition flex items-center gap-1"
                  >
                    <CheckCheck size={16} />
                    تعليم الكل
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="mx-auto mb-2 text-gray-400" size={40} />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const href = getNotificationLink(notification);
                    const content = (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm text-gray-900">
                                {pickText(notification.title)}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {pickText(notification.message)}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleString('ar-EG')}
                            </p>
                          </div>
                        </div>
                      </>
                    );

                    const clickHandler = () => {
                      if (!notification.isRead) markAsRead(notification._id);
                      setIsOpen(false);
                    };

                    return isExternal(href) ? (
                      <a
                        key={notification._id}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={clickHandler}
                        className={`block p-4 hover:bg-gray-50 transition ${!notification.isRead ? 'bg-emerald-50' : ''}`}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        key={notification._id}
                        to={href}
                        onClick={clickHandler}
                        className={`block p-4 hover:bg-gray-50 transition ${!notification.isRead ? 'bg-emerald-50' : ''}`}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t p-3 bg-gray-50">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
