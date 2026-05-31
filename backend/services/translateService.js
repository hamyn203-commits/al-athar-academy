const { chat } = require('./aiService');

const LANG_NAMES = {
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
  de: 'German',
  tr: 'Turkish',
  ur: 'Urdu',
  id: 'Indonesian',
  ms: 'Malay',
  ku: 'Kurdish',
};

const SUPPORTED = Object.keys(LANG_NAMES);

async function translate(text, from, to) {
  const trimmed = text?.trim();
  if (!trimmed) return { text: '', provider: 'none' };
  if (from === to) return { text: trimmed, provider: 'none' };

  const prompt = `You are a professional translator for Islamic education sessions (Quran, Tajweed).
Translate the following from ${LANG_NAMES[from] || from} to ${LANG_NAMES[to] || to}.
Keep Islamic terms accurate (Allah, Quran, Surah, Tajweed). Return ONLY the translation.

Text:
${trimmed}`;

  const result = await chat(prompt, { locale: to, role: 'quran' });
  return { text: result.text?.trim() || trimmed, provider: result.provider, fallback: result.fallback };
}

async function translateBatch(text, from, targets) {
  const out = { [from]: text };
  await Promise.all(
    targets.filter((t) => t !== from).map(async (to) => {
      const r = await translate(text, from, to);
      out[to] = r.text;
    })
  );
  return out;
}

module.exports = { translate, translateBatch, LANG_NAMES, SUPPORTED };
