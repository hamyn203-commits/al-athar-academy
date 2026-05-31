import { useState } from 'react';
import { useI18n } from '../../i18n';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  Tag,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

// بيانات وهمية للمقالات
const mockArticles = [
  {
    id: 1,
    title: {
      ar: 'أفضل طرق حفظ القرآن الكريم',
      en: 'Best Methods for Memorizing the Quran',
      fr: 'Meilleures Méthodes pour Mémoriser le Coran',
      de: 'Beste Methoden zum Auswendiglernen des Korans',
      tr: 'Kuran Ezberlemenin En İyi Yolları',
      ur: 'قرآن حفظ کرنے کے بہترین طریقے',
      id: 'Cara Terbaik Menghafal Al-Quran',
      ms: 'Cara Terbaik Menghafal Al-Quran'
    },
    excerpt: {
      ar: 'اكتشف أفضل الطرق والاستراتيجيات لحفظ القرآن الكريم بفعالية وسهولة',
      en: 'Discover the best methods and strategies for memorizing the Quran effectively and easily',
      fr: 'Découvrez les meilleures méthodes et stratégies pour mémoriser le Coran efficacement et facilement',
      de: 'Entdecken Sie die besten Methoden und Strategien zum effektiven und einfachen Auswendiglernen des Korans',
      tr: 'Kuran\'ı etkili ve kolay bir şekilde ezberlemenin en iyi yollarını ve stratejilerini keşfedin',
      ur: 'قرآن کو مؤثر اور آسانی سے حفظ کرنے کے بہترین طریقوں اور حکمت عملیوں کو دریافت کریں',
      id: 'Temukan cara dan strategi terbaik untuk menghafal Al-Quran secara efektif dan mudah',
      ms: 'Temui cara dan strategi terbaik untuk menghafal Al-Quran secara berkesan dan mudah'
    },
    image: '/blog/quran-memorization.jpg',
    category: 'quran',
    author: 'الشيخ أحمد محمد',
    date: '2026-05-15',
    readTime: '8 min',
    tags: ['quran', 'memorization', 'tips']
  },
  {
    id: 2,
    title: {
      ar: 'أحكام التجويد الأساسية للمبتدئين',
      en: 'Basic Tajweed Rules for Beginners',
      fr: 'Règles de Base du Tajweed pour Débutants',
      de: 'Grundlegende Tajweed-Regeln für Anfänger',
      tr: 'Başlangıç Seviyesi için Temel Tecvid Kuralları',
      ur: 'مبتدیان کے لیے بنیادی تجوید کے قواعد',
      id: 'Aturan Dasar Tajwid untuk Pemula',
      ms: 'Peraturan Asas Tajwid untuk Pemula'
    },
    excerpt: {
      ar: 'تعلم أهم أحكام التجويد التي يحتاجها كل مبتدئ في تلاوة القرآن',
      en: 'Learn the most important Tajweed rules that every beginner needs in Quran recitation',
      fr: 'Apprenez les règles de Tajweed les plus importantes dont chaque débutant a besoin dans la récitation du Coran',
      de: 'Lernen Sie die wichtigsten Tajweed-Regeln, die jeder Anfänger bei der Koranrezitation benötigt',
      tr: 'Kuran tilavetinde her başlangıç seviyesinin ihtiyaç duyduğu en önemli Tecvid kurallarını öğrenin',
      ur: 'قرآن کی تلاوت میں ہر مبتدی کو جن اہم تجوید کے قواعد کی ضرورت ہوتی ہے انہیں سیکھیں',
      id: 'Pelajari aturan Tajwid paling penting yang dibutuhkan setiap pemula dalam membaca Al-Quran',
      ms: 'Pelajari peraturan Tajwid paling penting yang diperlukan setiap pemula dalam membaca Al-Quran'
    },
    image: '/blog/tajweed-basics.jpg',
    category: 'tajweed',
    author: 'الشيخة فاطمة علي',
    date: '2026-05-10',
    readTime: '10 min',
    tags: ['tajweed', 'beginners', 'quran']
  },
  {
    id: 3,
    title: {
      ar: 'كيف تعلم اللغة العربية بسرعة',
      en: 'How to Learn Arabic Quickly',
      fr: 'Comment Apprendre l\'Arabe Rapidement',
      de: 'Wie man Arabisch schnell lernt',
      tr: 'Arapça Nasıl Hızlı Öğrenilir',
      ur: 'عربی تیزی سے کیسے سیکھیں',
      id: 'Cara Belajar Bahasa Arab dengan Cepat',
      ms: 'Cara Belajar Bahasa Arab dengan Cepat'
    },
    excerpt: {
      ar: 'نصائح واستراتيجيات عملية لتعلم اللغة العربية في وقت قصير',
      en: 'Practical tips and strategies to learn Arabic in a short time',
      fr: 'Conseils et stratégies pratiques pour apprendre l\'arabe en peu de temps',
      de: 'Praktische Tipps und Strategien, um Arabisch in kurzer Zeit zu lernen',
      tr: 'Kısa sürede Arapça öğrenmek için pratik ipuçları ve stratejiler',
      ur: 'کم وقت میں عربی سیکھنے کے لیے عملی نکات اور حکمت عملیاں',
      id: 'Tips dan strategi praktis untuk belajar bahasa Arab dalam waktu singkat',
      ms: 'Tips dan strategi praktikal untuk belajar bahasa Arab dalam masa singkat'
    },
    image: '/blog/learn-arabic.jpg',
    category: 'arabic',
    author: 'الدكتور خالد محمود',
    date: '2026-05-05',
    readTime: '12 min',
    tags: ['arabic', 'language', 'learning']
  },
  {
    id: 4,
    title: {
      ar: 'فضل تعلم القرآن وتعليمه',
      en: 'The Virtue of Learning and Teaching the Quran',
      fr: 'Le Mérite d\'Apprendre et d\'Enseigner le Coran',
      de: 'Die Tugend des Lernens und Lehrens des Korans',
      tr: 'Kuran Öğrenmenin ve Öğretmenin Fazileti',
      ur: 'قرآن سیکھنے اور سکھانے کی فضیلت',
      id: 'Keutamaan Belajar dan Mengajar Al-Quran',
      ms: 'Kelebihan Belajar dan Mengajar Al-Quran'
    },
    excerpt: {
      ar: 'اكتشف الأجر العظيم والثواب الجزيل في تعلم القرآن وتعليمه للآخرين',
      en: 'Discover the great reward and blessing in learning the Quran and teaching it to others',
      fr: 'Découvrez la grande récompense et la bénédiction d\'apprendre le Coran et de l\'enseigner aux autres',
      de: 'Entdecken Sie die große Belohnung und den Segen, den Koran zu lernen und ihn anderen beizubringen',
      tr: 'Kuran öğrenmenin ve başkalarına öğretmenin büyük ödülünü ve bereketini keşfedin',
      ur: 'قرآن سیکھنے اور دوسروں کو سکھانے میں عظیم اجر اور برکت کو دریافت کریں',
      id: 'Temukan pahala besar dan berkah dalam belajar Al-Quran dan mengajarkannya kepada orang lain',
      ms: 'Temui pahala besar dan keberkatan dalam belajar Al-Quran dan mengajarkannya kepada orang lain'
    },
    image: '/blog/quran-virtue.jpg',
    category: 'islamic',
    author: 'الشيخ عبد الرحمن الشريف',
    date: '2026-04-28',
    readTime: '6 min',
    tags: ['quran', 'islamic', 'virtue']
  },
  {
    id: 5,
    title: {
      ar: 'أخطاء شائعة في حفظ القرآن وكيفية تجنبها',
      en: 'Common Mistakes in Quran Memorization and How to Avoid Them',
      fr: 'Erreurs Courantes dans la Mémorisation du Coran et Comment les Éviter',
      de: 'Häufige Fehler beim Auswendiglernen des Korans und wie man sie vermeidet',
      tr: 'Kuran Ezberlemede Yaygın Hatalar ve Bunlardan Nasıl Kaçınılır',
      ur: 'قرآن حفظ کرنے میں عام غلطیاں اور ان سے کیسے بچیں',
      id: 'Kesalahan Umum dalam Menghafal Al-Quran dan Cara Menghindarinya',
      ms: 'Kesalahan Umum dalam Menghafal Al-Quran dan Cara Mengelakkannya'
    },
    excerpt: {
      ar: 'تعرف على أكثر الأخطاء شيوعاً التي يقع فيها حفاظ القرآن وطرق التغلب عليها',
      en: 'Learn about the most common mistakes made by Quran memorizers and ways to overcome them',
      fr: 'Découvrez les erreurs les plus courantes commises par les mémorisateurs du Coran et les moyens de les surmonter',
      de: 'Erfahren Sie mehr über die häufigsten Fehler, die von Koran-Memorierern gemacht werden, und wie man sie überwindet',
      tr: 'Kuran ezberleyenlerin yaptığı en yaygın hataları ve bunların üstesinden gelme yollarını öğrenin',
      ur: 'قرآن حفظ کرنے والوں کی طرف سے کی جانے والی سب سے عام غلطیوں اور ان پر قابو پانے کے طریقوں کے بارے میں جانیں',
      id: 'Pelajari tentang kesalahan paling umum yang dibuat oleh penghafal Al-Quran dan cara mengatasinya',
      ms: 'Pelajari tentang kesalahan paling umum yang dibuat oleh penghafal Al-Quran dan cara mengatasinya'
    },
    image: '/blog/common-mistakes.jpg',
    category: 'quran',
    author: 'الأستاذة مريم أحمد',
    date: '2026-04-20',
    readTime: '9 min',
    tags: ['quran', 'memorization', 'tips']
  },
  {
    id: 6,
    title: {
      ar: 'أهمية الإجازة في القراءات',
      en: 'The Importance of Ijazah in Qira\'at',
      fr: 'L\'Importance de l\'Ijazah dans les Qira\'at',
      de: 'Die Bedeutung der Ijazah in Qira\'at',
      tr: 'Kıraatlerde İcazetin Önemi',
      ur: 'قراءت میں اجازہ کی اہمیت',
      id: 'Pentingnya Ijazah dalam Qira\'at',
      ms: 'Kepentingan Ijazah dalam Qira\'at'
    },
    excerpt: {
      ar: 'فهم أهمية الإجازة في القراءات ودورها في حفظ سلسلة النقل',
      en: 'Understanding the importance of Ijazah in Qira\'at and its role in preserving the chain of transmission',
      fr: 'Comprendre l\'importance de l\'Ijazah dans les Qira\'at et son rôle dans la préservation de la chaîne de transmission',
      de: 'Verstehen Sie die Bedeutung der Ijazah in Qira\'at und ihre Rolle bei der Bewahrung der Überlieferungskette',
      tr: 'Kıraatlerde icazetin önemini ve aktarım zincirini korumadaki rolünü anlamak',
      ur: 'قراءت میں اجازہ کی اہمیت اور سلسلہ نقل کو محفوظ رکھنے میں اس کے کردار کو سمجھنا',
      id: 'Memahami pentingnya Ijazah dalam Qira\'at dan perannya dalam menjaga rantai transmisi',
      ms: 'Memahami kepentingan Ijazah dalam Qira\'at dan peranannya dalam menjaga rantai transmisi'
    },
    image: '/blog/ijazah-importance.jpg',
    category: 'ijazah',
    author: 'الشيخ صابر عبد المولى',
    date: '2026-04-15',
    readTime: '7 min',
    tags: ['ijazah', 'qiraat', 'islamic']
  }
];

function ArticleCard({ article, locale }) {
  const { t } = useI18n();
  
  const categoryColors = {
    quran: 'bg-emerald-100 text-emerald-700',
    tajweed: 'bg-blue-100 text-blue-700',
    arabic: 'bg-purple-100 text-purple-700',
    islamic: 'bg-yellow-100 text-yellow-700',
    ijazah: 'bg-red-100 text-red-700'
  };

  const categoryLabels = {
    quran: locale === 'ar' ? 'القرآن' : 'Quran',
    tajweed: locale === 'ar' ? 'التجويد' : 'Tajweed',
    arabic: locale === 'ar' ? 'اللغة العربية' : 'Arabic',
    islamic: locale === 'ar' ? 'إسلامي' : 'Islamic',
    ijazah: locale === 'ar' ? 'الإجازة' : 'Ijazah'
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
        <BookOpen size={64} className="text-white/30" />
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${categoryColors[article.category]}`}>
          {categoryLabels[article.category]}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 line-clamp-2">
          {article.title[locale] || article.title.ar}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt[locale] || article.excerpt.ar}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{new Date(article.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{article.readTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>

        <Link
          to={`/blog/${article.id}`}
          className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
        >
          {locale === 'ar' ? 'اقرأ المزيد' : 'Read More'}
          <ChevronRight size={16} />
        </Link>
      </div>
    </motion.article>
  );
}

export default function Blog() {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title[locale]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt[locale]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEOHead 
        page={{
          title: locale === 'ar' ? 'المدونة' : 'Blog',
          description: locale === 'ar' 
            ? 'مقالات ونصائح في تعليم القرآن واللغة العربية' 
            : 'Articles and tips on Quran and Arabic language education',
          url: '/blog',
          keywords: 'quran blog, arabic learning, tajweed articles, islamic education',
          type: 'website'
        }}
      />
      
      <GlobalHeader />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-4"
            >
              {locale === 'ar' ? 'المدونة' : 'Blog'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-emerald-100 max-w-2xl mx-auto"
            >
              {locale === 'ar' 
                ? 'مقالات ونصائح في تعليم القرآن واللغة العربية' 
                : 'Articles and tips on Quran and Arabic language education'
              }
            </motion.p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="container mx-auto px-4 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={locale === 'ar' ? 'ابحث في المقالات...' : 'Search articles...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{locale === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="quran">{locale === 'ar' ? 'القرآن' : 'Quran'}</option>
                <option value="tajweed">{locale === 'ar' ? 'التجويد' : 'Tajweed'}</option>
                <option value="arabic">{locale === 'ar' ? 'اللغة العربية' : 'Arabic'}</option>
                <option value="islamic">{locale === 'ar' ? 'إسلامي' : 'Islamic'}</option>
                <option value="ijazah">{locale === 'ar' ? 'الإجازة' : 'Ijazah'}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6 text-gray-600">
            {locale === 'ar' 
              ? `عرض ${filteredArticles.length} مقال`
              : `Showing ${filteredArticles.length} articles`
            }
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">
                {locale === 'ar' ? 'لم يتم العثور على مقالات' : 'No articles found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </div>

      <GlobalFooter />
    </>
  );
}
