import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, MessageCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api';

export default function QuranChatWidget() {
  const { isAuthenticated } = useAuth();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!isAuthenticated) return null;

  const ask = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/ai/quran-assistant', { question: q, locale }, { auth: true });
      setAnswer(res.answer);
    } catch (err) {
      setAnswer(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition"
        aria-label="مساعد قرآني"
      >
        <MessageCircle size={22} />
        <span className="text-sm font-semibold hidden sm:inline">مساعد قرآني</span>
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-40 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-600 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-bold flex items-center gap-2"><Bot size={18} /> مساعد قرآني V4</span>
            <button type="button" onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>
          <form onSubmit={ask} className="p-3 space-y-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسأل عن التجويد أو الحفظ..."
              className="w-full border rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-2">
              {loading ? '...' : 'اسأل'}
            </button>
          </form>
          {answer && (
            <div className="px-3 pb-3 text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap border-t pt-2 mx-3 mb-3">
              {answer}
            </div>
          )}
          <Link to="/ai" className="block text-center text-xs text-emerald-600 py-2 border-t hover:bg-emerald-50">
            مركز AI الكامل →
          </Link>
        </div>
      )}
    </>
  );
}
