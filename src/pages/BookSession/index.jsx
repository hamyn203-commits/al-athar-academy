import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export default function BookSession() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/book-trial/' + teacherId);
      return;
    }

    fetchTeacher();
  }, [teacherId, navigate]);

  const fetchTeacher = async () => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`);
      const data = await response.json();
      setTeacher(data);
    } catch (error) {
      console.error('Error fetching teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);

      const response = await fetch('/api/sessions/trial', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teacherId,
          scheduledAt,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('تم إرسال طلب الحصة التجريبية بنجاح! سيتم إعلامك عند الموافقة.');
        navigate('/student');
      } else {
        alert(data.error || 'حدث خطأ أثناء الحجز');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحجز');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8">
            <img
              src={teacher.media.profilePhoto || '/default-teacher.png'}
              alt={teacher.user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">حجز حصة تجريبية مجانية</h1>
              <p className="text-gray-600">مع {teacher.user.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">
                <Calendar className="inline ml-2" size={18} />
                اختر التاريخ
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="input-field"
              >
                <option value="">اختر تاريخ</option>
                {getAvailableDates().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('ar-EG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                <Clock className="inline ml-2" size={18} />
                اختر الوقت
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="input-field"
              >
                <option value="">اختر وقت</option>
                {getTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">ملاحظات (اختياري)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات أو طلبات خاصة..."
                rows={4}
                className="input-field"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">معلومات الحصة:</h3>
              <ul className="space-y-1 text-sm">
                <li>• المدة: 60 دقيقة</li>
                <li>• النوع: حصة تجريبية مجانية</li>
                <li>• سيتم إعلامك عند موافقة المعلم</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 text-white py-4 rounded-lg hover:bg-emerald-700 transition text-lg font-bold disabled:opacity-50"
            >
              {submitting ? 'جاري الإرسال...' : 'تأكيد الحجز'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}