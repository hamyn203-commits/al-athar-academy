import { useState, useEffect, useRef, useCallback } from 'react';
import { Languages, Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { LANG_CODES, langLabel } from '../../lib/languages';
import api from '../../lib/api';
import { translateText } from '../../lib/translateApi';

export default function SessionTranslateChat({ sessionId, myLang, partnerLang, isAr = true }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [caption, setCaption] = useState('');
  const bottomRef = useRef(null);
  const sinceRef = useRef(null);

  const poll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const q = sinceRef.current ? `?since=${sinceRef.current}&lang=${myLang}` : `?lang=${myLang}`;
      const data = await api.get(`/api/sessions/${sessionId}/translate/messages${q}`, { auth: true });
      if (data.messages?.length) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m._id));
          const fresh = data.messages.filter((m) => !ids.has(m._id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        sinceRef.current = data.messages[data.messages.length - 1].createdAt;
      }
    } catch { /* ignore */ }
  }, [sessionId, myLang]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 2500);
    return () => clearInterval(id);
  }, [poll]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, caption]);

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/api/sessions/${sessionId}/translate/messages`, { text, lang: myLang }, { auth: true });
      setText('');
      await poll();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const toggleListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert(isAr ? 'المتصفح لا يدعم التعرف على الصوت — استخدم Chrome' : 'Speech recognition not supported');
      return;
    }
    if (listening) {
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = myLang === 'ar' ? 'ar-EG' : myLang === 'id' ? 'id-ID' : `${myLang}-${myLang.toUpperCase()}`;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = async (ev) => {
      const line = Array.from(ev.results).map((r) => r[0].transcript).join(' ').trim();
      if (!line || ev.results[ev.results.length - 1].isFinal !== true) return;
      try {
        const translated = await translateText(line, myLang, partnerLang, { auth: true });
        setCaption(translated);
      } catch {
        setCaption(line);
      }
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-3 border-b bg-emerald-50 flex items-center gap-2">
        <Languages className="text-emerald-600" size={20} />
        <div>
          <p className="font-bold text-sm">{isAr ? 'ترجمة الحصة' : 'Session translation'}</p>
          <p className="text-xs text-gray-600">
            {langLabel(myLang, isAr ? 'ar' : 'en')} → {langLabel(partnerLang, isAr ? 'ar' : 'en')}
          </p>
        </div>
      </div>

      {caption && (
        <div className="p-3 bg-amber-50 border-b text-sm">
          <p className="text-xs text-amber-800 font-medium mb-1">{isAr ? 'ترجمة مباشرة' : 'Live caption'}</p>
          <p>{caption}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">{isAr ? 'اكتب رسالة — تُترجم تلقائياً للطرف الآخر' : 'Messages auto-translate for your partner'}</p>
        )}
        {messages.map((m) => (
          <div key={m._id} className={`text-sm ${m.isMe ? 'text-right' : 'text-left'}`}>
            <p className="text-xs text-gray-500 mb-0.5">{m.userName}</p>
            {m.lang !== myLang && m.text !== m.translation && (
              <p className="text-gray-400 text-xs mb-1 line-through opacity-70">{m.text}</p>
            )}
            <p className={`inline-block px-3 py-2 rounded-xl ${m.isMe ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
              {m.translation || m.text}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t flex gap-2">
        <button type="button" onClick={toggleListen}
          className={`p-2 rounded-lg border ${listening ? 'bg-red-100 border-red-300 text-red-600' : 'border-gray-200'}`}
          title={isAr ? 'ترجمة صوتية' : 'Voice translate'}>
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)}
          placeholder={isAr ? 'اكتب بالعربية أو الإندونيسية...' : 'Type your message...'}
          className="flex-1 border rounded-lg px-3 py-2 text-sm" />
        <button type="submit" disabled={sending || !text.trim()} className="p-2 bg-emerald-600 text-white rounded-lg">
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}

export function LangSelect({ value, onChange, label, isAr }) {
  return (
    <label className="text-xs flex flex-col gap-1">
      <span className="text-gray-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border rounded-lg px-2 py-1 text-sm">
        {LANG_CODES.map((c) => (
          <option key={c} value={c}>{langLabel(c, isAr ? 'ar' : 'en')}</option>
        ))}
      </select>
    </label>
  );
}
