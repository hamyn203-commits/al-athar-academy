import api from './api';

const cache = new Map();

export async function translateText(text, from, to, { auth = false } = {}) {
  const key = `${from}:${to}:${text}`;
  if (cache.has(key)) return cache.get(key);

  const res = await api.post('/api/translate', { text, from, to }, { auth });
  cache.set(key, res.translated);
  return res.translated;
}

export async function fetchLanguages() {
  return api.get('/api/translate/languages');
}

export function clearTranslateCache() {
  cache.clear();
}
