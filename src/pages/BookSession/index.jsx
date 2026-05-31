import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Info, Globe, AlertCircle } from 'lucide-react';

export default function BookSession() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

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
          timezone,
          notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ تم إرسال طلب الحصة التجريبية بنجاح!\n\nسيتم إعلامك عند موافقة المعلم عبر البريد الإلكتروني.');
        navigate('/student/dashboard');
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

  const getTimezones = () => {
    return [
      { value: 'Africa/Cairo', label: 'القاهرة (مصر)' },
      { value: 'Asia/Riyadh', label: 'الرياض (السعودية)' },
      { value: 'Asia/Dubai', label: 'دبي (الإمارات)' },
      { value: 'Asia/Kuwait', label: 'الكويت' },
      { value: 'Asia/Qatar', label: 'قطر' },
      { value: 'Asia/Amman', label: 'عمّان (الأردن)' },
      { value: 'Asia/Beirut', label: 'بيروت (لبنان)' },
      { value: 'Europe/London', label: 'لندن' },
      { value: 'Europe/Paris', label: 'باريس' },
      { value: 'America/New_York', label: 'نيويورك' },
    ];
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <img
                src={teacher.media.profilePhoto || '/default-teacher.png'}
                alt={teacher.user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold mb-2">حجز حصة تجريبية مجانية</h1>
                <p className="text-emerald-100 text-lg">مع {teacher.user.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    60 دقيقة
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle size={16} />
                    مجانية
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">معلومات مهمة:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>الحصة التجريبية مجانية بالكامل</li>
                    <li>المدة: 60 دقيقة كاملة</li>
                    <li>سيتم إعلامك عند موافقة المعلم</li>
                    <li>يمكنك إلغاء الحصة قبل 24 ساعة</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                <Calendar className="inline ml-2 text-emerald-600" size={18} />
                اختر التاريخ *
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="input-field"
              >
                <option value="">اختر تاريخ مناسب</option>
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
              <label className="block mb-2 font-semibold text-gray-700">
                <Clock className="inline ml-2 text-emerald-600" size={18} />
                اختر الوقت *
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="input-field"
              >
                <option value="">اختر وقت مناسب</option>
                {getTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                <Globe className="inline ml-2 text-emerald-600" size={18} />
                المنطقة الزمنية *
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
                className="input-field"
              >
                {getTimezones().map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                المنطقة الزمنية الحالية: {timezone}
              </p>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                ملاحظات أو طلبات خاصة (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: أريد التركيز على التجويد، أو لدي مستوى مبتدئ..."
                rows={4}
                className="input-field"
              />
            </div>

            {showConfirmation && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-2">تأكيد الحجز</h3>
                    <p className="text-gray-700 mb-3">هل أنت متأكد من حجز الحصة التجريبية؟</p>
                    <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                      <p><strong>المعلم:</strong> {teacher.user.name}</p>
                      <p><strong>التاريخ:</strong> {selectedDate && new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><strong>الوقت:</strong> {selectedTime}</p>
                      <p><strong>المنطقة الزمنية:</strong> {timezone}</p>
                      {notes && <p><strong>ملاحظات:</strong> {notes}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    تعديل
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'جاري الإرسال...' : 'تأكيد الحجز'}
                  </button>
                </div>
              </div>
            )}

            {!showConfirmation && (
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-lg hover:from-emerald-700 hover:to-green-700 transition text-lg font-bold shadow-lg"
              >
                متابعة الحجز
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}