import { useState, useMemo } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

const LETTERS = [
  { ar: 'أ', hint: { ar: 'أول حرف في «أب»', en: 'First letter of the alphabet' } },
  { ar: 'ب', hint: { ar: 'حرف «بيت»', en: 'In the word for house' } },
  { ar: 'ت', hint: { ar: 'حرف «تلميذ»', en: 'In the word for student' } },
  { ar: 'ث', hint: { ar: 'حرف «ثمر»', en: 'In the word for fruit' } },
  { ar: 'ج', hint: { ar: 'حرف «جمل»', en: 'In the word for camel' } },
];

function pickOptions(correct) {
  const others = LETTERS.map((l) => l.ar).filter((a) => a !== correct);
  const wrong = others.sort(() => Math.random() - 0.5).slice(0, 2);
  return [correct, ...wrong].sort(() => Math.random() - 0.5);
}

export default function KidsLettersGame({ locale = 'ar' }) {
  const isAr = locale === 'ar';
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [seed, setSeed] = useState(0);

  const current = LETTERS[idx];
  const options = useMemo(() => pickOptions(current.ar), [idx, seed]);

  const pick = (letter) => {
    if (picked) return;
    setPicked(letter);
    if (letter === current.ar) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= LETTERS.length) setDone(true);
      else { setIdx((n) => n + 1); setPicked(null); setSeed((s) => s + 1); }
    }, 600);
  };

  const reset = () => { setIdx(0); setScore(0); setPicked(null); setDone(false); setSeed((s) => s + 1); };

  if (done) {
    return (
      <div className="bg-gradient-to-br from-sky-100 to-indigo-50 rounded-2xl p-8 text-center border border-sky-200">
        <Trophy className="mx-auto text-sky-600 mb-4" size={48} />
        <h3 className="text-2xl font-bold mb-2">{isAr ? 'ممتاز!' : 'Great job!'}</h3>
        <p className="text-lg mb-6">{isAr ? `حروف صحيحة: ${score}/${LETTERS.length}` : `Correct: ${score}/${LETTERS.length}`}</p>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold">
          <RotateCcw size={18} /> {isAr ? 'مرة أخرى' : 'Play again'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-sky-100">
      <p className="text-xs text-sky-600 font-semibold mb-2">{isAr ? `حرف ${idx + 1}/${LETTERS.length}` : `Letter ${idx + 1}/${LETTERS.length}`}</p>
      <p className="text-gray-600 text-sm mb-4">{isAr ? current.hint.ar : current.hint.en}</p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((letter) => (
          <button key={letter} type="button" onClick={() => pick(letter)}
            className={`text-3xl font-bold py-6 rounded-xl border-2 transition ${
              picked === null ? 'border-gray-200 hover:border-sky-400 hover:bg-sky-50' :
              letter === current.ar ? 'border-emerald-500 bg-emerald-50' :
              picked === letter ? 'border-red-400 bg-red-50' : 'border-gray-100 opacity-50'
            }`}>
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
