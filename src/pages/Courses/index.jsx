import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { useMarket } from '../../context/MarketProvider';
import api from '../../lib/api';

// بيانات وهمية للدورات

function CourseCard({ course, locale }) {
  const { t } = useI18n();
  const { displayPrice } = useMarket();
  
  const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  };

  const levelLabels = {
    beginner: t.courses.beginner,
    intermediate: t.courses.intermediate,
    advanced: t.courses.advanced
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
        <BookOpen size={64} className="text-white/30" />
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${levelColors[course.level]}`}>
          {levelLabels[course.level]}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">
          {course.title[locale] || course.title.ar}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {course.description[locale] || course.description.ar}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{course.students}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Star className="text-yellow-400 fill-yellow-400" size={20} />
          <span className="font-bold">{course.rating}</span>
          <span className="text-gray-500 text-sm">({course.reviews} {t.teachers.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">{displayPrice(course.price, course.currency || 'USD')}</span>
            <span className="text-gray-500 text-sm">/ {t.courses.duration}</span>
          </div>
        </div>

        <Link
          to={`/courses/${course.slug || course.id}`}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {t.courses.learnMore}
        </Link>
      </div>
    </motion.div>
  );
}

export default function Courses() {
  const { t, locale } = useI18n();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/api/courses')
      .then((data) => {
        if (data.courses?.length) {
          setCourses(data.courses.map((c) => ({
            id: c.slug,
            slug: c.slug,
            title: c.title,
            description: c.description,
            level: c.level || 'beginner',
            category: c.category || 'quran',
            price: c.price || 0,
            currency: c.currency || 'USD',
            duration: c.duration || `${c.durationInHours || 0}h`,
            students: c.stats?.enrolled || 0,
            rating: c.stats?.rating?.average || 5,
            reviews: c.stats?.rating?.count || 0,
          })));
        } else {
          setCourses([]);
        }
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title[locale]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description[locale]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'popular') return b.students - a.students;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  return (
    <>
      <SEOHead 
        page={{
          title: t.courses.title,
          description: t.courses.subtitle,
          url: '/courses',
          keywords: 'quran courses, arabic courses, tajweed, islamic studies, online learning',
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
              {t.courses.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-emerald-100 max-w-2xl mx-auto"
            >
              {t.courses.subtitle}
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
                  placeholder={locale === 'ar' ? 'ابحث عن دورة...' : 'Search for a course...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Filter size={20} />
                {locale === 'ar' ? 'فلاتر' : 'Filters'}
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t"
              >
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.courses.level}
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">{locale === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="beginner">{t.courses.beginner}</option>
                    <option value="intermediate">{t.courses.intermediate}</option>
                    <option value="advanced">{t.courses.advanced}</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">{locale === 'ar' ? 'الكل' : 'All'}</option>
                    <option value="quran">{locale === 'ar' ? 'القرآن' : 'Quran'}</option>
                    <option value="tajweed">{locale === 'ar' ? 'التجويد' : 'Tajweed'}</option>
                    <option value="arabic">{locale === 'ar' ? 'اللغة العربية' : 'Arabic'}</option>
                    <option value="ijazah">{locale === 'ar' ? 'الإجازة' : 'Ijazah'}</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'ترتيب حسب' : 'Sort by'}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="popular">{locale === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</option>
                    <option value="rating">{locale === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                    <option value="price-low">{locale === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                    <option value="price-high">{locale === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Courses Grid */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6 text-gray-600">
            {locale === 'ar' 
              ? `عرض ${sortedCourses.length} دورة`
              : `Showing ${sortedCourses.length} courses`
            }
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div>
          ) : sortedCourses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">
                {locale === 'ar' ? 'لم يتم العثور على دورات' : 'No courses found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedCourses.map((course) => (
                <CourseCard key={course.id} course={course} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </div>

      <GlobalFooter />
    </>
  );
}
