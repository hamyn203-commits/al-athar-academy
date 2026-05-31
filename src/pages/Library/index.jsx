import { useState, useEffect } from 'react';
import { MonitorPlay, Play, BookOpen, Filter } from 'lucide-react';
import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';

const CATS = [
  { id: '', ar: 'الكل', en: 'All' },
  { id: 'quran', ar: 'القرآن', en: 'Quran' },
  { id: 'tajweed', ar: 'التجويد', en: 'Tajweed' },
  { id: 'arabic', ar: 'العربية', en: 'Arabic' },
  { id: 'seerah', ar: 'السيرة', en: 'Seerah' },
  { id: 'kids', ar: 'أطفال', en: 'Kids' },
];

export default function VideoLibrary() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = category ? `?category=${category}` : '';
    api.get(`/api/videos${q}`).then((d) => setVideos(d.videos || [])).catch(() => setVideos([])).finally(() => setLoading(false));
  }, [category]);

  const fmt = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <>
      <SEOHead page={{ url: '/library', title: isAr ? 'مكتبة الفيديو | الأثر' : 'Video Library | Al-Athar', description: isAr ? 'دروس القرآن والتجويد والعربية' : 'Quran, Tajweed, and Arabic lessons' }} />
      <GlobalHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <MonitorPlay className="mx-auto text-emerald-600 mb-4" size={48} />
            <h1 className="text-4xl font-bold mb-3">{isAr ? 'مكتبة الفيديو العالمية' : 'Global Video Library'}</h1>
            <p className="text-gray-600">{isAr ? 'دروس مجانية في القرآن والتجويد والعربية' : 'Free lessons in Quran, Tajweed, and Arabic'}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {CATS.map((c) => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === c.id ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'}`}>
                {isAr ? c.ar : c.en}
              </button>
            ))}
          </div>

          {selected && (
            <div className="mb-8 aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
              <iframe title={selected.title} src={selected.videoUrl} className="w-full h-full" allowFullScreen />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner spinner-lg" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => (
                <button key={v._id} type="button" onClick={() => setSelected(v)} className="bg-white rounded-2xl shadow-md overflow-hidden text-right hover:shadow-lg transition">
                  <div className="aspect-video bg-emerald-100 flex items-center justify-center relative">
                    <Play className="text-emerald-600" size={40} />
                    {v.duration > 0 && <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">{fmt(v.duration)}</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{isAr ? v.title : (v.titleEn || v.title)}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><BookOpen size={12} /> {v.category} · {v.views || 0} {isAr ? 'مشاهدة' : 'views'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
