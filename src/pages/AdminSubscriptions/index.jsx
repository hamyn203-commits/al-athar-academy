import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useToast } from '../../context/ToastProvider';
import api from '../../lib/api';
import SubscriptionCircleCard from './SubscriptionCircleCard';

function planName(item) { return item.pricingSnapshot?.nameAr || item.planKey; }
function teacherName(item) { return item.preferredTeacher?.personalInfo?.fullName || item.preferredTeacher?.user?.name || 'لم يُحدد'; }

export default function AdminSubscriptions() {
  const { user, ready, logout } = useRequireAuth(['admin']);
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('awaiting');
  const [subscriptions, setSubscriptions] = useState([]);
  const [circles, setCircles] = useState([]);
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [placements, groups] = await Promise.all([
        api.get('/api/subscriptions/admin/placements?status=awaiting_placement', { auth: true }),
        api.get('/api/subscriptions/admin/circles', { auth: true }),
      ]);
      setSubscriptions(placements.subscriptions || []);
      setCircles(groups.circles || []);
    } catch (error) { toast.error(error.message || 'تعذر تحميل الاشتراكات والحلقات'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  const formFor = item => forms[item._id] || {
    mode: item.compatibleCircles?.length ? 'existing' : 'new',
    existingCircleId: item.compatibleCircles?.[0]?._id || '',
    circleName: planName(item) + ' — ' + teacherName(item),
  };
  const updateForm = (item, patch) => setForms(current => ({
    ...current, [item._id]: { ...formFor(item), ...patch },
  }));

  const place = async item => {
    if (working) return;
    const form = formFor(item);
    if (form.mode === 'existing' && !form.existingCircleId) return toast.error('اختر جروب موجود أو أنشئ جروب جديد');
    if (form.mode === 'new' && !form.circleName.trim()) return toast.error('اكتب اسم الجروب');
    setWorking(item._id);
    try {
      const result = await api.post('/api/subscriptions/admin/' + encodeURIComponent(item._id) + '/place',
        form.mode === 'existing' ? { existingCircleId: form.existingCircleId } : { circleName: form.circleName.trim() }, { auth: true });
      toast.success(result.subscriptionStatus === 'active'
        ? 'تم انضمام الطالب للحلقة الجارية دون خصم أي حصة.'
        : result.circleStatus === 'ready'
          ? 'تم التسكين واكتمل العدد. افتح الحلقات لتحديد المواعيد والبدء.'
          : 'تم التسكين. متبقي ' + Math.max(0, result.minimumToStart - result.studentCount) + ' طالب قبل البدء.');
      await load();
    } catch (error) { toast.error(error.message || 'فشل التسكين'); }
    finally { setWorking(''); }
  };

  const filteredSubscriptions = useMemo(() => subscriptions.filter(item => [item.student?.name, teacherName(item), planName(item)].join(' ').includes(search)), [subscriptions, search]);
  const filteredCircles = useMemo(() => circles.filter(circle => [circle.name, circle.teacher?.personalInfo?.fullName, circle.teacher?.user?.name, circle.plan?.name?.ar].join(' ').includes(search)), [circles, search]);
  const readyCount = circles.filter(circle => circle.status === 'ready').length;

  if (!ready) return null;
  return (
    <DashboardLayout title="إدارة اشتراكات الطلاب والتسكين" user={user} onLogout={logout}>
      <div className="space-y-5" dir="rtl">
        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" className="wn-btn wn-btn--secondary" onClick={() => navigate('..', { relative: 'path' })}><ArrowRight size={16} /> لوحة الإدارة</button>
          <div className="flex gap-2">
            <button type="button" className="wn-btn wn-btn--secondary" onClick={() => navigate('../payments', { relative: 'path' })}>مراجعة إيصالات الدفع</button>
            <button type="button" className="wn-btn wn-btn--secondary" disabled={loading || Boolean(working)} onClick={load}><RefreshCw size={16} /> تحديث</button>
          </div>
        </div>
        <div className="wn-dashboard-surface">
          <h2 className="font-bold text-xl flex gap-2 items-center"><UsersRound /> تسكين الطلاب وتشغيل الحلقات</h2>
          <p className="mt-2 text-sm text-slate-600">اعتماد الدفع ← التسكين مع المعلم والخطة المختارين ← اكتمال العدد ← تحديد المواعيد وبدء الحلقة ← جدولة الحصص. الخصم بعد إتمام كل حصة وفق الحضور والأعذار.</p>
          <p className="mt-2 text-sm">باقة 10 جنيه: من 15 إلى 20 طالب. رصيد كل طالب مستقل حسب اشتراكه: 4 أو 8 أو 12 أو 24 حصة.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button type="button" aria-pressed={tab === 'awaiting'} className={'wn-btn ' + (tab === 'awaiting' ? 'wn-btn--primary' : 'wn-btn--secondary')} onClick={() => setTab('awaiting')}>بانتظار التسكين ({subscriptions.length})</button>
            <button type="button" aria-pressed={tab === 'circles'} className={'wn-btn ' + (tab === 'circles' ? 'wn-btn--primary' : 'wn-btn--secondary')} onClick={() => setTab('circles')}>الحلقات ({circles.length}) · جاهزة للبدء ({readyCount})</button>
          </div>
        </div>
        <label className="block text-sm">بحث باسم الطالب أو المعلم أو الحلقة<input className="block w-full border rounded-xl p-3 mt-1" value={search} onChange={event => setSearch(event.target.value)} /></label>
        {loading ? <div className="flex justify-center py-12"><div className="spinner spinner-lg" /></div> : tab === 'circles' ? (
          <div className="space-y-4">
            {filteredCircles.length ? filteredCircles.map(circle => <SubscriptionCircleCard key={circle._id} circle={circle} onChanged={load} />) : <p className="wn-dashboard-surface text-center">لا توجد حلقات مطابقة. ابدأ بتسكين طالب مدفوع لإنشاء الحلقة.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {!filteredSubscriptions.length ? <p className="wn-dashboard-surface text-center">لا توجد طلبات مدفوعة بانتظار التسكين. لو الإيصال ما زال قيد المراجعة، اعتمد الدفع أولًا من صفحة المدفوعات.</p> : filteredSubscriptions.map(item => {
              const form = formFor(item);
              return (
                <article key={item._id} className="wn-dashboard-surface grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{item.student?.name || 'طالب'}</h3>
                    <p className="text-sm text-slate-600">{item.student?.email}</p>
                    <p>الخطة: <strong>{planName(item)}</strong> · {(item.pricePerSessionMinor || 0) / 100} جنيه للحصة</p>
                    <p>المعلم المختار: <strong>{teacherName(item)}</strong></p>
                    <p>القسم: {item.section === 'ladies' ? 'قسم السيدات' : 'قسم الرجال والأطفال'} · العمر: {item.student?.age || '—'}</p>
                    <p>الرصيد: <strong>{item.sessionsRemaining}/{item.sessionCount} حصة</strong></p>
                    <span className="inline-block bg-emerald-50 text-emerald-800 rounded-lg p-2 text-sm">مدفوع — بانتظار التسكين</span>
                  </div>
                  <div className="border rounded-xl p-4 space-y-3">
                    <label className="block text-sm">طريقة التسكين<select className="block w-full border rounded-lg p-2 mt-1" value={form.mode} onChange={event => updateForm(item, { mode: event.target.value })}><option value="existing" disabled={!item.compatibleCircles?.length}>جروب موجود ومتوافق</option><option value="new">جروب جديد</option></select></label>
                    {form.mode === 'existing' ? <label className="block text-sm">الحلقة<select className="block w-full border rounded-lg p-2 mt-1" value={form.existingCircleId} onChange={event => updateForm(item, { existingCircleId: event.target.value })}>{item.compatibleCircles?.map(circle => <option key={circle._id} value={circle._id}>{circle.name} · {circle.currentCount}/{circle.capacity} · {['active', 'full'].includes(circle.status) ? 'جارية' : 'قيد التكوين'}</option>)}</select></label> : <label className="block text-sm">اسم الجروب الجديد<input className="block w-full border rounded-lg p-2 mt-1" maxLength={120} value={form.circleName} onChange={event => updateForm(item, { circleName: event.target.value })} /></label>}
                    <p className="text-xs text-slate-600">التوافق حسب المعلم والخطة والقسم والعمر والمستوى والمسار. يمكن جمع باقات بأعداد حصص مختلفة. المواعيد تُحدد بعد اكتمال العدد.</p>
                    <button type="button" disabled={Boolean(working)} className="wn-btn wn-btn--primary wn-btn--block" onClick={() => place(item)}>{working === item._id ? 'جاري التسكين...' : 'تسكين الطالب'}</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="text-xs text-slate-500">تُعرض أحدث 100 حلقة وأقدم 100 طلب تسكين في كل تحديث.</p>
      </div>
    </DashboardLayout>
  );
}

