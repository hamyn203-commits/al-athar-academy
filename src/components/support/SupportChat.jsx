import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, RefreshCw, Send } from 'lucide-react';
import api from '../../lib/api';
import { useI18n } from '../../i18n';
import './support.css';

export default function SupportChat({ studentId = 'me', admin = false }) {
  const { locale } = useI18n();
  const ar = locale === 'ar';
  const [messages, setMessages] = useState([]);
  const [student, setStudent] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [syncError, setSyncError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [nextBefore, setNextBefore] = useState(null);
  const [older, setOlder] = useState([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const pending = useRef(null);
  const busy = useRef(false);
  const bottom = useRef(null);
  const view = useRef(null);
  const generation = useRef(0);
  const cursorInitialized = useRef(false);
  const base = `/api/support/${encodeURIComponent(studentId)}`;

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const version = generation.current;
    try {
      const data = await api.get(`${base}/messages`, { auth: true });
      if (version !== generation.current) return;
      const nearBottom = !view.current || view.current.scrollHeight - view.current.scrollTop - view.current.clientHeight < 100;
      setMessages((current) => [...new Map([...current, ...(data.messages || [])].map((m) => [m._id, m])).values()]); setStudent(data.student); setLoaded(true); setSyncError(false);
      if (!cursorInitialized.current) { setNextBefore(data.nextBefore); cursorInitialized.current = true; }
      if (nearBottom) requestAnimationFrame(() => bottom.current?.scrollIntoView({ block: 'nearest' }));
      const last = data.messages?.at(-1);
      if (last && data.unread && document.visibilityState === 'visible') {
        await api.put(`${base}/read`, { through: last._id }, { auth: true });
        window.dispatchEvent(new Event('wn:notifications-changed'));
        window.dispatchEvent(new Event('wn:support-changed'));
      }
    } catch { if (version === generation.current) setSyncError(true); }
    finally { if (version === generation.current) busy.current = false; }
  }, [base]);

  useEffect(() => {
    generation.current += 1; busy.current = false; cursorInitialized.current = false;
    // The parent keys conversations by student, so a new conversation starts with fresh state.
    refresh();
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    const interval = window.setInterval(onVisible, 5000);
    window.addEventListener('focus', onVisible);
    window.addEventListener('wn:realtime-notification', onVisible);
    window.addEventListener('wn:support-changed', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      generation.current += 1; clearInterval(interval);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('wn:realtime-notification', onVisible);
      window.removeEventListener('wn:support-changed', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const loadOlder = async () => {
    const version = generation.current;
    setLoadingOlder(true);
    try {
      const data = await api.get(`${base}/messages?before=${nextBefore}`, { auth: true });
      if (version !== generation.current) return;
      setOlder((current) => [...data.messages, ...current]); setNextBefore(data.nextBefore);
    } catch { setError(ar ? 'تعذر تحميل الرسائل السابقة' : 'Could not load earlier messages'); }
    finally { setLoadingOlder(false); }
  };

  const send = async (event) => {
    event.preventDefault();
    if (!text.trim() || sending) return;
    const version = generation.current;
    const draft = text.trim();
    if (!pending.current || pending.current.text !== draft) pending.current = { clientId: crypto.randomUUID(), text: draft };
    setSending(true); setError('');
    try {
      const data = await api.post(`${base}/messages`, pending.current, { auth: true });
      if (version !== generation.current) return;
      setMessages((current) => current.some((m) => m._id === data.message._id) ? current : [...current, data.message]);
      setText(''); pending.current = null;
      requestAnimationFrame(() => bottom.current?.scrollIntoView({ block: 'nearest' }));
      window.dispatchEvent(new Event('wn:support-changed'));
      await refresh();
    } catch (failure) { if (version === generation.current) setError(failure.message || (ar ? 'تعذر الإرسال. حاول مرة أخرى.' : 'Send failed. Please retry.')); }
    finally { setSending(false); }
  };
  const all = [...new Map([...older, ...messages].map((m) => [m._id, m])).values()].sort((a, b) => a._id.localeCompare(b._id));

  return <section className="wn-support-chat" aria-label={ar ? 'محادثة الإدارة' : 'Administration chat'} dir={ar ? 'rtl' : 'ltr'}>
    <header className="wn-support-chat__header"><span className="wn-support-icon"><MessageCircle size={23} /></span><div><h2>{admin ? student?.name || (ar ? 'محادثة الطالب' : 'Student chat') : ar ? 'تواصل مع الإدارة' : 'Contact administration'}</h2><p>{ar ? 'اكتب استفسارك هنا، ورد الإدارة هيوصلك داخل حسابك.' : 'Send your question here. Replies will arrive in your account.'}</p></div><button type="button" onClick={refresh} aria-label={ar ? 'تحديث المحادثة' : 'Refresh chat'}><RefreshCw size={18} /></button></header>
    <div className="wn-support-sync" role="status">{syncError ? (ar ? 'تعذر التحديث — بنحاول الاتصال مجددًا' : 'Update unavailable — reconnecting') : (ar ? 'تحديث تلقائي للرسائل وحالة القراءة' : 'Messages and read receipts update automatically')}</div>
    <div className="wn-support-chat__messages" ref={view} role="log" aria-live="polite" aria-relevant="additions">
      {nextBefore && <button type="button" className="wn-support-older" disabled={loadingOlder} onClick={loadOlder}>{ar ? 'تحميل رسائل أقدم' : 'Load older messages'}</button>}
      {!loaded ? <p className="wn-support-empty">{ar ? 'جاري تحميل المحادثة…' : 'Loading conversation…'}</p> : all.length === 0 ? <div className="wn-support-empty"><MessageCircle size={36}/><h3>{ar ? 'إحنا هنا لمساعدتك' : 'We are here to help'}</h3><p>{ar ? 'لو عندك مشكلة في الحصص أو الاشتراك، ابعت رسالة.' : 'Send a message about lessons, subscriptions, or any problem.'}</p></div> : all.map((m) => {
        const mine = m.senderRole === (admin ? 'admin' : 'student');
        return <article key={m._id} className={`wn-support-bubble ${mine ? 'is-mine' : ''}`}><strong>{m.senderRole === 'admin' ? (ar ? 'الإدارة' : 'Administration') : student?.name}</strong><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleString(ar ? 'ar-EG' : 'en', { dateStyle: 'short', timeStyle: 'short' })}{mine && <span> · {m.readAt ? (ar ? 'تمت القراءة' : 'Read') : (ar ? 'تم الإرسال' : 'Sent')}</span>}</small></article>;
      })}<div ref={bottom}/>
    </div>
    <form onSubmit={send} className="wn-support-compose"><label htmlFor={`support-text-${studentId}`}>{ar ? 'رسالتك' : 'Your message'}</label><textarea id={`support-text-${studentId}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={3} disabled={sending} placeholder={ar ? 'اكتب رسالتك للإدارة…' : 'Write your message…'} /><div><small>{text.length}/2000</small><button type="submit" disabled={!text.trim() || sending}><Send size={17}/>{sending ? (ar ? 'جاري الإرسال…' : 'Sending…') : (ar ? 'إرسال الرسالة' : 'Send message')}</button></div>{error && <p className="wn-support-error" role="alert">{error}</p>}</form>
  </section>;
}

export function SupportLauncher({ onOpen }) {
  const { locale } = useI18n();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let disposed = false;
    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      try { const data = await api.get('/api/support/me/unread', { auth: true }); if (!disposed) setUnread(data.unread || 0); } catch { /* The conversation itself shows connection failures. */ }
    };
    refresh(); const timer = setInterval(refresh, 15000);
    window.addEventListener('focus', refresh); window.addEventListener('wn:realtime-notification', refresh); window.addEventListener('wn:support-changed', refresh);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('wn:realtime-notification', refresh); window.removeEventListener('wn:support-changed', refresh); };
  }, []);
  return <div className="wn-support-launcher"><div><strong>{locale === 'ar' ? 'محتاج مساعدة؟' : 'Need help?'}</strong><p>{locale === 'ar' ? 'تواصل مع إدارة الأكاديمية من حسابك' : 'Contact the academy from your account'}</p></div><button type="button" onClick={onOpen}><MessageCircle size={18}/>{locale === 'ar' ? 'تواصل مع الإدارة' : 'Contact administration'}{unread > 0 && <span className="wn-support-badge" aria-label={locale === 'ar' ? 'رسائل غير مقروءة' : 'Unread messages'}>{unread}</span>}</button></div>;
}
