import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Award, BookOpen, Video, Calendar, CheckCircle } from 'lucide-react';

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchTeacher();
    fetchReviews();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const response = await fetch(`/api/teachers/${id}`);
      const data = await response.json();
      setTeacher(data);
    } catch (error) {
      console.error('Error fetching teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/teacher/${id}`);
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBookTrial = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/book-trial/' + id);
    } else {
      navigate('/book-trial/' + id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">المعلم غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={teacher.media.profilePhoto || '/default-teacher.png'}
                alt={teacher.user.name}
                className="w-full h-96 object-cover"
              />
            </div>
            
            <div className="md:w-2/3 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{teacher.user.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="font-bold">{teacher.rating.average.toFixed(1)}</span>
                      <span>({teacher.rating.count} تقييم)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={18} />
                      <span>{teacher.personalInfo.country}</span>
                    </div>
                  </div>
                </div>
                {teacher.isFeatured && (
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold">
                    معلم مميز
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <Clock className="mx-auto mb-2 text-emerald-600" size={24} />
                  <p className="text-2xl font-bold text-emerald-600">{teacher.quranInfo.teachingExperience}</p>
                  <p className="text-sm text-gray-600">سنوات خبرة</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <BookOpen className="mx-auto mb-2 text-emerald-600" size={24} />
                  <p className="text-2xl font-bold text-emerald-600">{teacher.quranInfo.memorizedParts}</p>
                  <p className="text-sm text-gray-600">جزء محفوظ</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <Award className="mx-auto mb-2 text-emerald-600" size={24} />
                  <p className="text-2xl font-bold text-emerald-600">{teacher.quranInfo.numberOfIjazat}</p>
                  <p className="text-sm text-gray-600">إجازات</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <CheckCircle className="mx-auto mb-2 text-emerald-600" size={24} />
                  <p className="text-2xl font-bold text-emerald-600">{teacher.stats.totalStudents}</p>
                  <p className="text-sm text-gray-600">طالب</p>
                </div>
              </div>

              <button
                onClick={handleBookTrial}
                className="w-full bg-emerald-600 text-white py-4 rounded-lg hover:bg-emerald-700 transition text-lg font-bold"
              >
                احجز حصة تجريبية مجانية
              </button>
            </div>
          </div>

          <div className="border-t">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'about'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                نبذة عن المعلم
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'videos'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                الفيديوهات
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                التقييمات ({reviews.length})
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">السيرة الذاتية</h3>
                    <p className="text-gray-700 leading-relaxed">{teacher.user.bio || 'لا توجد سيرة ذاتية'}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">المؤهلات الأكاديمية</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• {teacher.academicInfo.university} - {teacher.academicInfo.faculty}</li>
                      <li>• التخصص: {teacher.academicInfo.specialization}</li>
                      <li>• سنة التخرج: {teacher.academicInfo.graduationYear}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">التخصصات</h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.quranInfo.specializations.map((spec) => (
                        <span
                          key={spec}
                          className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full"
                        >
                          {spec === 'children' ? 'تعليم الأطفال' : 
                           spec === 'adults' ? 'تعليم الكبار' :
                           spec === 'women' ? 'تعليم النساء' :
                           spec === 'non-arabic' ? 'غير الناطقين بالعربية' :
                           spec === 'tajweed' ? 'التجويد' :
                           spec === 'ijaza' ? 'الإجازة' : 'اللغة العربية'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">اللغات</h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.languages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full"
                        >
                          {lang === 'arabic' ? 'العربية' :
                           lang === 'english' ? 'الإنجليزية' :
                           lang === 'french' ? 'الفرنسية' :
                           lang === 'turkish' ? 'التركية' : 'الأردية'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">فيديو تعريفي</h3>
                    {teacher.media.introductionVideo ? (
                      <video controls className="w-full rounded-lg">
                        <source src={teacher.media.introductionVideo} type="video/mp4" />
                      </video>
                    ) : (
                      <p className="text-gray-500">لا يوجد فيديو تعريفي</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">فيديو تلاوة</h3>
                    {teacher.media.recitationVideo ? (
                      <video controls className="w-full rounded-lg">
                        <source src={teacher.media.recitationVideo} type="video/mp4" />
                      </video>
                    ) : (
                      <p className="text-gray-500">لا يوجد فيديو تلاوة</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">فيديو طريقة التدريس</h3>
                    {teacher.media.teachingMethodVideo ? (
                      <video controls className="w-full rounded-lg">
                        <source src={teacher.media.teachingMethodVideo} type="video/mp4" />
                      </video>
                    ) : (
                      <p className="text-gray-500">لا يوجد فيديو طريقة التدريس</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد تقييمات بعد</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={review.student.avatar || '/default-avatar.png'}
                              alt={review.student.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <span className="font-semibold">{review.student.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}