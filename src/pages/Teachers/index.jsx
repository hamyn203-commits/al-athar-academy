import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Clock, Award } from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    gender: '',
    specialization: '',
    language: '',
    minRating: '',
    minExperience: ''
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  useEffect(() => {
    fetchTeachers();
  }, [filters, pagination.page]);

  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 12,
        ...filters
      });

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">المعلمون المعتمدون</h1>
        <p className="text-center text-gray-600 mb-8">اختر المعلم المناسب لك من نخبة من أفضل المعلمين</p>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="input-field"
            >
              <option value="">كل الدول</option>
              <option value="مصر">مصر</option>
              <option value="السعودية">السعودية</option>
              <option value="الأردن">الأردن</option>
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
            </select>

            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="input-field"
            >
              <option value="">اللغة</option>
              <option value="arabic">العربية</option>
              <option value="english">الإنجليزية</option>
            </select>

            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="input-field"
            >
              <option value="">التقييم</option>
              <option value="4">4+ نجوم</option>
              <option value="4.5">4.5+ نجوم</option>
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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <Link
                  key={teacher._id}
                  to={`/teachers/${teacher._id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  <div className="relative">
                    <img
                      src={teacher.media.profilePhoto || '/default-teacher.png'}
                      alt={teacher.user.name}
                      className="w-full h-64 object-cover"
                    />
                    {teacher.isFeatured && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                        مميز
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{teacher.user.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="font-bold">{teacher.rating.average.toFixed(1)}</span>
                      <span className="text-gray-500">({teacher.rating.count} تقييم)</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{teacher.personalInfo.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{teacher.quranInfo.teachingExperience} سنوات خبرة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={16} />
                        <span>{teacher.quranInfo.numberOfIjazat} إجازات</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {teacher.quranInfo.specializations.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs"
                        >
                          {spec === 'children' ? 'أطفال' : spec === 'adults' ? 'كبار' : spec}
                        </span>
                      ))}
                    </div>

                    <button className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition">
                      عرض الملف الشخصي
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === i + 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}