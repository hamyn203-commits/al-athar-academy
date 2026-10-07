import { useEffect, useRef } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../context/ToastProvider';
import { useI18n } from '../i18n';
import api from '../lib/api';

function localized(value, locale) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value.ar || value.en || '';
}

function connectionId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function RealtimeBridge() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { info } = useToast();
  const { locale } = useI18n();
  const connectionIdRef = useRef(connectionId());

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user?._id && !user?.id) return undefined;

    let active = true;
    let room = null;

    const connect = async () => {
      try {
        const response = await api.post('/api/live/realtime-token', {
          connectionId: connectionIdRef.current,
        }, { auth: true });

        if (!active) return;

        room = new Room({
          adaptiveStream: false,
          dynacast: false,
        });

        room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
          if (topic && topic !== 'wn-realtime') return;

          try {
            const detail = JSON.parse(new TextDecoder().decode(payload));
            window.dispatchEvent(new CustomEvent('wn:realtime', { detail }));

            if (detail.event === 'notification' && detail.notification) {
              const notification = detail.notification;
              const title = localized(notification.title, locale) || 'تنبيه جديد';
              const message = localized(notification.message, locale);

              info(message || title, {
                title,
                duration: notification.priority === 'urgent' || notification.priority === 'high' ? 7000 : 4500,
                position: 'top-right',
              });

              if (
                document.visibilityState !== 'visible' &&
                'Notification' in window &&
                window.Notification.permission === 'granted'
              ) {
                try {
                  new window.Notification(title, {
                    body: message,
                    tag: String(notification._id || notification.type || Date.now()),
                  });
                } catch {
                  // In-app toast remains the guaranteed foreground fallback.
                }
              }
            }
          } catch {
            // Ignore malformed realtime packets. Persistent API polling remains active.
          }
        });

        await room.connect(response.url, response.token, {
          autoSubscribe: false,
        });
      } catch (error) {
        // Realtime is additive. Existing polling and persistent notifications remain usable.
        console.warn('Realtime connection unavailable:', error.message);
      }
    };

    connect();

    return () => {
      active = false;
      room?.disconnect?.();
    };
  }, [isAuthenticated, isLoading, user?._id, user?.id, locale, info]);

  return null;
}
