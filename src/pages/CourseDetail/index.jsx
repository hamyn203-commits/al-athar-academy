import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Star, CheckCircle, Play, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import LocalizedLink from '../../components/LocalizedLink';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import '../../styles/public-experience.css';

function textValue(value, locale) {
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.ar || value?.en || '';
}

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;

  useEffect(() => {
    api.get('/api/courses/' + slug)
      .then(async (data) => {
        setCourse(data);
        if (token) {
          try {
            const lms = await api.get('/api/lms/course/' + slug, { auth: true });
            setEnrollment(lms.enrollment);
          } catch {
            setEnrollment(null);
          }
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [slug, token]);

  const handleEnroll = async () => {
    if (!token) {
      navigate(localizedPath('/login', locale));
      return;
    }

    setEnrolling(true);
    try {
      const data = await api.post('/api/lms/course/' + slug + '/enroll', {}, { auth: true });
      setEnrollment(data.enrollment);
      toast.success(isAr ? 'تم التسجيل بنجاح' : 'Enrollment completed');
    } catch (err) {
      toast.error(err.message || (isAr ? 'تعذر التسجيل' : 'Enrollment failed'));
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="wn-detail-shell min-h-screen grid place-items-center">
        <span className="w-9 h-9 rounded-full border-2 border-[var(--wn-emerald)]/20 border-t-[var(--wn-emerald)] animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <>
        <GlobalHeader />
        <main className="wn-detail-shell min-h-[70vh] grid place-items-center px-4">
          <div className="wn-public-empty max-w-xl w-full">
            <BookOpen size={48} />
            <h3>{isAr ? 'الدورة غير موجودة' : 'Course not found'}</h3>
            <LocalizedLink to="/courses" locale={locale} className="wn-btn wn-btn--primary mt-4">
              {isAr ? 'عرض جميع الدورات' : 'Browse courses'}
            </LocalizedLink>
          </div>
        </main>
        <GlobalFooter />
      </>
    );
  }

  const title = textValue(course.title, locale) || slug;
  const description = textValue(course.description, locale);
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const ratingCount = Number(course.stats?.rating?.count || 0);
  const ratingAverage = Number(course.stats?.rating?.average || 0);
  const enrolled = Number(course.stats?.enrolled || 0);
  const progress = Number(enrollment?.progress?.percentage || 0);

  const isDone = (lessonId) => enrollment?.progress?.completedLessons?.some(
    (completed) => completed.lesson?.toString?.() === lessonId || completed.lesson === lessonId
  );

  return (
    <>
      <SEOHead page={{ title, description, url: '/courses/' + slug, type: 'course' }} />
      <GlobalHeader />

      <main className="wn-detail-shell">
        <section className="wn-detail-hero">
          <div className="page-container">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> {course.category || (isAr ? 'برنامج قرآني' : 'Quran program')}</span>
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}

              <div className="wn-detail-meta">
                {course.durationInHours || course.duration ? <span><Clock size={14} /> {course.durationInHours || course.duration} {course.durationInHours ? (isAr ? 'ساعة' : 'hours') : ''}</span> : null}
                <span><BookOpen size={14} /> {lessons.length} {isAr ? 'درس' : 'lessons'}</span>
                {enrolled > 0 ? <span><Users size={14} /> {enrolled} {isAr ? 'ملتحق' : 'enrolled'}</span> : null}
                {ratingCount > 0 && ratingAverage > 0 ? <span><Star size={14} /> {ratingAverage.toFixed(1)} ({ratingCount})</span> : null}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="page-container wn-detail-layout">
          <section className="wn-detail-card">
            <div className="wn-detail-card__body">
              <span className="wn-public-eyebrow">{isAr ? 'محتوى الدورة' : 'COURSE CONTENT'}</span>
              <h2>{isAr ? 'رحلة التعلم' : 'Learning journey'}</h2>

              <div className="wn-lesson-list">
                {lessons.length ? lessons.map((lesson, index) => (
                  <div key={lesson._id || index} className="wn-lesson-row">
                    <span className="wn-lesson-row__status">
                      {isDone(lesson._id) ? <CheckCircle size={15} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                    </span>
                    <span className="wn-lesson-row__title">{textValue(lesson.title, locale) || (isAr ? 'الدرس ' : 'Lesson ') + (index + 1)}</span>
                    {lesson.isFree ? <span className="wn-lesson-row__tag">{isAr ? 'معاينة' : 'Preview'}</span> : enrollment && lesson.type ? <span className="text-[10px] text-[var(--wn-text-tertiary)]">{lesson.type}</span> : <span />}
                  </div>
                )) : (
                  <div className="wn-public-empty !py-10">
                    <BookOpen size={38} />
                    <h3>{isAr ? 'المحتوى قيد التجهيز' : 'Content is being prepared'}</h3>
                    <p>{isAr ? 'سيظهر محتوى الدورة هنا عند نشر الدروس.' : 'Course lessons will appear here once they are published.'}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="wn-detail-card wn-detail-aside">
            {enrollment ? (
              <div className="wn-detail-progress">
                <div className="wn-detail-progress__head">
                  <span>{isAr ? 'تقدمك في الدورة' : 'Your progress'}</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="wn-detail-progress__bar"><i style={{ width: Math.min(100, Math.max(0, progress)) + '%' }} /></div>
              </div>
            ) : null}

            <div className="wn-detail-price">
              {Number(course.price) > 0 ? course.price + ' ' + (course.currency || 'USD') : (isAr ? 'مجاني' : 'Free')}
            </div>

            <div className="grid gap-2 mt-4">
              {enrollment ? (
                <button onClick={() => navigate(localizedPath('/courses/' + slug + '/learn', locale))} className="wn-btn wn-btn--primary wn-btn--block wn-btn--lg">
                  <Play size={17} />
                  {progress > 0 ? (isAr ? 'متابعة التعلم' : 'Continue learning') : (isAr ? 'ابدأ التعلم' : 'Start learning')}
                </button>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} className="wn-btn wn-btn--primary wn-btn--block wn-btn--lg disabled:opacity-60">
                  {enrolling ? (isAr ? 'جاري التسجيل...' : 'Enrolling...') : (isAr ? 'الالتحاق بالدورة' : 'Enroll in course')}
                  {!enrolling ? <ArrowIcon size={16} /> : null}
                </button>
              )}

              {!token ? <LocalizedLink to="/login" locale={locale} className="wn-btn wn-btn--secondary wn-btn--block">{isAr ? 'تسجيل الدخول أولًا' : 'Sign in first'}</LocalizedLink> : null}
              <LocalizedLink to="/contact" locale={locale} className="text-center text-xs font-semibold text-[var(--wn-text-secondary)] hover:text-[var(--wn-emerald-dark)] py-2">
                {isAr ? 'لديك سؤال عن هذه الدورة؟' : 'Have a question about this course?'}
              </LocalizedLink>
            </div>
          </aside>
        </div>
      </main>

      <GlobalFooter />
    </>
  );
}
