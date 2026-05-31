import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function QuizLesson({ lesson, locale, onComplete }) {
  const quizId = lesson.content?.quiz?._id || lesson.content?.quiz;
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = (obj) => obj?.[locale] || obj?.ar || obj?.en || '';

  useEffect(() => {
    if (!quizId) { setLoading(false); return; }
    api.get(`/api/quizzes/${quizId}`, { auth: true })
      .then(setQuiz)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quizId]);

  const startQuiz = async () => {
    const att = await api.post(`/api/quizzes/${quizId}/start`, {}, { auth: true });
    setAttempt(att);
  };

  const submitQuiz = async () => {
    for (const [qId, answer] of Object.entries(answers)) {
      await api.put(`/api/quizzes/attempts/${attempt._id}/answer`, { questionId: qId, answer }, { auth: true });
    }
    const final = await api.post(`/api/quizzes/attempts/${attempt._id}/submit`, {}, { auth: true });
    setResult(final);
    if (final.isPassed) onComplete?.();
  };

  if (loading) return <div className="spinner mx-auto" />;
  if (!quiz) return <p className="text-gray-400 text-center">الاختبار غير متاح</p>;

  if (result) {
    return (
      <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-8 text-center text-white">
        <div className={`text-6xl font-bold mb-4 ${result.isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.score?.percentage || 0}%
        </div>
        <p className="text-xl mb-2">{result.isPassed ? '✅ ناجح!' : '❌ حاول مرة أخرى'}</p>
        <p className="text-gray-400 text-sm">الدرجة المطلوبة: {quiz.settings?.passingScore || 60}%</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">{t(quiz.title)}</h2>
        <p className="text-gray-400 mb-6">{quiz.questions?.length} أسئلة — {quiz.settings?.maxAttempts || 3} محاولات</p>
        <button onClick={startQuiz} className="btn-primary">بدء الاختبار</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {quiz.questions.map((q, i) => (
        <div key={q._id} className="bg-gray-800 rounded-xl p-6 text-white">
          <p className="font-bold mb-4">{i + 1}. {t(q.text)}</p>
          <div className="space-y-2">
            {(q.options || []).map((opt, j) => (
              <label key={j} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                answers[q._id] === (opt.text?.en || opt.text?.ar) ? 'border-emerald-500 bg-emerald-900/30' : 'border-gray-600 hover:border-gray-500'
              }`}>
                <input type="radio" name={q._id} className="accent-emerald-500"
                  onChange={() => setAnswers({ ...answers, [q._id]: opt.text?.en || opt.text?.ar })} />
                <span>{t(opt.text)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.questions.length}
        className="btn-primary w-full disabled:opacity-50">
        إرسال الإجابات
      </button>
    </div>
  );
}
