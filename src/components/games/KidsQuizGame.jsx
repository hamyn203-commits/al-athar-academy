import { useState } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

const QUESTIONS = [
  {
    ar: 'كم عدد حروف الهجاء في اللغة العربية؟',
    en: 'How many Arabic letters are there?',
    options: { ar: ['28', '30', '26'], en: ['28', '30', '26'] },
    correct: 0,
  },
  {
    ar: 'ما حكم النون الساكنة عند التنوين؟',
    en: 'What is the rule for noon sakinah with tanween?',
    options: { ar: ['إظهار أو إدغام أو إقلاب أو إخفاء', 'إدغام فقط', 'إخفاء فقط'], en: ['Izhar, Idgham, Iqlab, or Ikhfa', 'Idgham only', 'Ikhfa only'] },
    correct: 0,
  },
  {
    ar: 'أين يقع حرف «ق» في كلمة «قرآن»؟',
    en: 'Where is the letter Qaf in the word Quran?',
    options: { ar: ['أول الكلمة', 'وسط الكلمة', 'آخر الكلمة'], en: ['Start', 'Middle', 'End'] },
    correct: 0,
  },
];

export default function KidsQuizGame({ locale = 'ar' }) {
  const isAr = locale === 'ar';
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[idx];
  const opts = q.options[isAr ? 'ar' : 'en'];

  const pick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= QUESTIONS.length) setDone(true);
      else { setIdx((n) => n + 1); setPicked(null); }
    }, 700);
  };

  const reset = () => { setIdx(0); setScore(0); setPicked(null); setDone(false); };

  if (done) {
    return (
      <div className="bg-gradient-to-br from-amber-100 to-orange-50 rounded-2xl p-8 text-center border border-amber-200">
        <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold mb-2">{isAr ? 'أحسنت!' : 'Well done!'}</h3>
        <p className="text-lg text-gray-700 mb-6">{isAr ? `نقاطك: ${score} / ${QUESTIONS.length}` : `Score: ${score} / ${QUESTIONS.length}`}</p>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold">
          <RotateCcw size={18} /> {isAr ? 'العب مرة أخرى' : 'Play again'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
      <p className="text-xs text-amber-600 font-semibold mb-2">{isAr ? `سؤال ${idx + 1} من ${QUESTIONS.length}` : `Question ${idx + 1} of ${QUESTIONS.length}`}</p>
      <h3 className="text-lg font-bold mb-5">{isAr ? q.ar : q.en}</h3>
      <div className="grid gap-3">
        {opts.map((label, i) => (
          <button key={label} type="button" onClick={() => pick(i)}
            className={`text-right px-4 py-3 rounded-xl border-2 font-medium transition ${
              picked === null ? 'border-gray-200 hover:border-amber-400 hover:bg-amber-50' :
              i === q.correct ? 'border-emerald-500 bg-emerald-50 text-emerald-800' :
              picked === i ? 'border-red-400 bg-red-50' : 'border-gray-100 opacity-60'
            }`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
