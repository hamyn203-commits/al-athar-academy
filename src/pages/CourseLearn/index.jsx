import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, Circle, BookOpen, Award, Menu, X } from 'lucide-react';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import { useI18n } from '../../i18n';
import api from '../../lib/api';
import VideoLesson from '../../components/lms/VideoLesson';
import TextLesson from '../../components/lms/TextLesson';
import QuizLesson from '../../components/lms/QuizLesson';

export default function CourseLearn() {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const { ready, logout } = useRequireAuth(['student', 'admin', 'teacher']);
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const t = (obj) => obj?.[locale] || obj?.ar || obj?.en || '';

  const loadCourse = useCallback(async () => {
    const data = await api.get(`/api/lms/course/${slug}`, { auth: true });
    setCourse(data.course);
    setLessons(data.lessons || []);
    setEnrollment(data.enrollment);
    return data;
  }, [slug]);

  const loadLesson = useCallback(async (id) => {
    const data = await api.get(`/api/lms/course/${slug}/lesson/${id}`, { auth: true });
    setCurrentLesson(data.lesson);
    setCompleted(data.completed);
    setEnrollment(data.enrollment);
    return data;
  }, [slug]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const data = await loadCourse();
        if (!data.enrollment) {
          toast.error('يجب التسجيل في الدورة أولاً');
          navigate(`/courses/${slug}`);
          return;
        }
      } catch {
        toast.error('تعذر تحميل الدورة');
        navigate(`/courses/${slug}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, slug]);

  useEffect(() => {
    if (!ready || !lessons.length) return;
    const targetId = lessonId || lessons[0]?._id;
    if (targetId) loadLesson(targetId).catch(() => toast.error('تعذر تحميل الدرس'));
  }, [ready, lessonId, lessons, slug]);

  const goToLesson = (id) => {
    navigate(`/courses/${slug}/learn/${id}`);
    loadLesson(id);
  };

  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      const result = await api.post(
        `/api/lms/course/${slug}/lesson/${currentLesson._id}/complete`,
        { score: 100 },
        { auth: true }
      );
      setEnrollment(result.enrollment);
      setCompleted(true);
      toast.success('تم إكمال الدرس!');
      if (result.certificate) {
        toast.success('🎉 مبروك! حصلت على شهادة إتمام');
      }
      await loadCourse();
    } catch {
      toast.error('فشل حفظ التقدم');
    }
  };

  const currentIndex = lessons.findIndex((l) => l._id === currentLesson?._id);
  const isLessonDone = (id) => enrollment?.progress?.completedLessons?.some((cl) => cl.lesson?.toString?.() === id || cl.lesson === id);

  if (!ready || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner spinner-lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all overflow-hidden bg-gray-800 text-white flex-shrink-0`}>
        <div className="p-4 border-b border-gray-700">
          <Link to={`/courses/${slug}`} className="text-emerald-400 text-sm hover:underline">← العودة للدورة</Link>
          <h2 className="font-bold mt-2 line-clamp-2">{t(course?.title)}</h2>
          <div className="mt-3 bg-gray-700 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${enrollment?.progress?.percentage || 0}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{enrollment?.progress?.percentage || 0}% مكتمل</p>
        </div>
        <ul className="overflow-y-auto max-h-[calc(100vh-140px)]">
          {lessons.map((lesson, i) => (
            <li key={lesson._id}>
              <button onClick={() => goToLesson(lesson._id)}
                className={`w-full text-right px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition text-sm ${
                  currentLesson?._id === lesson._id ? 'bg-emerald-900/50 border-r-2 border-emerald-500' : ''
                }`}>
                {isLessonDone(lesson._id) ? <CheckCircle size={16} className="text-emerald-400 shrink-0" /> : <Circle size={16} className="text-gray-500 shrink-0" />}
                <span className="line-clamp-2">{i + 1}. {t(lesson.title)}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-semibold truncate mx-4">{t(currentLesson?.title)}</h1>
          <div className="flex gap-2">
            <Link to="/student/dashboard" className="text-sm text-gray-400 hover:text-white">لوحتي</Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-red-400">خروج</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentLesson?.type === 'video' && <VideoLesson lesson={currentLesson} locale={locale} />}
          {currentLesson?.type === 'text' && <TextLesson lesson={currentLesson} locale={locale} />}
          {currentLesson?.type === 'quiz' && (
            <QuizLesson lesson={currentLesson} locale={locale} onComplete={markComplete} />
          )}

          {currentLesson?.type !== 'quiz' && (
            <div className="mt-8 flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-2">
                {currentIndex > 0 && (
                  <button onClick={() => goToLesson(lessons[currentIndex - 1]._id)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                    <ChevronRight size={16} /> السابق
                  </button>
                )}
                {currentIndex < lessons.length - 1 && (
                  <button onClick={() => goToLesson(lessons[currentIndex + 1]._id)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                    التالي <ChevronLeft size={16} />
                  </button>
                )}
              </div>
              {!completed ? (
                <button onClick={markComplete} className="btn-primary flex items-center gap-2">
                  <CheckCircle size={18} /> إكمال الدرس
                </button>
              ) : (
                <span className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle size={18} /> مكتمل</span>
              )}
            </div>
          )}

          {enrollment?.status === 'completed' && (
            <div className="mt-6 bg-emerald-900/30 border border-emerald-700 rounded-xl p-6 text-center">
              <Award className="mx-auto text-emerald-400 mb-2" size={40} />
              <h3 className="text-white font-bold text-lg">أكملت الدورة! 🎉</h3>
              {enrollment.certificate?.certificateId && (
                <Link to={`/verify-certificate/${enrollment.certificate.certificateId}`}
                  className="btn-primary inline-block mt-4">عرض الشهادة</Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
