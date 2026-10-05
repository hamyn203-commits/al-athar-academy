import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Globe, AlertCircle, Sparkles } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth.jsx';
import '../../styles/session-experience.css';

export default function BookSession() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate(localizedPath('/login', locale) + '?redirect=' + encodeURIComponent('/book-trial/' + teacherId));
      return;
    }

    api.get('/api/teachers/' + teacherId)
      .then(setTeacher)
      .catch(() => setTeacher(null))
      .finally(() => setLoading(false));
  }, [teacherId, navigate, locale, authLoading, isAuthenticated]);

  const dates = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return date.toISOString().split('T')[0];
  });

  const times = [];
  for (let hour = 8; hour <= 20; hour += 1) {
    times.push(String(hour).padStart(2, '0') + ':00');
    times.push(String(hour).padStart(2, '0') + ':30');
  }

  const timezones = [
    ['Africa/Cairo', isAr ? 'القاهرة' : 'Cairo'],
    ['Asia/Riyadh', isAr ? 'الرياض' : 'Riyadh'],
    ['Asia/Dubai', isAr ? 'دبي' : 'Dubai'],
    ['Asia/Kuwait', isAr ? 'الكويت' : 'Kuwait'],
    ['Asia/Qatar', isAr ? 'قطر' : 'Qatar'],
    ['Asia/Amman', isAr ? 'عمّان' : 'Amman'],
    ['Asia/Beirut', isAr ? 'بيروت' : 'Beirut'],
    ['Europe/London', 'London'],
    ['Europe/Paris', 'Paris'],
    ['America/New_York', 'New York'],
  ];

  const submit = async (event) => {
    event.preventDefault();
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/sessions/trial', {
        teacherId,
        scheduledAt: new Date(selectedDate + 'T' + selectedTime),
        timezone,
        notes,
      }, { auth: true });

      navigate(localizedPath('/student/dashboard', locale));
    } catch (err) {
      alert(err.message || (isAr ? 'تعذر إرسال طلب الحجز' : 'Unable to send booking request'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="wn-session-shell min-h-screen grid place-items-center"><span className="w-9 h-9 rounded-full border-2 border-[var(--wn-emerald)]/20 border-t-[var(--wn-emerald)] animate-spin" /></div>;
  }

  if (!teacher) {
    return (
      <>
        <GlobalHeader />
        <main className="wn-session-shell min-h-[70vh] grid place-items-center px-4">
          <div className="wn-public-empty max-w-xl w-full"><h3>{isAr ? 'ملف المعلم غير متاح' : 'Teacher profile unavailable'}</h3></div>
        </main>
        <GlobalFooter />
      </>
    );
  }

  const name = teacher.user?.name || teacher.personalInfo?.fullName || (isAr ? 'معلم قرآن' : 'Quran teacher');
  const photo = teacher.media?.profilePhoto || '/default-teacher.png';

  return (
    <>
      <GlobalHeader />
      <main className="wn-session-shell">
        <div className="wn-booking-wrap">
          <section className="wn-booking-card">
            <div className="wn-booking-head">
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> {isAr ? 'حجز جلسة تعريفية' : 'BOOK AN INTRODUCTORY SESSION'}</span>
              <div className="wn-booking-teacher mt-4">
                <img src={photo} alt={name} />
                <div>
                  <h1>{isAr ? 'اختر موعدًا مناسبًا' : 'Choose a suitable time'}</h1>
                  <p>{isAr ? 'مع ' + name : 'With ' + name}</p>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="wn-booking-form">
              <div className="wn-booking-note">
                {isAr
                  ? 'أرسل الموعد المناسب لك. يصبح الموعد مؤكدًا بعد تحديث حالة الطلب من المعلم أو الأكاديمية.'
                  : 'Send your preferred time. The session is confirmed after the teacher or academy updates the request status.'}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="wn-booking-field">
                  <label><Calendar size={15} className="inline ml-1" /> {isAr ? 'التاريخ' : 'Date'}</label>
                  <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required>
                    <option value="">{isAr ? 'اختر تاريخًا' : 'Choose a date'}</option>
                    {dates.map((date) => <option key={date} value={date}>{new Date(date).toLocaleDateString(isAr ? 'ar-EG' : 'en', { weekday:'long', month:'long', day:'numeric' })}</option>)}
                  </select>
                </div>

                <div className="wn-booking-field">
                  <label><Clock size={15} className="inline ml-1" /> {isAr ? 'الوقت' : 'Time'}</label>
                  <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} required>
                    <option value="">{isAr ? 'اختر وقتًا' : 'Choose a time'}</option>
                    {times.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
              </div>

              <div className="wn-booking-field">
                <label><Globe size={15} className="inline ml-1" /> {isAr ? 'المنطقة الزمنية' : 'Timezone'}</label>
                <select value={timezone} onChange={(event) => setTimezone(event.target.value)} required>
                  {timezones.map(([value,label]) => <option key={value} value={value}>{label} — {value}</option>)}
                </select>
              </div>

              <div className="wn-booking-field">
                <label>{isAr ? 'ملاحظات للمعلم (اختياري)' : 'Notes for the teacher (optional)'}</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder={isAr ? 'مثال: أريد التركيز على التجويد أو تحديد المستوى.' : 'Example: I want to focus on Tajweed or assess my level.'} />
              </div>

              {showConfirmation ? (
                <div className="wn-booking-confirm">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={19} className="text-[var(--wn-gold-dark)] mt-0.5" />
                    <div className="flex-1">
                      <strong className="text-[var(--wn-emerald-deep)]">{isAr ? 'راجع طلبك قبل الإرسال' : 'Review your request'}</strong>
                      <div className="wn-booking-summary">
                        <span><b>{isAr ? 'المعلم:' : 'Teacher:'}</b> {name}</span>
                        <span><b>{isAr ? 'التاريخ:' : 'Date:'}</b> {selectedDate}</span>
                        <span><b>{isAr ? 'الوقت:' : 'Time:'}</b> {selectedTime}</span>
                        <span><b>{isAr ? 'المنطقة:' : 'Timezone:'}</b> {timezone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 mt-4">
                    <button type="button" onClick={() => setShowConfirmation(false)} className="wn-btn wn-btn--secondary wn-btn--block">{isAr ? 'تعديل' : 'Edit'}</button>
                    <button type="submit" disabled={submitting} className="wn-btn wn-btn--primary wn-btn--block disabled:opacity-60">
                      <CheckCircle size={16} /> {submitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'تأكيد الطلب' : 'Confirm request')}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="submit" className="wn-btn wn-btn--primary wn-btn--lg wn-btn--block">{isAr ? 'مراجعة الحجز' : 'Review booking'}</button>
              )}
            </form>
          </section>
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
