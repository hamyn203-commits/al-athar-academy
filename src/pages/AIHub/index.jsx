import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, BookOpen, GraduationCap, Loader2, Sparkles, Upload } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { id: 'quran', label: 'مساعد القرآن', icon: BookOpen },
  { id: 'recitation', label: 'تحليل التلاوة', icon: Mic },
  { id: 'student', label: 'مساعد الطالب', icon: GraduationCap },
  { id: 'teacher', label: 'مساعد المعلم', icon: Bot },
];

export default function AIHub() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('quran');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [goal, setGoal] = useState('حفظ جزء عم');
  const [level, setLevel] = useState('beginner');
  const [teacherPrompt, setTeacherPrompt] = useState('');
  const [teacherResult, setTeacherResult] = useState(null);
  const [studentPlan, setStudentPlan] = useState(null);
  const [recitationReport, setRecitationReport] = useState(null);
  const [reports, setReports] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/ai');
      return;
    }
    api.get('/api/ai/status', { auth: true }).then(setAiStatus).catch(() => {});
    api.get('/api/ai/recitation-reports', { auth: true })
      .then((d) => setReports(d.reports || []))
      .catch(() => {});
  }, [isAuthenticated, navigate]);

  const askQuran = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/ai/quran-assistant', { question, locale: 'ar' }, { auth: true });
      setAnswer(res.answer);
    } catch (err) {
      setAnswer(`خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAudio = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('audio', file);
      fd.append('locale', 'ar');
      const res = await api.post('/api/ai/recitation-analyze', fd, { auth: true });
      setRecitationReport(res);
      setReports((prev) => [res, ...prev]);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStudentPlan = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/ai/student-assistant', { goal, level, locale: 'ar' }, { auth: true });
      setStudentPlan(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherHelp = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/ai/teacher-assistant', { prompt: teacherPrompt, locale: 'ar' }, { auth: true });
      setTeacherResult(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Sparkles className="text-emerald-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز الذكاء الاصطناعي</h1>
            <p className="text-gray-600 text-sm">
              {aiStatus?.mode === 'cloud' ? '✓ متصل بـ AI' : 'وضع محلي — أضف مفاتيح API في Backend'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === id ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-700 hover:border-emerald-300'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          {tab === 'quran' && (
            <form onSubmit={askQuran} className="space-y-4">
              <label className="block font-semibold">اسأل عن القرآن أو التجويد</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full border rounded-lg p-3"
                placeholder="ما حكم الغنة في التجويد؟"
              />
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
                اسأل
              </button>
              {answer && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-gray-800 whitespace-pre-wrap">
                  {answer}
                </div>
              )}
            </form>
          )}

          {tab === 'recitation' && (
            <div className="space-y-4">
              <p className="text-gray-600">ارفع تسجيلاً صوتياً لتحليل التلاوة (MP3/WAV/M4A)</p>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => analyzeAudio(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                رفع وتشغيل التحليل
              </button>

              {recitationReport && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">النتيجة الإجمالية</span>
                    <span className="text-2xl text-emerald-600 font-bold">{recitationReport.overallScore}%</span>
                  </div>
                  {['tajweed', 'makhraj', 'waqf', 'mad'].map((key) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{key}</span>
                        <span>{recitationReport[key]?.score}%</span>
                      </div>
                      <div className="bg-gray-100 h-2 rounded-full">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${recitationReport[key]?.score || 0}%` }} />
                      </div>
                    </div>
                  ))}
                  <ul className="text-sm text-gray-600 list-disc pr-5">
                    {(recitationReport.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {reports.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">تقارير سابقة</h3>
                  <div className="space-y-2">
                    {reports.slice(0, 5).map((r) => (
                      <div key={r.reportId || r._id} className="text-sm border rounded p-2 flex justify-between">
                        <span>{r.filename || r.reportId}</span>
                        <span className="text-emerald-600">{r.overallScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'student' && (
            <div className="space-y-4">
              <input value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full border rounded-lg p-3" placeholder="هدفك" />
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full border rounded-lg p-3">
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
              <button onClick={getStudentPlan} disabled={loading} className="btn-primary">إنشاء خطة يومية</button>
              {studentPlan && (
                <div className="space-y-2">
                  {studentPlan.dailyPlan?.map((t, i) => (
                    <div key={i} className="flex justify-between border rounded p-3">
                      <span>{t.task}</span>
                      <span className="text-gray-500">{t.duration} د</span>
                    </div>
                  ))}
                  {studentPlan.aiNotes && <p className="text-sm text-gray-600 whitespace-pre-wrap">{studentPlan.aiNotes}</p>}
                </div>
              )}
            </div>
          )}

          {tab === 'teacher' && (
            <div className="space-y-4">
              <textarea
                value={teacherPrompt}
                onChange={(e) => setTeacherPrompt(e.target.value)}
                rows={3}
                className="w-full border rounded-lg p-3"
                placeholder="خطط حصة تجويد للمستوى المتوسط..."
              />
              <button onClick={getTeacherHelp} disabled={loading} className="btn-primary">اقتراحات المعلم</button>
              {teacherResult && (
                <div className="space-y-2">
                  <ul className="list-disc pr-5 text-gray-700">
                    {(teacherResult.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                  {teacherResult.lessonPlan && (
                    <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap">{teacherResult.lessonPlan}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
