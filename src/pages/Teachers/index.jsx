import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Clock, Award, BookOpen, Users, ChevronDown } from 'lucide-react';
import { v4Markets } from '../../data/v4Data';
import { useMarket } from '../../context/MarketProvider';
import { useI18n } from '../../i18n';

export default function Teachers() {
  const [searchParams] = useSearchParams();
  const { displayPrice } = useMarket();
  const { locale } = useI18n();
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

      if (!response.ok) {
        setTeachers([]);
        return;
      }

      setTeachers(data.teachers || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total ?? 0,
        pages: data.pagination?.pages ?? 0,
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

  const labels = {
    id: {
      title: 'Guru Bersertifikat Elite',
      subtitle: 'Pilih guru Anda dari kumpulan instruktur bersertifikat dan terakreditasi kami',
      searchPlaceholder: 'Cari guru berdasarkan nama atau spesialisasi...',
      advancedFilters: 'Filter Lanjutan',
      sortBy: 'Urutkan berdasarkan',
      ratingHigh: 'Penilaian Tertinggi',
      expHigh: 'Paling Berpengalaman',
      studentsHigh: 'Siswa Terbanyak',
      newest: 'Terbaru',
      clearFilters: 'Hapus Filter',
      allMarkets: 'Semua Pasar',
      allCountries: 'Semua Negara',
      gender: 'Jenis Kelamin',
      male: 'Laki-laki',
      female: 'Perempuan',
      specialization: 'Spesialisasi',
      children: 'Anak-anak',
      adults: 'Dewasa',
      women: 'Wanita',
      tajweed: 'Tajwid',
      ijaza: 'Ijazah',
      arabicLang: 'B. Arab',
      language: 'Bahasa',
      arabic: 'Arab',
      english: 'Inggris',
      french: 'Prancis',
      turkish: 'Turki',
      experience: 'Pengalaman',
      exp2: '2+ Tahun',
      exp5: '5+ Tahun',
      exp10: '10+ Tahun',
      hourlyRate: 'Tarif Per Jam',
      hour: 'jam',
      featured: '⭐ Guru Unggulan',
      ratingCount: 'penilaian',
      yearsExp: 'tahun pengalaman',
      ijazat: 'ijazah',
      memorized: 'Hafal',
      parts: 'juz',
      students: 'siswa',
      viewProfile: 'Lihat Profil',
      loading: 'Memuat data guru...',
      noTutors: 'Belum ada guru terdaftar',
      registerTeacher: 'Gabung Sebagai Guru',
      noTutorsMatched: 'Tidak ada guru yang cocok dengan pencarian Anda',
      tryChanging: 'Coba ubah filter atau gunakan kata kunci lain',
      showing: 'Menampilkan {count} dari {total} guru',
      previous: 'Sebelumnya',
      next: 'Berikutnya'
    },
    ar: {
      title: 'المعلمون المعتمدون',
      subtitle: 'اختر المعلم المناسب لك من نخبة من أفضل المعلمين المجازين',
      searchPlaceholder: 'ابحث عن معلم بالاسم أو التخصص...',
      advancedFilters: 'الفلاتر المتقدمة',
      sortBy: 'ترتيب حسب',
      ratingHigh: 'الأعلى تقييماً',
      expHigh: 'الأكثر خبرة',
      studentsHigh: 'الأكثر طلاباً',
      newest: 'الأحدث',
      clearFilters: 'مسح الفلاتر',
      allMarkets: 'كل الأسواق',
      allCountries: 'كل الدول',
      gender: 'الجنس',
      male: 'ذكر',
      female: 'أنثى',
      specialization: 'التخصص',
      children: 'أطفال',
      adults: 'كبار',
      women: 'نساء',
      tajweed: 'تجويد',
      ijaza: 'إجازة',
      arabicLang: 'لغة عربية',
      language: 'اللغة',
      arabic: 'العربية',
      english: 'الإنجليزية',
      french: 'الفرنسية',
      turkish: 'التركية',
      experience: 'الخبرة',
      exp2: '2+ سنوات',
      exp5: '5+ سنوات',
      exp10: '10+ سنوات',
      hourlyRate: 'سعر الساعة',
      hour: 'ساعة',
      featured: '⭐ معلم مميز',
      ratingCount: 'تقييم',
      yearsExp: 'سنوات خبرة',
      ijazat: 'إجازات',
      memorized: 'حفظ',
      parts: 'جزء',
      students: 'طالب',
      viewProfile: 'عرض الملف الشخصي',
      loading: 'جاري تحميل المعلمين...',
      noTutors: 'لا يوجد معلمون مسجلون بعد',
      registerTeacher: 'انضم كمعلم',
      noTutorsMatched: 'لا يوجد معلمون مطابقون للبحث',
      tryChanging: 'جرب تغيير الفلاتر أو البحث بكلمات أخرى',
      showing: 'عرض {count} من {total} معلم',
      previous: 'السابق',
      next: 'التالي'
    },
    en: {
      title: 'Certified Tutors',
      subtitle: 'Choose the suitable tutor from an elite selection of certified tutors',
      searchPlaceholder: 'Search for tutor by name or specialization...',
      advancedFilters: 'Advanced Filters',
      sortBy: 'Sort By',
      ratingHigh: 'Highest Rated',
      expHigh: 'Most Experienced',
      studentsHigh: 'Most Students',
      newest: 'Newest',
      clearFilters: 'Clear Filters',
      allMarkets: 'All Markets',
      allCountries: 'All Countries',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      specialization: 'Specialization',
      children: 'Children',
      adults: 'Adults',
      women: 'Women',
      tajweed: 'Tajweed',
      ijaza: 'Ijaza',
      arabicLang: 'Arabic Language',
      language: 'Language',
      arabic: 'Arabic',
      english: 'English',
      french: 'French',
      turkish: 'Turkish',
      experience: 'Experience',
      exp2: '2+ Years',
      exp5: '5+ Years',
      exp10: '10+ Years',
      hourlyRate: 'Hourly Rate',
      hour: 'hr',
      featured: '⭐ Featured Tutor',
      ratingCount: 'rating',
      yearsExp: 'years experience',
      ijazat: 'ijazas',
      memorized: 'Memorized',
      parts: 'parts',
      students: 'students',
      viewProfile: 'View Profile',
      loading: 'Loading tutors...',
      noTutors: 'No registered tutors found',
      registerTeacher: 'Join as a Tutor',
      noTutorsMatched: 'No tutors match your search criteria',
      tryChanging: 'Try changing the filters or searching for other keywords',
      showing: 'Showing {count} of {total} tutors',
      previous: 'Previous',
      next: 'Next'
    }
  };

  const active = labels[locale] || labels.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{active.title}</h1>
          <p className="text-gray-600 text-lg">{active.subtitle}</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={active.searchPlaceholder}
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
              {active.advancedFilters}
              <ChevronDown size={20} className={`transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="rating">{active.ratingHigh}</option>
                <option value="experience">{active.expHigh}</option>
                <option value="students">{active.studentsHigh}</option>
                <option value="newest">{active.newest}</option>
              </select>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                {active.clearFilters}
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
                <option value="">{active.allMarkets}</option>
                {v4Markets.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.region}</option>
                ))}
              </select>

              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="input-field"
              >
                <option value="">{active.allCountries}</option>
                <option value="مصر">{locale === 'id' ? 'Mesir' : locale === 'ar' ? 'مصر' : 'Egypt'}</option>
                <option value="السعودية">{locale === 'id' ? 'Arab Saudi' : locale === 'ar' ? 'السعودية' : 'Saudi Arabia'}</option>
                <option value="الأردن">{locale === 'id' ? 'Yordania' : locale === 'ar' ? 'الأردن' : 'Jordan'}</option>
                <option value="الإمارات">{locale === 'id' ? 'UEA' : locale === 'ar' ? 'الإمارات' : 'UAE'}</option>
                <option value="الكويت">{locale === 'id' ? 'Kuwait' : locale === 'ar' ? 'الكويت' : 'Kuwait'}</option>
                <option value="قطر">{locale === 'id' ? 'Qatar' : locale === 'ar' ? 'قطر' : 'Qatar'}</option>
              </select>

              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="input-field"
              >
                <option value="">{active.gender}</option>
                <option value="male">{active.male}</option>
                <option value="female">{active.female}</option>
              </select>

              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="input-field"
              >
                <option value="">{active.specialization}</option>
                <option value="children">{active.children}</option>
                <option value="adults">{active.adults}</option>
                <option value="women">{active.women}</option>
                <option value="tajweed">{active.tajweed}</option>
                <option value="ijaza">{active.ijaza}</option>
                <option value="arabic-language">{active.arabicLang}</option>
              </select>

              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="input-field"
              >
                <option value="">{active.language}</option>
                <option value="arabic">{active.arabic}</option>
                <option value="english">{active.english}</option>
                <option value="french">{active.french}</option>
                <option value="turkish">{active.turkish}</option>
              </select>

              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="input-field"
              >
                <option value="">{active.rating}</option>
                <option value="4">4+ {locale === 'id' ? 'Bintang' : locale === 'ar' ? 'نجوم' : 'Stars'}</option>
                <option value="4.5">4.5+ {locale === 'id' ? 'Bintang' : locale === 'ar' ? 'نجوم' : 'Stars'}</option>
                <option value="4.8">4.8+ {locale === 'id' ? 'Bintang' : locale === 'ar' ? 'نجوم' : 'Stars'}</option>
              </select>

              <select
                value={filters.minExperience}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                className="input-field"
              >
                <option value="">{active.experience}</option>
                <option value="2">{active.exp2}</option>
                <option value="5">{active.exp5}</option>
                <option value="10">{active.exp10}</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">{active.loading}</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            {pagination.total === 0 && !searchQuery && !filters.country && !filters.specialization && !filters.market ? (
              <>
                <p className="text-xl text-gray-600 mb-2">{active.noTutors}</p>
                <p className="text-gray-500 mb-4">{locale === 'id' ? 'Daftar sebagai guru atau kembali lagi nanti setelah mengaktifkan data demo.' : locale === 'ar' ? 'سجّل كمعلم أو عد لاحقاً بعد تفعيل البيانات التجريبية' : 'Register as a tutor or return later after demo data is activated.'}</p>
                <Link to="/register/teacher" className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">{active.registerTeacher}</Link>
              </>
            ) : (
              <>
                <p className="text-xl text-gray-600 mb-2">{active.noTutorsMatched}</p>
                <p className="text-gray-500">{active.tryChanging}</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              <p>{active.showing.replace('{count}', teachers.length).replace('{total}', pagination.total)}</p>
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
                        {active.featured}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                      {displayPrice(teacher.hourlyRate || 50, 'EGP')}/{locale === 'id' ? 'jam' : locale === 'ar' ? 'ساعة' : 'hr'}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{teacher.user.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="font-bold text-lg">{teacher.rating.average.toFixed(1)}</span>
                      <span className="text-gray-500">({teacher.rating.count} {active.ratingCount})</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-600" />
                        <span>{locale === 'id' && teacher.personalInfo.country === 'مصر' ? 'Mesir' : locale === 'id' && teacher.personalInfo.country === 'السعودية' ? 'Arab Saudi' : teacher.personalInfo.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" />
                        <span>{teacher.quranInfo.teachingExperience} {active.yearsExp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-purple-600" />
                        <span>{teacher.quranInfo.numberOfIjazat} {active.ijazat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-orange-600" />
                        <span>{active.memorized} {teacher.quranInfo.memorizedParts} {active.parts}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-green-600" />
                        <span>{teacher.stats.totalStudents} {active.students}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">{locale === 'id' ? 'Spesialisasi:' : locale === 'ar' ? 'التخصصات:' : 'Specializations:'}</p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.quranInfo.specializations.slice(0, 4).map((spec) => (
                          <span
                            key={spec}
                            className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {spec === 'children' ? (locale === 'id' ? '👶 Anak-anak' : '👶 أطفال') : 
                             spec === 'adults' ? (locale === 'id' ? '👨 Dewasa' : '👨 كبار') : 
                             spec === 'women' ? (locale === 'id' ? '👩 Wanita' : '👩 نساء') :
                             spec === 'tajweed' ? (locale === 'id' ? '📖 Tajwid' : '📖 تجويد') :
                             spec === 'ijaza' ? (locale === 'id' ? '🎓 Ijazah' : '🎓 إجازة') :
                             spec === 'arabic-language' ? (locale === 'id' ? '🗣️ B. Arab' : '🗣️ لغة عربية') : spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition font-semibold shadow-md">
                      {active.viewProfile}
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
                  {active.previous}
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
                  {active.next}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}