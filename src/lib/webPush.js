import api from './api';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

export async function enableWebPush() {
  if (!('Notification' in window)) {
    throw new Error('المتصفح لا يدعم الإشعارات');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('تم رفض إذن الإشعارات');
  }

  const reg = await navigator.serviceWorker.ready;
  const token = `web-${crypto.randomUUID?.() || Date.now()}`;

  await reg.showNotification('أكاديمية الأثر', {
    body: 'تم تفعيل الإشعارات — ستصلك تنبيهات الحصص والإنجازات',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: '/notifications' },
  });

  await api.post('/api/notifications/push-token', { token, platform: 'web' }, { auth: true });
  return token;
}

export function isPushSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}
