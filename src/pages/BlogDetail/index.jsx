import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import LocalizedLink from '../../components/LocalizedLink';
import { useI18n } from '../../i18n';
import api from '../../lib/api';

const fallbackPosts = {
  'benefits-of-memorization': {
    title: 'فوائد حفظ القرآن الكريم',
    excerpt: 'اكتشف الفوائد الروحية والنفسية والاجتماعية لحفظ كتاب الله',
    content: 'حفظ القرآن الكريم له فوائد عظيمة على المسلم في دنياه وآخرته...',
    category: 'quran',
    readTime: 7,
    createdAt: new Date().toISOString(),
  },
};

export default function BlogDetail() {
  const { slug } = useParams();
  const { locale } = useI18n();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/blog/${slug}?locale=${locale}`)
      .then(setPost)
      .catch(() => setPost(fallbackPosts[slug] || null))
      .finally(() => setLoading(false));
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <main className="flex-1 container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">المقال غير موجود</h1>
          <LocalizedLink to="/blog" className="btn-primary">العودة للمدونة</LocalizedLink>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title={post.title} description={post.excerpt} type="article" />
      <GlobalHeader />
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-semibold mb-4">
            <Tag size={14} /> {post.category}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex gap-4 text-gray-500 text-sm mb-8">
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString(locale)}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime} د</span>
          </div>
          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl mb-8 shadow-lg" loading="lazy" />
          )}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {post.content || post.excerpt}
          </div>
          <LocalizedLink to="/blog" className="inline-flex items-center gap-2 mt-10 text-emerald-600 font-semibold hover:gap-3 transition-all">
            <ArrowRight size={18} className="rotate-180" /> العودة للمدونة
          </LocalizedLink>
        </motion.div>
      </article>
      <GlobalFooter />
    </div>
  );
}
