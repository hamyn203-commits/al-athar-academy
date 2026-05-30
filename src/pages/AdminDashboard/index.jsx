import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Calendar, DollarSign, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending-teachers');
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSessions: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchPendingTeachers();
    fetchStats();
  }, [navigate]);

  const fetchPendingTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teachers/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingTeachers(data);
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
    }
  };

  const fetchStats = async () => {
    // TODO: Implement stats API
    setStats({
      totalStudents: 150,
      totalTeachers: 25,
      totalSessions: 450,
      totalEarnings: 22500
    });
  };

  const handleReviewTeacher = async (teacherId, action, note = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teachers/admin/${teacherId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, note })
      });

      if (response.ok) {
        fetchPendingTeachers();
        alert(action === 'approve' ? 'تم قبول المعلم' : action === 'reject' ? 'تم رفض المعلم' : 'تم طلب التعديلات');
      }
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الطلاب</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.totalStudents}</p>
              </div>
              <Users className="text-emerald-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي المعلمين</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalTeachers}</p>
              </div>
              <BookOpen className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الحصص</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalSessions}</p>
              </div>
              <Calendar className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الأرباح</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalEarnings} ج.م</p>
              </div>
              <DollarSign className="text-yellow-600" size={40} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pending-teachers')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'pending-teachers'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                <Clock className="inline ml-2" size={18} />
                المعلمون قيد المراجعة ({pendingTeachers.length})
              </button>
              <button
                onClick={() => setActiveTab('approved-teachers')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'approved-teachers'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                <CheckCircle className="inline ml-2" size={18} />
                المعلمون المعتمدون
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'pending-teachers' && (
              <div className="space-y-4">
                {pendingTeachers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا يوجد معلمون قيد المراجعة</p>
                ) : (
                  pendingTeachers.map((teacher) => (
                    <div key={teacher._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <img
                            src={teacher.media.profilePhoto || '/default-teacher.png'}
                            alt={teacher.user.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-bold text-lg">{teacher.user.name}</h3>
                            <p className="text-gray-600">{teacher.personalInfo.country} - {teacher.personalInfo.city}</p>
                            <p className="text-sm text-gray-500">
                              تقدم بطلب: {new Date(teacher.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                                {teacher.quranInfo.teachingExperience} سنوات خبرة
                              </span>
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                                {teacher.quranInfo.numberOfIjazat} إجازات
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/teachers/${teacher._id}`)}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            title="عرض الملف الشخصي"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleReviewTeacher(teacher._id, 'approve')}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            title="قبول"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('سبب الرفض (اختياري):');
                              handleReviewTeacher(teacher._id, 'reject', note || '');
                            }}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            title="رفض"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">الجامعة</p>
                          <p className="font-semibold">{teacher.academicInfo.university}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">التخصص</p>
                          <p className="font-semibold">{teacher.academicInfo.specialization}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">الأجزاء المحفوظة</p>
                          <p className="font-semibold">{teacher.quranInfo.memorizedParts} / 30</p>
                        </div>
                        <div>
                          <p className="text-gray-600">اللغات</p>
                          <p className="font-semibold">{teacher.languages.join(', ')}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-600 text-sm mb-2">المستندات والوسائط:</p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.documents.idCard && (
                            <a href={teacher.documents.idCard} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                              البطاقة الشخصية
                            </a>
                          )}
                          {teacher.documents.graduationCertificate && (
                            <a href={teacher.documents.graduationCertificate} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                              شهادة التخرج
                            </a>
                          )}
                          {teacher.media.introductionVideo && (
                            <a href={teacher.media.introductionVideo} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                              فيديو تعريفي
                            </a>
                          )}
                          {teacher.media.recitationVideo && (
                            <a href={teacher.media.recitationVideo} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                              فيديو تلاوة
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'approved-teachers' && (
              <p className="text-center text-gray-500 py-8">قريباً...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}