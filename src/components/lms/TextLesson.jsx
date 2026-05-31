export default function TextLesson({ lesson, locale }) {
  const text = lesson.content?.text?.[locale] || lesson.content?.text?.ar || '';
  const lines = text.split('\n');

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-8 text-gray-100">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-white">{line.slice(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4 text-white">{line.slice(2)}</h1>;
        if (/^\d+\./.test(line)) return <li key={i} className="mr-6 mb-2 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
        if (!line.trim()) return <br key={i} />;
        return <p key={i} className="mb-3 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}
