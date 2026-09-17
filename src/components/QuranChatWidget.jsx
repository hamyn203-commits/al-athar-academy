import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Star, Sparkles, Send, X, Bot, User, 
  HelpCircle, Gift, PhoneCall, ShieldCheck, ChevronDown
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api';

const QUICK_QUESTIONS = [
  { id: 'pricing', label: '💰 ما هي الأسعار والباقات؟' },
  { id: 'trial', label: '🎁 كيف أحجز حصة تجريبية مجانية؟' },
  { id: 'tracks', label: '📖 ما هي مسارات الدراسة المتاحة؟' },
  { id: 'reschedule', label: '⏰ ما هي سياسة الغياب والتعويض؟' },
  { id: 'guardian', label: '👨‍👩‍👧 هل يحق لولي الأمر المتابعة؟' },
  { id: 'human', label: '💬 التحدث مع خدمة العملاء (واتساب)' }
];

const PRESET_ANSWERS = {
  pricing: `🔹 **أسعار الحلقات في أكاديمية الأثر الطيب:**
- الحلقات الجماعية (10 طلاب من نفس السن والمستوى والجنس).
- **داخل مصر:** 20 جنيهاً فقط للحصة الواحدة (160 جنيه شهرياً لـ 8 حصص).
- **خارج مصر (المغتربين):** 1 دولار فقط للحصة الواحدة (8 دولار شهرياً).
- تشمل الحصة المصحف المتزامن، التسميع الفردي، وتقريراً فورياً يُرسل لولي الأمر عبر الواتساب.`,

  trial: `🎁 **الحصة التجريبية مجانية 100% وبدون أي التزام مسبق!**
يقوم الشيخ أو المعلمة بقياس مستوى الطالب وتحديد المسار الأنسب له وإلحاقه بالحلقة المتجانسة المناسبة لسنه ومستواه.
👇 يمكنك حجز موعدك الآن خلال دقيقة واحدة:`,

  tracks: `📚 **المسارات التعليمية المعتمدة بالأكاديمية:**
1. **مسار التحفيظ والمراجعة:** خطط فردية (جزء عم، 5 أجزاء، أو القرآن كاملاً) مع ورد تسميع ومراجعة مستمرة.
2. **مسار الإجازة وشرح المتون:** دراسة متون التجويد (تحفة الأطفال، المقدمة الجزرية، الشاطبية) والحصول على إجازة بالسند المتصل.
3. **مسار تأسيس الأطفال:** تلقين تفاعلي بمنهج نور البيان والقاعدة النورانية ومخارج الحروف مع تحفيز وأوسمة دورية.`,

  reschedule: `⏰ **سياسة الاعتذار والحصص التعويضية:**
- نرسل لك تذكيراً بالحصة قبل 24 ساعة عبر الواتساب.
- إذا اعتذرت قبل موعد الحصة بـ **6 ساعات على الأقل**، يحفظ حقك في **حصة تعويضية مجانية**.
- في حال الاعتذار المتأخر أو الغياب المفاجئ، لا يمكن ضمان التعويض حرصاً على وقت المعلم والحلقة.`,

  guardian: `👨‍👩‍👧 **حقوق وامتيازات ولي الأمر:**
- يحق لولي الأمر الدخول في أي وقت إلى الغرفة الافتراضية عبر **وضع المراقب الصامت** دون التشويش على سير الحلقة.
- إرسال بطاقة تقييم الحفظ والتجويد عبر الواتساب فور انتهاء كل حصة مباشرة.
- لوحة تحكم كاملة لمتابعة جميع الأبناء وسجل درجاتهم وجلسات التعويض.`,

  human: `💬 فريق خدمة العملاء والدعم الفني متواجد لمساعدتك يومياً عبر الواتساب:
اضغط أدناه لفتح المحادثة المباشرة وتأكيد حجزك أو طرح أي استفسار.`
};

export default function QuranChatWidget() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'السلام عليكم ورحمة الله وبركاته! مرحباً بك في أكاديمية الأثر الطيب لتعليم القرآن الكريم والتجويد.\n\nأنا **مساعد الأثر الذكي**، كيف يمكنني مساعدتك اليوم؟ اختر سؤالاً أو اكتب استفسارك مباشرة:'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleQuickQuestion = (item) => {
    const userMsg = { id: Date.now(), sender: 'user', text: item.label };
    const botReply = { 
      id: Date.now() + 1, 
      sender: 'bot', 
      text: PRESET_ANSWERS[item.id],
      action: item.id === 'trial' ? 'trial_cta' : item.id === 'human' ? 'whatsapp_cta' : null
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/api/ai/quran-assistant', { 
        question: userText, 
        locale: locale || 'ar' 
      }, { auth: !!user }).catch(() => null);

      const replyText = res?.answer || 
        'شكراً لتواصلك! لقد تم تسجيل استفسارك وسيقوم فريق الأكاديمية بالرد عليك، أو يمكنك حجز حصتك التجريبية المجانية مباشرة أو التواصل مع خدمة العملاء عبر الواتساب.';

      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, sender: 'bot', text: replyText }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: 'يسعدنا تواصلك دائماً! يمكنك التحدث مباشرة مع خدمة العملاء أو حجز حصتك التجريبية المجانية الآن.',
          action: 'trial_cta'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 active:scale-95 group border-2 border-emerald-300/30"
        aria-label="مساعد الأثر لخدمة العملاء"
      >
        <div className="relative">
          <MessageCircle size={22} className="animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white" />
        </div>
        <span className="text-sm font-bold hidden sm:inline font-arabic">مساعد الأثر الذكي</span>
      </button>

      {/* Chat Modal Box */}
      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden animate-fade-in font-arabic">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-amber-300">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>مساعد أكاديمية الأثر</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[11px] text-emerald-200">متواجد لخدمتك والإجابة عن الحصص والأسعار</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-xs sm:text-sm">{m.text}</p>

                  {/* Optional CTA buttons inside message */}
                  {m.action === 'trial_cta' && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-100 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate('/free-trial');
                        }}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow flex items-center justify-center gap-1.5"
                      >
                        <Gift size={14} />
                        <span>احجز حصتك التجريبية مجاناً الآن</span>
                      </button>
                    </div>
                  )}

                  {m.action === 'whatsapp_cta' && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-100">
                      <a
                        href="https://wa.me/201000000000?text=السلام%20عليكم%20أود%20الاستفسار%20عن%20حلقات%20أكاديمية%20الأثر%20الطيب"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition shadow flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle size={14} />
                        <span>فتح محادثة واتساب الإدارة</span>
                      </a>
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gray-300 text-gray-700 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-gray-500 bg-white p-2.5 rounded-xl w-fit border border-gray-100">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>المساعد يكتب الآن...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {QUICK_QUESTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleQuickQuestion(item)}
                className="whitespace-nowrap px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200/60 transition shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition shrink-0 shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}

