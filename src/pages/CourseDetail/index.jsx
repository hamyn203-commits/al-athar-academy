import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Star, CheckCircle, Play } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import LocalizedLink from '../../components/LocalizedLink';
import { useI18n } from '../../i18n';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;

  useEffect(() => {
    api.get(`/api/courses/${slug}`)
      .then(async (c) => {
        setCourse(c);
        if (token) {
          try {
            const lms = await api.get(`/api/lms/course/${slug}`, { auth: true });
            setEnrollment(lms.enrollment);
          } catch { /* not enrolled */ }
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [slug, token]);

  const handleEnroll = async () => {
    if (!token) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      const data = await api.post(`/api/lms/course/${slug}/enroll`, {}, { auth: true });
      setEnrollment(data.enrollment);
      toast.success('تم التسجيل بنجاح!');
    } catch (err) {
      toast.error(err.message || 'فشل التسجيل');
    } finally {
      setEnrolling(false);
    }
  };

  const title = course?.title?.[locale] || course?.title?.ar || course?.title || slug;
  const description = course?.description?.[locale] || course?.description?.ar || '';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner spinner-lg" /></div>;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <main className="flex-1 container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">الدورة غير موجودة</h1>
          <LocalizedLink to="/courses" className="btn-primary">عرض جميع الدورات</LocalizedLink>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  const isDone = (lessonId) => enrollment?.progress?.completedLessons?.some(
    (cl) => cl.lesson?.toString?.() === lessonId || cl.lesson === lessonId
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title={title} description={description} type="course" />
      <GlobalHeader />
      <div className="bg-gradient-to-br from-emerald-900 to-green-800 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-emerald-300 text-sm font-semibold uppercase">{course.category}</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">{title}</h1>
            <p className="text-emerald-100 max-w-2xl text-lg">{description}</p>
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <span className="flex items-center gap-2"><Clock size={16} /> {course.durationInHours || course.duration} ساعة</span>
              <span className="flex items-center gap-2"><BookOpen size={16} /> {course.lessons?.length || 0} درس</span>
              <span className="flex items-center gap-2"><Users size={16} /> {course.stats?.enrolled || 0} طالب</span>
              <span className="flex items-center gap-2"><Star size={16} /> {course.stats?.rating?.average || 5}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">محتوى الدورة</h2>
            <ul className="space-y-3">
              {(course.lessons || []).map((lesson, i) => (
                <li key={lesson._id || i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {isDone(lesson._id) ? (
                    <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                  <span className="flex-1">{lesson.title?.[locale] || lesson.title?.ar || `الدرس ${i + 1}`}</span>
                  {lesson.isFree && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">مجاني</span>}
                  {enrollment && <span className="text-xs text-gray-400">{lesson.type}</span>}
                </li>
              ))}
              {!course.lessons?.length && <li className="text-gray-500">سيتم إضافة الدروس قريباً</li>}
            </ul>
          </section>
        </div>

        <aside className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-24">
          {enrollment && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1"><span>تقدمك</span><span className="font-bold text-emerald-600">{enrollment.progress?.percentage || 0}%</span></div>
              <div className="bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${enrollment.progress?.percentage || 0}%` }} /></div>
            </div>
          )}
          <div className="text-3xl font-bold text-emerald-600 mb-4">
            {course.price ? `${course.price} ${course.currency || 'USD'}` : 'مجاني'}
          </div>
          {enrollment ? (
            <button onClick={() => navigate(`/courses/${slug}/learn`)}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
              <Play size={18} /> {enrollment.progress?.percentage > 0 ? 'متابعة التعلم' : 'ابدأ التعلم'}
            </button>
          ) : (
            <button onClick={handleEnroll} disabled={enrolling}
              className="btn-primary w-full text-center block mb-3 disabled:opacity-60">
              {enrolling ? 'جاري التسجيل...' : course.price ? 'سجّل في الدورة' : 'سجّل مجاناً'}
            </button>
          )}
          {!token && (
            <LocalizedLink to="/login" className="block text-center text-sm text-gray-500 mb-3">سجّل دخولك للتسجيل</LocalizedLink>
          )}
          <LocalizedLink to="/contact" className="block text-center text-gray-600 hover:text-emerald-600 text-sm">
            استفسر عن الدورة
          </LocalizedLink>
        </aside>
      </div>
      <GlobalFooter />
    </div>
  );
}
