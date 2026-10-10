import { useCallback, useEffect, useState } from 'react';
import api from '../../lib/api';
import SupportChat from '../../components/support/SupportChat';

export default function AdminSupportInbox({ selectedStudent, onSelect }) {
  const [rows, setRows] = useState([]);
  const [nextBefore, setNextBefore] = useState(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { const data = await api.get('/api/support/inbox', { auth: true }); setRows((current) => [...data.conversations, ...current.filter((c) => !data.conversations.some((n) => n.student._id === c.student._id))]); setNextBefore(data.nextBefore); setError(''); }
    catch { setError('تعذر تحديث صندوق المحادثات. حاول مجددًا.'); }
  }, []);
  useEffect(() => {
    api.get('/api/support/inbox', { auth: true }).then((data) => { setRows(data.conversations); setNextBefore(data.nextBefore); }).catch(() => setError('تعذر تحميل صندوق المحادثات'));
    const visible = () => { if (document.visibilityState === 'visible') refresh(); };
    const timer = setInterval(visible, 10000);
    window.addEventListener('focus', visible); window.addEventListener('wn:realtime-notification', visible); window.addEventListener('wn:support-changed', visible);
    return () => { clearInterval(timer); window.removeEventListener('focus', visible); window.removeEventListener('wn:realtime-notification', visible); window.removeEventListener('wn:support-changed', visible); };
  }, [refresh]);
  const more = async () => {
    try { const data = await api.get(`/api/support/inbox?before=${nextBefore}`, { auth: true }); setRows((current) => [...current, ...data.conversations.filter((c) => !current.some((n) => n.student._id === c.student._id))]); setNextBefore(data.nextBefore); }
    catch { setError('تعذر تحميل المحادثات السابقة'); }
  };
  return <section aria-label="محادثات الطلاب" className="wn-support-inbox"><aside><h2>محادثات الطلاب</h2><p>اختر محادثة للرد، أو ابدأ مراسلة من ملف الطالب.</p>{error && <p role="alert" className="wn-support-error">{error}<button onClick={refresh}>إعادة المحاولة</button></p>}{rows.length === 0 && !error && <p>لا توجد محادثات بعد.</p>}{rows.map((r) => <button type="button" key={r.student._id} className={r.student._id === selectedStudent ? 'is-active' : ''} onClick={() => onSelect(r.student._id)}><strong>{r.student.name}{r.unread > 0 && <span className="wn-support-badge">{r.unread}</span>}</strong><p>{r.latest.text}</p><small>{new Date(r.latest.createdAt).toLocaleString('ar-EG')}</small></button>)}{nextBefore && <button type="button" onClick={more}>تحميل محادثات أقدم</button>}</aside>{selectedStudent ? <SupportChat key={selectedStudent} studentId={selectedStudent} admin /> : <div className="wn-support-empty"><h3>رسائل مباشرة مع الطلاب</h3><p>افتح محادثة من القائمة، أو اضغط «مراسلة الطالب» في ملفه.</p></div>}</section>;
}
