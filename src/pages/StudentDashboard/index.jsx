import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Star, Clock, CheckCircle, FileText, Upload } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [homework, setHomework] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentTeacher, setCurrentTeacher] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'student') {
      navigate('/');
      return;
    }

    fetchSessions();
    fetchHomework();
    fetchReviews();
  }, [navigate]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/my-sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchHomework = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/homework/student', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHomework(data.homework || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews/student', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitHomework = async (homeworkId, file) => {
    const formData = new FormData();
    formData.append('submission', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/homework/${homeworkId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchHomework();
        alert('تم رفع الواجب بنجاح');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الرفع');
    }
  };

  const rateSession = async (sessionId, teacherId) => {
    const rating = parseInt(prompt('قيّم الحصة (1-5):') || '5');
    const comment = prompt('اكتب تعليقك:') || '';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teacherId,
          sessionId,
          rating,
          comment
        })
      });

      if (response.ok) {
        fetchReviews();
        alert('تم إرسال التقييم بنجاح');
      }
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  const upcomingSessions = sessions.filter(s => 
    s.status === 'accepted' && new Date(s.scheduledAt) > new Date()
  );

  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">لوحة تحكم الطالب</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">الحصص القادمة</p>
                <p className="text-2xl font-bold text-emerald-600">{upcomingSessions.length}</p>
              </div>
              <Calendar className="text-emerald-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">الحصص المكتملة</p>
                <p className="text-2xl font-bold text-blue-600">{completedSessions.length}</p>
              </div>
              <CheckCircle className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">الواجبات</p>
                <p className="text-2xl font-bold text-purple-600">{homework.length}</p>
              </div>
              <FileText className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">التقييمات</p>
                <p className="text-2xl font-bold text-orange-600">{reviews.length}</p>
              </div>
              <Star className="text-orange-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === 'sessions'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                حصصي
              </button>
              <button
                onClick={() => setActiveTab('homework')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === 'homework'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                الواجبات
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                تقييماتي
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">مرحباً بك</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-6 rounded-lg">
                    <h3 className="font-bold mb-2">الحصص القادمة</h3>
                    <p className="text-3xl font-bold text-emerald-600">{upcomingSessions.length}</p>
                    <p className="text-sm text-gray-600">حصة مجدولة</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold mb-2">التقدم</h3>
                    <p className="text-3xl font-bold text-blue-600">{completedSessions.length}</p>
                    <p className="text-sm text-gray-600">حصة مكتملة</p>
                  </div>
                </div>

                {upcomingSessions.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-4">أقرب حصة</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{upcomingSessions[0].teacher.user.name}</h4>
                          <p className="text-gray-600">
                            {new Date(upcomingSessions[0].scheduledAt).toLocaleString('ar-EG')}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                          دخول الحصة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">جميع الحصص</h2>
                {sessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد حصص</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{session.teacher.user.name}</h3>
                          <p className="text-gray-600">
                            الموعد: {new Date(session.scheduledAt).toLocaleString('ar-EG')}
                          </p>
                          <p className="text-sm text-gray-500">
                            الحالة: {session.status === 'accepted' ? 'مقبولة' : session.status === 'completed' ? 'مكتملة' : session.status}
                          </p>
                          {session.status === 'completed' && !session.studentFeedback && (
                            <button
                              onClick={() => rateSession(session._id, session.teacher._id)}
                              className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                              قيّم الحصة
                            </button>
                          )}
                        </div>
                        {session.status === 'accepted' && (
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                            دخول
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'homework' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">الواجبات</h2>
                {homework.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد واجبات</p>
                ) : (
                  homework.map((hw) => (
                    <div key={hw._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{hw.title}</h3>
                          <p className="text-gray-600">{hw.description}</p>
                          <p className="text-sm text-gray-500">
                            الموعد النهائي: {new Date(hw.dueDate).toLocaleDateString('ar-EG')}
                          </p>
                          <p className="text-sm text-gray-500">
                            الحالة: {hw.status === 'submitted' ? 'تم التسليم' : 'قيد الانتظار'}
                          </p>
                        </div>
                        {hw.status !== 'submitted' && (
                          <div>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => submitHomework(hw._id, e.target.files[0])}
                              className="hidden"
                              id={`upload-${hw._id}`}
                            />
                            <label
                              htmlFor={`upload-${hw._id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2"
                            >
                              <Upload size={16} />
                              رفع الواجب
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">تقييماتي</h2>
                {reviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لم تقم بأي تقييم بعد</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{review.teacher.user.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}