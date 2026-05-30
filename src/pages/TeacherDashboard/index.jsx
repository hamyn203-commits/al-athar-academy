import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, Clock, BookOpen, CheckCircle, XCircle, Star, TrendingUp } from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    totalHours: 0,
    pendingEarnings: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [trialRequests, setTrialRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'teacher') {
      navigate('/');
      return;
    }

    fetchStats();
    fetchSessions();
    fetchStudents();
    fetchTrialRequests();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teachers/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/my-sessions?status=accepted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teachers/dashboard/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchTrialRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/my-sessions?type=trial&status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTrialRequests(data.sessions || []);
    } catch (error) {
      console.error('Error fetching trial requests:', error);
    }
  };

  const handleTrialResponse = async (sessionId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sessions/${sessionId}/respond`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        fetchTrialRequests();
        alert(action === 'accept' ? 'تم قبول الطلب' : 'تم رفض الطلب');
      }
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  const completeSession = async (sessionId) => {
    const evaluation = {
      attendance: parseInt(prompt('تقييم الحضور (1-5):') || '5'),
      memorization: parseInt(prompt('تقييم الحفظ (1-5):') || '5'),
      tajweed: parseInt(prompt('تقييم التجويد (1-5):') || '5'),
      behavior: parseInt(prompt('تقييم السلوك (1-5):') || '5'),
      commitment: parseInt(prompt('تقييم الالتزام (1-5):') || '5'),
      overallNotes: prompt('ملاحظات عامة:') || ''
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ evaluation })
      });

      if (response.ok) {
        fetchSessions();
        fetchStats();
        alert('تم إكمال الحصة بنجاح');
      }
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">لوحة تحكم المعلم</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">الطلاب</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalStudents}</p>
              </div>
              <Users className="text-emerald-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">الحصص</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
              </div>
              <Calendar className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">الساعات</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalHours}</p>
              </div>
              <Clock className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">مستحقة</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingEarnings}</p>
              </div>
              <DollarSign className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">إجمالي الأرباح</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalEarnings}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">التقييم</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="text-orange-600 fill-orange-600" size={32} />
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
                onClick={() => setActiveTab('trial-requests')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === 'trial-requests'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                طلبات الحصص التجريبية ({trialRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === 'sessions'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                الحصص القادمة
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === 'students'
                    ? 'border-b-2 border-emerald-600 text-emerald-600'
                    : 'text-gray-600'
                }`}
              >
                الطلاب
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">مرحباً بك في لوحة التحكم</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-6 rounded-lg">
                    <h3 className="font-bold mb-2">طلبات جديدة</h3>
                    <p className="text-3xl font-bold text-emerald-600">{trialRequests.length}</p>
                    <p className="text-sm text-gray-600">طلبات حصص تجريبية بانتظار الموافقة</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold mb-2">حصص اليوم</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {sessions.filter(s => new Date(s.scheduledAt).toDateString() === new Date().toDateString()).length}
                    </p>
                    <p className="text-sm text-gray-600">حصص مجدولة لليوم</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trial-requests' && (
              <div className="space-y-4">
                {trialRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد طلبات حصص تجريبية</p>
                ) : (
                  trialRequests.map((session) => (
                    <div key={session._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{session.student.name}</h3>
                          <p className="text-gray-600">
                            الموعد: {new Date(session.scheduledAt).toLocaleString('ar-EG')}
                          </p>
                          <p className="text-sm text-gray-500">{session.notes}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTrialResponse(session._id, 'accept')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => handleTrialResponse(session._id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد حصص قادمة</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{session.student.name}</h3>
                          <p className="text-gray-600">
                            الموعد: {new Date(session.scheduledAt).toLocaleString('ar-EG')}
                          </p>
                          <p className="text-sm text-gray-500">
                            المدة: {session.duration} دقيقة | النوع: {session.type === 'trial' ? 'تجريبية' : 'عادية'}
                          </p>
                        </div>
                        <button
                          onClick={() => completeSession(session._id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          إكمال الحصة
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-4">
                {students.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا يوجد طلاب حالياً</p>
                ) : (
                  students.map((student) => (
                    <div key={student._id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={student.avatar || '/default-avatar.png'}
                          alt={student.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{student.name}</h3>
                          <p className="text-gray-600">{student.email}</p>
                          <p className="text-sm text-gray-500">
                            عدد الحصص: {student.sessionCount || 0}
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