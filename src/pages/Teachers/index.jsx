import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Clock, Award, BookOpen, Users, ChevronDown } from 'lucide-react';
import { v4Markets } from '../../data/v4Data';
import { useMarket } from '../../context/MarketProvider';

export default function Teachers() {
  const [searchParams] = useSearchParams();
  const { displayPrice } = useMarket();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    market: searchParams.get('market') || '',
    country: '',
    gender: '',
    specialization: '',
    language: '',
    minRating: '',
    minExperience: ''
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [filters, pagination.page, sortBy]);

  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 12,
        sortBy,
        sortOrder: 'desc',
        ...filters
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/teachers?${params}`);
      const data = await response.json();
      
      setTeachers(data.teachers);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTeachers();
  };

  const clearFilters = () => {
    setFilters({
      market: '',
      country: '',
      gender: '',
      specialization: '',
      language: '',
      minRating: '',
      minExperience: ''
    });
    setSearchQuery('');
    setSortBy('rating');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">المعلمون المعتمدون</h1>
          <p className="text-gray-600 text-lg">اختر المعلم المناسب لك من نخبة من أفضل المعلمين المجازين</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="ابحث عن معلم بالاسم أو التخصص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none text-lg"
            />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700"
            >
              <Filter size={20} />
              الفلاتر المتقدمة
              <ChevronDown size={20} className={`transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="rating">الأعلى تقييماً</option>
                <option value="experience">الأكثر خبرة</option>
                <option value="students">الأكثر طلاباً</option>
                <option value="newest">الأحدث</option>
              </select>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 pt-4 border-t">
              <select
                value={filters.market}
                onChange={(e) => handleFilterChange('market', e.target.value)}
                className="input-field"
              >
                <option value="">كل الأسواق</option>
                {v4Markets.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.region}</option>
                ))}
              </select>

              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="input-field"
              >
                <option value="">كل الدول</option>
                <option value="مصر">مصر</option>
                <option value="السعودية">السعودية</option>
                <option value="الأردن">الأردن</option>
                <option value="الإمارات">الإمارات</option>
                <option value="الكويت">الكويت</option>
                <option value="قطر">قطر</option>
              </select>

              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="input-field"
              >
                <option value="">الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>

              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="input-field"
              >
                <option value="">التخصص</option>
                <option value="children">أطفال</option>
                <option value="adults">كبار</option>
                <option value="women">نساء</option>
                <option value="tajweed">تجويد</option>
                <option value="ijaza">إجازة</option>
                <option value="arabic-language">لغة عربية</option>
              </select>

              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="input-field"
              >
                <option value="">اللغة</option>
                <option value="arabic">العربية</option>
                <option value="english">الإنجليزية</option>
                <option value="french">الفرنسية</option>
                <option value="turkish">التركية</option>
              </select>

              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="input-field"
              >
                <option value="">التقييم</option>
                <option value="4">4+ نجوم</option>
                <option value="4.5">4.5+ نجوم</option>
                <option value="4.8">4.8+ نجوم</option>
              </select>

              <select
                value={filters.minExperience}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                className="input-field"
              >
                <option value="">الخبرة</option>
                <option value="2">2+ سنوات</option>
                <option value="5">5+ سنوات</option>
                <option value="10">10+ سنوات</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">جاري تحميل المعلمين...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600 mb-2">لا يوجد معلمون مطابقون للبحث</p>
            <p className="text-gray-500">جرب تغيير الفلاتر أو البحث بكلمات أخرى</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              <p>عرض {teachers.length} من {pagination.total} معلم</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <Link
                  key={teacher._id}
                  to={`/teachers/${teacher._id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={teacher.media.profilePhoto || '/default-teacher.png'}
                      alt={teacher.user.name}
                      className="w-full h-64 object-cover"
                    />
                    {teacher.isFeatured && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ⭐ معلم مميز
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {displayPrice(teacher.hourlyRate || 50, 'EGP')}/ساعة
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{teacher.user.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="font-bold text-lg">{teacher.rating.average.toFixed(1)}</span>
                      <span className="text-gray-500">({teacher.rating.count} تقييم)</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-600" />
                        <span>{teacher.personalInfo.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" />
                        <span>{teacher.quranInfo.teachingExperience} سنوات خبرة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-purple-600" />
                        <span>{teacher.quranInfo.numberOfIjazat} إجازات</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-orange-600" />
                        <span>حفظ {teacher.quranInfo.memorizedParts} جزء</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-green-600" />
                        <span>{teacher.stats.totalStudents} طالب</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">التخصصات:</p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.quranInfo.specializations.slice(0, 4).map((spec) => (
                          <span
                            key={spec}
                            className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {spec === 'children' ? '👶 أطفال' : 
                             spec === 'adults' ? '👨 كبار' : 
                             spec === 'women' ? '👩 نساء' :
                             spec === 'tajweed' ? '📖 تجويد' :
                             spec === 'ijaza' ? '🎓 إجازة' :
                             spec === 'arabic-language' ? '🗣️ لغة عربية' : spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition font-semibold shadow-md">
                      عرض الملف الشخصي
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`px-4 py-2 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}