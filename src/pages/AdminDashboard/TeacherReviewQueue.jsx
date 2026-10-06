import { CheckCircle, Edit3, Eye, RefreshCw, Video, XCircle } from 'lucide-react';

export default function TeacherReviewQueue({
  teachers = [],
  loading = false,
  onRefresh,
  onReview,
  onOpenDocument,
  onOpenMedia,
  compact = false,
}) {
  return (
    <section className="wn-dashboard-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold">طلبات المعلمين قيد المراجعة ({teachers.length})</h3>
          <p className="text-xs text-slate-500 mt-1">الطلبات الجديدة وطلبات الاستكمال تظهر هنا حتى اتخاذ قرار الإدارة.</p>
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
          <p className="text-xs text-slate-500 mt-1">أي طلب جديد بحالة Pending أو Under Review سيظهر هنا تلقائيًا.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => (
            <article key={t._id} className="border rounded-xl p-4 bg-white">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold">{t.user?.name || t.personalInfo?.fullName || 'معلم'}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                      {t.status === 'under-review' ? 'يحتاج استكمال' : 'قيد المراجعة'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {[t.personalInfo?.country, t.personalInfo?.city].filter(Boolean).join(' — ') || 'بيانات الموقع غير مكتملة'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t.user?.email || 'لا يوجد بريد'}</p>
                  {t.createdAt && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      تاريخ التقديم: {new Date(t.createdAt).toLocaleString('ar-EG')}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onReview(t._id, 'approve')} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1">
                    <CheckCircle size={16} /> قبول
                  </button>
                  <button onClick={() => onReview(t._id, 'request-changes')} className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm flex items-center gap-1">
                    <Edit3 size={16} /> طلب استكمال
                  </button>
                  <button onClick={() => onReview(t._id, 'reject', 'مرفوض')} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-1">
                    <XCircle size={16} /> رفض
                  </button>
                </div>
              </div>

              {!compact && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">ملفات المراجعة</p>
                  <div className="flex flex-wrap gap-2">
                    {t.media?.profilePhoto && (
                      <button onClick={() => onOpenMedia(t.media.profilePhoto)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                        <Eye size={14} /> الصورة الشخصية
                      </button>
                    )}
                    {t.media?.recitationVideo && (
                      <button onClick={() => onOpenMedia(t.media.recitationVideo)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                        <Video size={14} /> فيديو التلاوة
                      </button>
                    )}
                    {t.documents?.idCardFront && t.documents.idCardFront !== 'not-provided' && (
                      <button onClick={() => onOpenDocument(t._id, 'idCardFront')} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                        <Eye size={14} /> وجه البطاقة
                      </button>
                    )}
                    {t.documents?.idCardBack && t.documents.idCardBack !== 'not-provided' && (
                      <button onClick={() => onOpenDocument(t._id, 'idCardBack')} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                        <Eye size={14} /> ظهر البطاقة
                      </button>
                    )}
                    {t.documents?.graduationCertificateAvailable && (
                      <button onClick={() => onOpenDocument(t._id, 'graduationCertificate')} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                        <Eye size={14} /> شهادة التخرج
                      </button>
                    )}
                    {(t.documents?.tajweedCertificates || []).map((_, index) => (
                      <button key={`tajweed-${t._id}-${index}`} onClick={() => onOpenDocument(t._id, 'tajweedCertificates', index)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                        <Eye size={14} /> تجويد {index + 1}
                      </button>
                    ))}
                    {(t.documents?.ijazat || []).map((_, index) => (
                      <button key={`ijaza-${t._id}-${index}`} onClick={() => onOpenDocument(t._id, 'ijazat', index)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                        <Eye size={14} /> إجازة {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
