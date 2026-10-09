import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CalendarClock, CheckCircle2, GraduationCap, PlusCircle,
  RefreshCw, UsersRound
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';

const DAY_OPTIONS = [
  ['Saturday', 'السبت'],
  ['Sunday', 'الأحد'],
  ['Monday', 'الاثنين'],
  ['Tuesday', 'الثلاثاء'],
  ['Wednesday', 'الأربعاء'],
  ['Thursday', 'الخميس'],
  ['Friday', 'الجمعة'],
];

function planName(item) {
  return item?.pricingSnapshot?.nameAr || item?.planKey || 'اشتراك';
}

function teacherName(item) {
  return item?.preferredTeacher?.personalInfo?.fullName
    || item?.preferredTeacher?.user?.name
    || 'لم يُحدد';
}

function statusLabel(status) {
  if (status === 'awaiting_placement') return 'مدفوع — بانتظار التسكين';
  if (status === 'placed') return 'تم التسكين — الجروب قيد الاكتمال';
  if (status === 'active') return 'نشط';
  return status || '—';
}

export default function AdminSubscriptions() {
  const { user, ready, logout } = useRequireAuth(['admin']);
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState('awaiting_placement');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [forms, setForms] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(
        '/api/subscriptions/admin/placements?status=' + encodeURIComponent(filter),
        { auth: true }
      );
      setSubscriptions(result.subscriptions || []);
    } catch (error) {
      toast.error(error.message || 'تعذر تحميل طلبات التسكين');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const formFor = (item) => forms[item._id] || {
    mode: item.compatibleCircles?.length ? 'existing' : 'new',
    existingCircleId: item.compatibleCircles?.[0]?._id || '',
    circleName: `${planName(item)} — ${teacherName(item)}`,
    day: '',
    startTime: '',
    endTime: '',
  };

  const updateForm = (id, patch) => {
    setForms((current) => ({
      ...current,
      [id]: {
        ...formFor(subscriptions.find((item) => item._id === id) || {}),
        ...current[id],
        ...patch,
      },
    }));
  };

  const place = async (item) => {
    const form = formFor(item);

    if (form.mode === 'existing' && !form.existingCircleId) {
      return toast.error('اختر جروبًا موجودًا أو اختر إنشاء جروب جديد');
    }
    if (form.mode === 'new' && !form.circleName.trim()) {
      return toast.error('اكتب اسم الجروب');
    }

    const schedule = (
      form.mode === 'new'
      && form.day
      && form.startTime
      && form.endTime
    ) ? [{
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
    }] : [];

    setWorking(item._id);
    try {
      const result = await api.post(
        '/api/subscriptions/admin/' + encodeURIComponent(item._id) + '/place',
        form.mode === 'existing'
          ? { existingCircleId: form.existingCircleId }
          : {
              circleName: form.circleName.trim(),
              schedule,
              timezone: 'Africa/Cairo',
            },
        { auth: true }
      );

      toast.success(
        result.subscriptionStatus === 'active'
          ? 'تم تسكين الطالب والحلقة أصبحت نشطة'
          : `تم تسكين الطالب. الجروب الآن ${result.studentCount}/${result.minimumToStart} من الحد الأدنى للتشغيل`
      );
      await load();
    } catch (error) {
      toast.error(error.message || 'فشل تسكين الطالب');
    } finally {
      setWorking('');
    }
  };

  const counts = useMemo(() => ({
    total: subscriptions.length,
    awaiting: subscriptions.filter((item) => item.status === 'awaiting_placement').length,
    placed: subscriptions.filter((item) => item.status === 'placed').length,
    active: subscriptions.filter((item) => item.status === 'active').length,
  }), [subscriptions]);

  if (!ready) return null;

  return (
    <DashboardLayout title="إدارة اشتراكات الطلاب والتسكين" user={user} onLogout={logout}>
      <div className="space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <button onClick={() => navigate('..')} className="wn-btn wn-btn--secondary">
            <ArrowRight size={16} /> لوحة الإدارة
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="awaiting_placement">بانتظار التسكين</option>
              <option value="placed">تم التسكين — انتظار اكتمال الجروب</option>
              <option value="active">نشطة</option>
              <option value="all">الكل</option>
            </select>
            <button onClick={load} className="wn-btn wn-btn--secondary" disabled={loading}>
              <RefreshCw size={16} /> تحديث
            </button>
          </div>
        </div>

        <section className="grid sm:grid-cols-3 gap-3">
          <div className="wn-dashboard-surface">
            <small className="text-slate-500">طلبات ظاهرة</small>
            <strong className="block text-2xl mt-1">{counts.total}</strong>
          </div>
          <div className="wn-dashboard-surface">
            <small className="text-slate-500">تحتاج تسكين</small>
            <strong className="block text-2xl mt-1 text-amber-700">{counts.awaiting}</strong>
          </div>
          <div className="wn-dashboard-surface">
            <small className="text-slate-500">نشطة</small>
            <strong className="block text-2xl mt-1 text-emerald-700">{counts.active}</strong>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner spinner-lg" /></div>
        ) : subscriptions.length === 0 ? (
          <div className="wn-dashboard-surface text-center text-gray-500 py-14">
            لا توجد اشتراكات في هذه الحالة.
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((item) => {
              const form = formFor(item);
              const amount = Number(item.totalAmountMinor || 0) / 100;
              const canPlace = item.status === 'awaiting_placement';

              return (
                <article key={item._id} className="wn-dashboard-surface">
                  <div className="grid lg:grid-cols-[1fr_1.15fr] gap-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold">{item.student?.name || 'طالب'}</h3>
                          <p className="text-sm text-slate-500">{item.student?.email || ''}</p>
                        </div>
                        <span className={
                          'text-xs px-3 py-1 rounded-full ' +
                          (item.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'placed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-800')
                        }>
                          {statusLabel(item.status)}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-50 border p-4 space-y-2 text-sm">
                        <p><strong>الباقة:</strong> {planName(item)}</p>
                        <p><strong>القسم:</strong> {item.section === 'ladies' ? 'قسم السيدات' : 'قسم الرجال والأطفال'}</p>
                        <p><strong>عدد الحصص:</strong> {item.sessionCount}</p>
                        <p><strong>المبلغ المدفوع:</strong> {amount} {item.currency}</p>
                        <p>
                          <strong>حجم الجروب:</strong>{' '}
                          {item.pricingSnapshot?.minStudents || '—'}–{item.pricingSnapshot?.maxStudents || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-center gap-3">
                        <GraduationCap size={22} className="text-emerald-700" />
                        <div>
                          <small className="text-slate-500">اختيار الطالب للمعلم</small>
                          <strong className="block text-emerald-900">{teacherName(item)}</strong>
                        </div>
                      </div>

                      {item.circle ? (
                        <div className="rounded-xl border p-4 flex items-center gap-3">
                          <UsersRound size={21} />
                          <div>
                            <small className="text-slate-500">الجروب الحالي</small>
                            <strong className="block">{item.circle.name || item.circle.code}</strong>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {canPlace ? (
                      <div className="rounded-2xl border p-5 bg-white">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                          <UsersRound size={19} /> تسكين الطالب
                        </h4>

                        <div className="grid sm:grid-cols-2 gap-2 mb-4">
                          <button
                            type="button"
                            onClick={() => updateForm(item._id, {
                              mode: 'existing',
                              existingCircleId: item.compatibleCircles?.[0]?._id || '',
                            })}
                            className={
                              'border rounded-xl p-3 text-sm font-semibold ' +
                              (form.mode === 'existing' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : '')
                            }
                          >
                            جروب موجود ({item.compatibleCircles?.length || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() => updateForm(item._id, { mode: 'new' })}
                            className={
                              'border rounded-xl p-3 text-sm font-semibold ' +
                              (form.mode === 'new' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : '')
                            }
                          >
                            <PlusCircle size={16} className="inline ml-1" /> جروب جديد
                          </button>
                        </div>

                        {form.mode === 'existing' ? (
                          <label className="block">
                            <span className="text-sm font-semibold">اختر الجروب المتوافق</span>
                            <select
                              value={form.existingCircleId}
                              onChange={(event) => updateForm(item._id, { existingCircleId: event.target.value })}
                              className="mt-2 w-full border rounded-xl px-3 py-3"
                            >
                              <option value="">اختر الجروب</option>
                              {(item.compatibleCircles || []).map((circle) => (
                                <option key={circle._id} value={circle._id}>
                                  {circle.name} — {circle.currentCount}/{circle.capacity}
                                </option>
                              ))}
                            </select>
                            {(item.compatibleCircles || []).length === 0 ? (
                              <p className="text-xs text-amber-700 mt-2">
                                لا يوجد جروب متوافق مع الشيخ والخطة حاليًا. أنشئ جروبًا جديدًا.
                              </p>
                            ) : null}
                          </label>
                        ) : (
                          <div className="space-y-3">
                            <label className="block">
                              <span className="text-sm font-semibold">اسم الجروب</span>
                              <input
                                value={form.circleName}
                                onChange={(event) => updateForm(item._id, { circleName: event.target.value })}
                                className="mt-2 w-full border rounded-xl px-3 py-3"
                                maxLength={120}
                              />
                            </label>

                            <div className="grid sm:grid-cols-3 gap-2">
                              <label className="block">
                                <span className="text-xs font-semibold">اليوم الأول</span>
                                <select
                                  value={form.day}
                                  onChange={(event) => updateForm(item._id, { day: event.target.value })}
                                  className="mt-1 w-full border rounded-lg px-2 py-2"
                                >
                                  <option value="">لاحقًا</option>
                                  {DAY_OPTIONS.map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                              </label>
                              <label className="block">
                                <span className="text-xs font-semibold">من</span>
                                <input
                                  type="time"
                                  value={form.startTime}
                                  onChange={(event) => updateForm(item._id, { startTime: event.target.value })}
                                  className="mt-1 w-full border rounded-lg px-2 py-2"
                                />
                              </label>
                              <label className="block">
                                <span className="text-xs font-semibold">إلى</span>
                                <input
                                  type="time"
                                  value={form.endTime}
                                  onChange={(event) => updateForm(item._id, { endTime: event.target.value })}
                                  className="mt-1 w-full border rounded-lg px-2 py-2"
                                />
                              </label>
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <CalendarClock size={14} />
                              يمكنك إنشاء الجروب الآن وترك الموعد فارغًا لحين تنسيق الجدول.
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={working === item._id}
                          onClick={() => place(item)}
                          className="wn-btn wn-btn--primary wn-btn--block mt-5"
                        >
                          <CheckCircle2 size={17} />
                          {working === item._id ? 'جاري التسكين...' : 'تأكيد التسكين'}
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border p-5 bg-slate-50 flex items-center justify-center text-center">
                        <div>
                          <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-3" />
                          <strong>{statusLabel(item.status)}</strong>
                          <p className="text-xs text-slate-500 mt-2">
                            لا يوجد إجراء تسكين مطلوب لهذه الحالة.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
