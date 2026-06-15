import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Star } from 'lucide-react';
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

  const labels = {
    id: {
      btn: 'Asisten Quran',
      header: 'Asisten Quran V4',
      placeholder: 'Tanya tentang Tajwid atau hafalan...',
      ask: 'Tanya',
      link: 'Pusat AI Lengkap →'
    },
    ar: {
      btn: 'مساعد قرآني',
      header: 'مساعد قرآني V4',
      placeholder: 'اسأل عن التجويد أو الحفظ...',
      ask: 'اسأل',
      link: 'مركز AI الكامل ←'
    },
    en: {
      btn: 'Quran Assistant',
      header: 'Quran Assistant V4',
      placeholder: 'Ask about Tajweed or memorization...',
      ask: 'Ask',
      link: 'Full AI Hub →'
    }
  };

  const active = labels[locale] || labels.en;

  return (
    <>
      {/* ═══ زر المساعد الأزهري ═══ */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gradient-to-r from-[var(--azhar-green)] to-[var(--azhar-green-deep)] text-white px-4 py-3 rounded-full shadow-azhar hover:shadow-azhar-lg transition-all duration-300"
        aria-label={active.btn}
      >
        <MessageCircle size={22} />
        <span className="text-sm font-semibold hidden sm:inline">{active.btn}</span>
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-40 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border-2 border-[var(--azhar-gold-leaf)]/30 overflow-hidden">
          {/* ═══ Header أزهري ═══ */}
          <div className="bg-gradient-to-r from-[var(--azhar-green)] to-[var(--azhar-green-deep)] text-white px-4 py-3 flex justify-between items-center">
            <span className="font-bold flex items-center gap-2" style={{ fontFamily: 'Amiri, serif' }}>
              <Star size={18} fill="currentColor" className="text-[var(--azhar-gold-leaf)]" />
              {active.header}
            </span>
            <button type="button" onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition">✕</button>
          </div>
          <form onSubmit={ask} className="p-3 space-y-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={active.placeholder}
              className="w-full border border-[var(--athar-cream-dark)] rounded-lg px-3 py-2 text-sm focus:border-[var(--azhar-green)] focus:ring-1 focus:ring-[var(--azhar-green)]/20 outline-none transition" />
            <button type="submit" disabled={loading} className="btn-azhar w-full text-sm py-2">
              {loading ? '...' : active.ask}
            </button>
          </form>
          {answer && (
            <div className="px-3 pb-3 text-sm text-[var(--athar-text)] max-h-40 overflow-y-auto whitespace-pre-wrap border-t border-[var(--athar-cream-dark)] pt-2 mx-3 mb-3">
              {answer}
            </div>
          )}
          <Link to="/ai" className="block text-center text-xs text-[var(--azhar-green)] py-2 border-t border-[var(--athar-cream-dark)] hover:bg-[var(--azhar-green-50)] transition font-semibold">
            {active.link}
          </Link>
        </div>
      )}
    </>
  );
}
