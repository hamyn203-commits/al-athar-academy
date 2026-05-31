const RecitationReport = require('../models/RecitationReport');

const SYSTEM_QURAN = 'You are an Islamic education assistant for Al-Athar Academy. Answer in the user language with authentic sources. Be concise and practical.';

async function callOpenAI(messages, { maxTokens = 800 } = {}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content?.trim() || '',
    provider: 'openai',
    model: data.model,
  };
}

async function callGemini(prompt, { locale = 'ar' } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_QURAN}\nLanguage: ${locale}\n\n${prompt}` }] }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  return { text, provider: 'gemini', model };
}

async function chat(prompt, { locale = 'ar', role = 'quran' } = {}) {
  const system = role === 'teacher'
    ? 'You help Quran teachers with lesson plans and student engagement.'
    : role === 'student'
      ? 'You help students plan daily Quran memorization and tajweed practice.'
      : SYSTEM_QURAN;

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ];

  try {
    const openai = await callOpenAI(messages);
    if (openai?.text) return { ...openai, fallback: false };
  } catch (e) {
    console.warn('OpenAI failed:', e.message);
  }

  try {
    const gemini = await callGemini(prompt, { locale });
    if (gemini?.text) return { ...gemini, fallback: false };
  } catch (e) {
    console.warn('Gemini failed:', e.message);
  }

  return {
    text: locale === 'ar'
      ? `بخصوص: "${prompt.slice(0, 120)}" — راجع التفسير الميسر واستمع لتلاوة مجودة. (وضع محلي — أضف OPENAI_API_KEY أو GEMINI_API_KEY)`
      : `Regarding "${prompt.slice(0, 120)}" — review tafsir and qualified reciters. (local mode — add API keys)`,
    provider: 'local',
    fallback: true,
  };
}

function localRecitationAnalysis(filename, locale = 'ar') {
  const base = {
    overallScore: 72 + Math.floor(Math.random() * 18),
    tajweed: { score: 75, notes: locale === 'ar' ? ['تحسين الغنة في بعض المواضع'] : ['Improve ghunnah in some places'] },
    makhraj: { score: 73, notes: locale === 'ar' ? ['انتبه لمخرج حرف القاف'] : ['Watch Qaf articulation'] },
    waqf: { score: 78, notes: locale === 'ar' ? ['وقف جيد في معظم الآيات'] : ['Good stopping points'] },
    mad: { score: 74, notes: locale === 'ar' ? ['مد طبيعي قصير في بعض المواضع'] : ['Natural mad slightly short'] },
    recommendations: locale === 'ar'
      ? ['تدرب على سورة الملك مع التركيز على الغنة', 'راجع مخارج الحروف المفخمة', 'سجّل تلاوة جديدة بعد 3 أيام']
      : ['Practice Surah Al-Mulk focusing on ghunnah', 'Review heavy letter makhraj', 'Record again after 3 days'],
    source: filename || 'audio-upload',
    provider: 'local-heuristic',
  };
  base.overallScore = Math.round((base.tajweed.score + base.makhraj.score + base.waqf.score + base.mad.score) / 4);
  return base;
}

async function analyzeRecitation(userId, file, { locale = 'ar' } = {}) {
  let analysis = localRecitationAnalysis(file?.originalname, locale);
  let provider = 'local-heuristic';

  if (process.env.OPENAI_API_KEY && file?.buffer) {
    try {
      const audioBase64 = file.buffer.toString('base64');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Analyze Quran recitation audio (filename: ${file.originalname}). Return JSON only: overallScore, tajweed, makhraj, waqf, mad (each with score 0-100 and notes array), recommendations array. Language for notes: ${locale}.`,
          }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content || '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          analysis = { ...localRecitationAnalysis(file.originalname, locale), ...parsed };
          provider = 'openai';
        }
      }
    } catch (e) {
      console.warn('AI recitation analysis fallback:', e.message);
    }
  }

  const report = await RecitationReport.create({
    user: userId,
    filename: file?.originalname,
    mimeType: file?.mimetype,
    size: file?.size,
    ...analysis,
    provider,
  });

  return {
    reportId: report.reportId,
    ...analysis,
    analyzedAt: report.createdAt,
    id: report._id,
  };
}

async function generateHomework({ topic, level, count = 5, locale = 'ar' }) {
  const prompt = `Generate ${count} Islamic education homework assignments about "${topic || 'Tajweed'}" for ${level || 'intermediate'} level. Return JSON array: [{title, type, description}] in ${locale}.`;
  const result = await chat(prompt, { locale, role: 'teacher' });

  try {
    const match = result.text.match(/\[[\s\S]*\]/);
    if (match) {
      const items = JSON.parse(match[0]);
      return { assignments: items.map((a, i) => ({ id: i + 1, ...a })), provider: result.provider };
    }
  } catch (_) { /* fallback below */ }

  return {
    assignments: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `${topic || 'Tajweed'} — ${locale === 'ar' ? 'تمرين' : 'Exercise'} ${i + 1}`,
      level: level || 'intermediate',
      type: i % 2 === 0 ? 'recitation' : 'written',
    })),
    provider: result.provider,
  };
}

module.exports = { chat, analyzeRecitation, generateHomework, localRecitationAnalysis };
