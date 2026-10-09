import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, BookOpen, CalendarClock, CheckCircle2, Clock3, GraduationCap,
  RefreshCw, UserRound, Video,
} from 'lucide-react';
import api from '../../lib/api';
import { formatSessionDateTime, sessionTimeZone } from '../../lib/sessionTime';

const FOCUS_META = {
  all: {
    title: 'كل الحصص',
    description: 'آخر الحصص المسجلة في الأكاديمية.',
    icon: CalendarClock,
  },
  overdue: {
    title: 'حصص انتهى موعدها ولم تُغلق',
    description: 'حصص ما زالت Accepted رغم أن موعدها أصبح في الماضي.',
    icon: AlertTriangle,
  },
  'missing-reports': {
    title: 'حصص مكتملة بدون تقرير طالب',
    description: 'حصص تم إغلاقها لكن لم يتم تسجيل تقرير الطالب بعدها.',
    icon: BookOpen,
  },
};

function statusLabel(status) {
  const labels = {
    pending: 'معلقة',
    accepted: 'مؤكدة',
    rejected: 'مرفوضة',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    'no-show': 'غياب',
  };
  return labels[status] || status;
}

export default function AdminSessionControl({
  initialFocus = 'all',
  onOpenStudent,
  onOpenTeacher,
  onFocusChange,
}) {
  const safeInitial = FOCUS_META[initialFocus] ? initialFocus : 'all';
  const [focus, setFocus] = useState(safeInitial);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (FOCUS_META[initialFocus] && initialFocus !== focus) setFocus(initialFocus);
  }, [initialFocus]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get('/api/admin/session-control?focus=' + encodeURIComponent(focus), { auth: true });
      setSessions(result.sessions || []);
    } catch (loadError) {
      setError(loadError.message || 'تعذر تحميل الحصص');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [focus]);

  useEffect(() => { load(); }, [load]);

  const meta = FOCUS_META[focus] || FOCUS_META.all;
  const Icon = meta.icon;

  const groupedStats = useMemo(() => ({
    total: sessions.length,
    withMeeting: sessions.filter((item) => item.meetingAvailable).length,
    withRecording: sessions.filter((item) => item.recordingAvailable).length,
  }), [sessions]);

  const chooseFocus = (next) => {
    setFocus(next);
    onFocusChange?.(next);
  };

  return (
    <section className="wn-admin-session-control">
      <header className="wn-admin-session-control__hero">
        <div>
          <span>SESSION CONTROL CENTER</span>
          <h2><Icon size={20} /> {meta.title}</h2>
          <p>{meta.description}</p>
        </div>
        <button type="button" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </header>

      <nav className="wn-admin-session-control__filters" aria-label="تصفية الحصص">
        {Object.entries(FOCUS_META).map(([key, item]) => (
          <button
            type="button"
            key={key}
            className={focus === key ? 'is-active' : ''}
            onClick={() => chooseFocus(key)}
          >
            {item.title}
          </button>
        ))}
      </nav>

      <div className="wn-admin-session-control__stats">
        <div><strong>{groupedStats.total}</strong><span>حصة في القائمة</span></div>
        <div><strong>{groupedStats.withMeeting}</strong><span>لها غرفة اجتماع</span></div>
        <div><strong>{groupedStats.withRecording}</strong><span>لها تسجيل</span></div>
      </div>

      {error ? <div className="wn-admin-session-control__error"><AlertTriangle size={17} /> {error}</div> : null}

      {loading ? (
        <div className="wn-admin-session-control__loading">جاري تحميل مركز الحصص...</div>
      ) : sessions.length === 0 ? (
        <div className="wn-admin-session-control__empty">
          <CheckCircle2 size={23} />
          <strong>لا توجد حالات في هذا القسم</strong>
          <span>الحالة التشغيلية هنا مستقرة حاليًا.</span>
        </div>
      ) : (
        <div className="wn-admin-session-control__list">
          {sessions.map((session) => (
            <article key={session._id}>
              <div className="wn-admin-session-control__date">
                <CalendarClock size={17} />
                <span>{formatSessionDateTime(session, 'ar-EG', { dateStyle: 'medium' })}</span>
                <small>{formatSessionDateTime(session, 'ar-EG', { timeStyle: 'short' })} · {sessionTimeZone(session)}</small>
              </div>

              <div className="wn-admin-session-control__people">
                <button type="button" disabled={!session.student?._id} onClick={() => onOpenStudent?.(session.student?._id)}>
                  <UserRound size={16} />
                  <span><strong>{session.student?.name || 'طالب جماعي'}</strong><small>{session.student?.email || session.circle?.name || '—'}</small></span>
                </button>
                <button type="button" disabled={!session.teacher?._id} onClick={() => onOpenTeacher?.(session.teacher?._id)}>
                  <GraduationCap size={16} />
                  <span><strong>{session.teacher?.name || 'معلم'}</strong><small>{session.teacher?.email || '—'}</small></span>
                </button>
              </div>

              <div className="wn-admin-session-control__meta">
                <span className={`is-${session.status}`}>{statusLabel(session.status)}</span>
                <span><Clock3 size={13} /> {session.duration || 0} دقيقة</span>
                <span><BookOpen size={13} /> {session.reportCount || 0} تقرير</span>
                {session.recordingAvailable ? <span><Video size={13} /> تسجيل متاح</span> : null}
              </div>

              <code>{session._id}</code>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
