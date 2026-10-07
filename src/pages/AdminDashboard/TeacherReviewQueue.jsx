import { Eye, RefreshCw, ShieldCheck } from 'lucide-react';

export default function TeacherReviewQueue({
  teachers = [],
  loading = false,
  onRefresh,
  onOpenDossier,
  compact = false,
}) {
  return (
    <section className="wn-dashboard-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold">طلبات المعلمين قيد المراجعة ({teachers.length})</h3>
          <p className="text-xs text-slate-500 mt-1">
            كل قرار اعتماد أو رفض يتم من ملف Teacher 360 بعد مراجعة البيانات والوسائط والمستندات.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          تحديث الطلبات
        </button>
      </div>

      {teachers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-700">لا توجد طلبات معلمين معلقة حاليًا</p>
          <p className="text-xs text-slate-500 mt-1">أي طلب Pending أو Under Review سيظهر هنا تلقائيًا.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <article key={teacher._id} className="border rounded-xl p-4 bg-white">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold">
                      {teacher.user?.name || teacher.personalInfo?.fullName || 'معلم'}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                      {teacher.status === 'under-review' ? 'يحتاج استكمال' : 'قيد المراجعة'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {[teacher.personalInfo?.country, teacher.personalInfo?.city]
                      .filter(Boolean)
                      .join(' — ') || 'بيانات الموقع غير مكتملة'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {teacher.user?.email || 'لا يوجد بريد'}
                  </p>
                  {teacher.createdAt ? (
                    <p className="text-[11px] text-slate-400 mt-1">
                      تاريخ التقديم: {new Date(teacher.createdAt).toLocaleString('ar-EG')}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDossier(teacher._id)}
                  className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-sm flex items-center gap-1"
                >
                  <ShieldCheck size={16} />
                  فتح ملف المراجعة الكامل
                </button>
              </div>

              {!compact ? (
                <div className="mt-4 border-t pt-3 flex items-start gap-2 text-xs text-slate-500">
                  <Eye size={14} className="mt-0.5 shrink-0" />
                  <p>
                    الصور والفيديوهات والهوية والشهادات وقائمة الاعتماد موجودة داخل الملف الكامل.
                    لا يمكن اعتماد المعلم مباشرة من قائمة الطلبات.
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
