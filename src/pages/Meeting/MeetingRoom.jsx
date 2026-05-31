import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Languages, Video } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import SessionTranslateChat from '../../components/live/SessionTranslateChat';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useI18n } from '../../i18n';
import api from '../../lib/api';

export default function MeetingRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const { user, ready } = useRequireAuth(['student', 'teacher', 'admin']);

  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState(null);
  const [myLang, setMyLang] = useState('ar');
  const [partnerLang, setPartnerLang] = useState('id');

  useEffect(() => {
    if (!ready || !user) return;
    Promise.all([
      api.get(`/api/meetings/session/${sessionId}`, { auth: true }),
      api.get(`/api/sessions/${sessionId}/translate/languages`, { auth: true }),
    ]).then(([meet, langData]) => {
      setMeeting(meet);
      const isTeacher = user.role === 'teacher' || user.role === 'admin';
      if (isTeacher) {
        setMyLang(langData.teacher?.lang || 'ar');
        setPartnerLang(langData.student?.lang || 'id');
      } else {
        setMyLang(langData.student?.lang || user.preferences?.language || 'id');
        setPartnerLang(langData.teacher?.lang || 'ar');
      }
    }).catch(() => navigate(`/${locale}/student/dashboard`)).finally(() => setLoading(false));
  }, [ready, sessionId, navigate, user, locale]);

  if (!ready || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner spinner-lg" /></div>;
  }

  const meetUrl = meeting?.meeting?.url;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <GlobalHeader />
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white text-sm">
        <span className="flex items-center gap-2"><Languages size={16} /> {isAr ? 'حصة مع ترجمة فورية' : 'Session with live translation'}</span>
        <Link to={`/${locale}/student/dashboard`} className="text-emerald-300 hover:underline flex items-center gap-1">
          <ArrowRight size={14} /> {isAr ? 'لوحة التحكم' : 'Dashboard'}
        </Link>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0">
          {meetUrl ? (
            <iframe title="meeting" src={meetUrl} className="flex-1 w-full border-0" allow="camera; microphone; fullscreen" />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
              <Video size={48} className="opacity-50" />
              <p>{isAr ? 'لا يوجد رابط اجتماع — اطلب من المعلم قبول الحصة' : 'No meeting link yet'}</p>
            </div>
          )}
        </div>
        <div className="w-full lg:w-96 h-[45vh] lg:h-auto shrink-0">
          <SessionTranslateChat sessionId={sessionId} myLang={myLang} partnerLang={partnerLang} isAr={isAr} />
        </div>
      </div>
    </div>
  );
}
