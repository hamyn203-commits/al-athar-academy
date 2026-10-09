import { useEffect, useState } from 'react';
import { Search, Users, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';

export default function AdminPeopleDirectory({ onOpenStudent, onOpenGuardian }) {
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState({ people: [], total: 0, pages: 1, counts: { student: 0, guardian: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ role, status, page: String(page), limit: '15' });
    if (search) params.set('q', search);
    api.get('/api/admin/people/directory?' + params, { auth: true, signal: controller.signal })
      .then((result) => { if (current) setData(result); })
      .catch((err) => { if (current) setError(err.message || 'تعذر تحميل دليل الطلاب والأسر'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; controller.abort(); };
  }, [role, status, page, search, refresh]);

  const selectRole = (next) => { setRole(next); setPage(1); };
  const selectStatus = (next) => { setStatus(next); setPage(1); };
  const submit = (event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); };
  const open = (person) => person.role === 'student'
    ? onOpenStudent?.(person._id)
    : onOpenGuardian?.(person._id);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 space-y-5" dir="rtl" aria-label="دليل الطلاب والأسر">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">دليل الطلاب والأسر</h2>
          <p className="text-sm text-slate-500 mt-1">عرض الحسابات المسجلة وفتح ملفاتها الإدارية الآمنة</p>
        </div>
        <button type="button" onClick={() => setRefresh((x) => x + 1)} className="rounded-xl border px-3 py-2 flex items-center gap-2 text-sm" aria-label="تحديث القائمة"><RefreshCw size={16} /> تحديث</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => selectRole('student')} className={`rounded-xl border p-4 text-right ${role === 'student' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'}`}>
          <Users size={20} className="text-emerald-700 mb-2" /><strong className="block">الطلاب</strong><span className="text-xl font-bold">{data.counts?.student ?? '—'}</span>
        </button>
        <button type="button" onClick={() => selectRole('guardian')} className={`rounded-xl border p-4 text-right ${role === 'guardian' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'}`}>
          <ShieldCheck size={20} className="text-emerald-700 mb-2" /><strong className="block">أولياء الأمور</strong><span className="text-xl font-bold">{data.counts?.guardian ?? '—'}</span>
        </button>
      </div>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[190px] flex items-center gap-2 border rounded-xl px-3"><Search size={17} className="text-slate-500" /><input className="w-full py-3 outline-none bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="الاسم أو البريد أو رقم الحساب" aria-label="بحث عن طالب أو ولي أمر" /></div>
        <button type="submit" className="rounded-xl bg-emerald-800 text-white px-5">بحث</button>
        <select className="rounded-xl border px-3 py-2 bg-white" value={role} onChange={(e) => selectRole(e.target.value)} aria-label="نوع الحساب">
          <option value="all">الطلاب والأسر</option><option value="student">الطلاب فقط</option><option value="guardian">أولياء الأمور فقط</option>
        </select>
        <select className="rounded-xl border px-3 py-2 bg-white" value={status} onChange={(e) => selectStatus(e.target.value)} aria-label="حالة الحساب">
          <option value="all">كل الحالات</option><option value="active">نشط</option><option value="inactive">غير نشط</option>
        </select>
      </form>
      {error ? <p role="alert" className="rounded-xl bg-red-50 text-red-700 p-4">{error}</p> : null}
      {loading ? <p className="p-6 text-center text-slate-500">جاري تحميل الحسابات...</p> : !error && data.people?.length === 0 ? <p className="p-6 text-center text-slate-500">لا توجد حسابات مطابقة للبحث.</p> : (
        <div className="space-y-2">
          {(data.people || []).map((person) => (
            <button key={person._id} type="button" onClick={() => open(person)} className="w-full text-right flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600">
              <span className="rounded-full bg-slate-100 p-3">{person.role === 'student' ? <Users size={20} /> : <ShieldCheck size={20} />}</span>
              <span className="flex-1 min-w-[160px]"><strong className="block text-slate-900">{person.name || 'بدون اسم'}</strong><small className="text-slate-500">{person.email || 'لا يوجد بريد'} · {person.role === 'student' ? 'طالب' : 'ولي أمر'}</small></span>
              <span className={`text-xs rounded-full px-3 py-1 ${person.isActive === false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{person.isActive === false ? 'غير نشط' : 'نشط'}</span>
              <span className="text-sm text-emerald-800 font-semibold">فتح ملف 360</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center gap-3 text-sm text-slate-500">
        <span>إجمالي النتائج: {data.total ?? 0} · صفحة {page} من {data.pages || 1}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((n) => n - 1)} className="border rounded-lg p-2 disabled:opacity-40" aria-label="الصفحة السابقة"><ChevronRight size={18} /></button>
          <button type="button" disabled={page >= (data.pages || 1) || loading} onClick={() => setPage((n) => n + 1)} className="border rounded-lg p-2 disabled:opacity-40" aria-label="الصفحة التالية"><ChevronLeft size={18} /></button>
        </div>
      </div>
    </section>
  );
}
