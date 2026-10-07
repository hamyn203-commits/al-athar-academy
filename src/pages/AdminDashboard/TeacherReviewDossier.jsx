import { useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, Circle, FileText, GraduationCap, Headphones,
  IdCard, ShieldCheck, UserRound, Video, X, XCircle, Clock3, History,
} from 'lucide-react';

const MEDIA_ITEMS = [
  { key: 'profilePhoto', label: 'الصورة الشخصية', icon: UserRound },
  { key: 'introductionVideo', label: 'فيديو التعريف', icon: Video },
  { key: 'recitationVideo', label: 'فيديو التلاوة', icon: Video },
  { key: 'teachingMethodVideo', label: 'فيديو طريقة التدريس', icon: Video },
];

function Value({ label, value }) {
  return (
    <div className="wn-admin-dossier__value">
      <span>{label}</span>
      <strong>{value === undefined || value === null || value === '' ? '—' : String(value)}</strong>
    </div>
  );
}

export default function TeacherReviewDossier({
  dossier,
  loading,
  onClose,
  onChecklist,
  onReview,
  onOpenDocument,
  onOpenMedia,
}) {
  const teacher = dossier?.teacher;
  const gate = dossier?.gate;

  const specializations = useMemo(
    () => (teacher?.quranInfo?.specializations || []).join('، '),
    [teacher?.quranInfo?.specializations]
  );

  if (!teacher && !loading) return null;

  const requestChanges = (item) => {
    const note = window.prompt(`اكتب المطلوب تعديله في: ${item.label}`, item.note || '') ?? '';
    if (!note.trim()) return;
    onChecklist(teacher._id, item.key, 'changes-requested', note.trim());
  };

  const finalDecision = (action) => {
    if (action === 'approve') {
      if (!gate?.approvalReady) return;
      onReview(teacher._id, 'approve', 'تم اعتماد الملف بعد اكتمال قائمة المراجعة.');
      return;
    }

    const label = action === 'reject' ? 'سبب رفض الطلب' : 'المطلوب من المعلم استكماله';
    const note = window.prompt(label, '') ?? '';
    if (!note.trim()) return;
    onReview(teacher._id, action, note.trim());
  };

  return (
    <div className="wn-admin-dossier-backdrop" dir="rtl" role="dialog" aria-modal="true">
      <div className="wn-admin-dossier">
        <header className="wn-admin-dossier__header">
          <div>
            <span>Teacher 360 Review Dossier</span>
            <h2>{teacher?.personalInfo?.fullName || teacher?.user?.name || 'ملف المعلم'}</h2>
            <p>{teacher?.user?.email || '—'} · {teacher?.personalInfo?.phone || '—'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
        </header>

        {loading ? (
          <div className="wn-admin-dossier__loading">جاري تحميل ملف المعلم الكامل...</div>
        ) : (
          <div className="wn-admin-dossier__body">
            <section className="wn-admin-review-gate">
              <div className="wn-admin-review-gate__summary">
                <div>
                  <span>جاهزية الاعتماد</span>
                  <strong>{gate?.readiness || 0}%</strong>
                  <small>{gate?.completedRequired || 0} من {gate?.requiredCount || 0} بند إلزامي</small>
                </div>
                <div className="wn-admin-review-gate__bar">
                  <i style={{ width: `${gate?.readiness || 0}%` }} />
                </div>
                <div className={`wn-admin-review-gate__state ${gate?.approvalReady ? 'is-ready' : 'is-blocked'}`}>
                  {gate?.approvalReady ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{gate?.approvalReady ? 'الملف جاهز لقرار الاعتماد' : 'زر الاعتماد مقفول حتى اكتمال المراجعة'}</span>
                </div>
              </div>

              <div className="wn-admin-review-checklist">
                {(gate?.items || []).map((item) => (
                  <article key={item.key} className={`is-${item.status} ${!item.available ? 'is-missing' : ''}`}>
                    <div className="wn-admin-review-checklist__label">
                      {item.status === 'approved'
                        ? <CheckCircle2 size={17} />
                        : item.status === 'changes-requested'
                          ? <XCircle size={17} />
                          : <Circle size={17} />}
                      <div>
                        <strong>{item.label}</strong>
                        <small>
                          {item.requiredForTeacher ? 'إلزامي' : 'اختياري'}
                          {!item.available ? ' · الملف/البيان غير متاح' : ''}
                        </small>
                        {item.note ? <p>{item.note}</p> : null}
                      </div>
                    </div>
                    <div className="wn-admin-review-checklist__actions">
                      <button
                        type="button"
                        disabled={!item.available}
                        onClick={() => onChecklist(teacher._id, item.key, 'approved', '')}
                        className="is-approve"
                      >
                        اعتماد البند
                      </button>
                      <button type="button" onClick={() => requestChanges(item)} className="is-change">
                        يحتاج تعديل
                      </button>
                      {item.canMarkNotApplicable ? (
                        <button
                          type="button"
                          onClick={() => onChecklist(teacher._id, item.key, 'not-applicable', '')}
                        >
                          غير منطبق
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><UserRound size={18} /><h3>البيانات الشخصية</h3></div>
              <div className="wn-admin-dossier__grid">
                <Value label="الاسم" value={teacher.personalInfo?.fullName} />
                <Value label="العمر" value={teacher.personalInfo?.age} />
                <Value label="النوع" value={teacher.personalInfo?.gender} />
                <Value label="الدولة" value={teacher.personalInfo?.country} />
                <Value label="المدينة" value={teacher.personalInfo?.city} />
                <Value label="العنوان" value={teacher.personalInfo?.address} />
                <Value label="الهاتف" value={teacher.personalInfo?.phone} />
                <Value label="WhatsApp" value={teacher.personalInfo?.whatsapp} />
                <Value label="Telegram" value={teacher.personalInfo?.telegram} />
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><GraduationCap size={18} /><h3>الدراسة والخبرة</h3></div>
              <div className="wn-admin-dossier__grid">
                <Value label="الجامعة" value={teacher.academicInfo?.university} />
                <Value label="الكلية" value={teacher.academicInfo?.faculty} />
                <Value label="سنة التخرج" value={teacher.academicInfo?.graduationYear} />
                <Value label="التخصص" value={teacher.academicInfo?.specialization} />
                <Value label="المؤهل" value={teacher.academicInfo?.qualification} />
                <Value label="سنوات التدريس" value={teacher.quranInfo?.teachingExperience} />
                <Value label="الأجزاء المحفوظة" value={teacher.quranInfo?.memorizedParts} />
                <Value label="عدد الإجازات" value={teacher.quranInfo?.numberOfIjazat} />
                <Value label="نوع الإجازة" value={teacher.quranInfo?.ijazaType} />
                <Value label="اسم الشيخ" value={teacher.quranInfo?.sheikhName} />
                <Value label="السند" value={teacher.quranInfo?.sanad} />
                <Value label="التخصصات" value={specializations} />
                <Value label="اللغات" value={(teacher.languages || []).join('، ')} />
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><Video size={18} /><h3>الصور والفيديوهات والتسجيلات</h3></div>
              <div className="wn-admin-dossier__asset-grid">
                {MEDIA_ITEMS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={!teacher.media?.[key]}
                    onClick={() => onOpenMedia(teacher._id, key)}
                  >
                    <Icon size={18} />
                    <span><strong>{label}</strong><small>{teacher.media?.[key] ? 'فتح للمراجعة' : 'غير متاح'}</small></span>
                  </button>
                ))}
                {Array.from({ length: teacher.media?.additionalVideosCount || 0 }).map((_, index) => (
                  <button key={`video-${index}`} type="button" onClick={() => onOpenMedia(teacher._id, 'additionalVideos', index)}>
                    <Video size={18} />
                    <span><strong>فيديو إضافي {index + 1}</strong><small>فتح للمراجعة</small></span>
                  </button>
                ))}
                {Array.from({ length: teacher.media?.audioRecordingsCount || 0 }).map((_, index) => (
                  <button key={`audio-${index}`} type="button" onClick={() => onOpenMedia(teacher._id, 'audioRecordings', index)}>
                    <Headphones size={18} />
                    <span><strong>تسجيل صوتي {index + 1}</strong><small>فتح للمراجعة</small></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><IdCard size={18} /><h3>المستندات الحساسة</h3></div>
              <p className="wn-admin-dossier__privacy">
                <ShieldCheck size={15} />
                كل فتح لمستند أو ملف حساس يتم تسجيله في سجل الإدارة.
              </p>
              <div className="wn-admin-dossier__asset-grid">
                <button type="button" disabled={!teacher.documents?.idCardFront} onClick={() => onOpenDocument(teacher._id, 'idCardFront')}>
                  <IdCard size={18} /><span><strong>وجه البطاقة</strong><small>{teacher.documents?.idCardFront ? 'فتح' : 'غير متاح'}</small></span>
                </button>
                <button type="button" disabled={!teacher.documents?.idCardBack} onClick={() => onOpenDocument(teacher._id, 'idCardBack')}>
                  <IdCard size={18} /><span><strong>ظهر البطاقة</strong><small>{teacher.documents?.idCardBack ? 'فتح' : 'غير متاح'}</small></span>
                </button>
                <button type="button" disabled={!teacher.documents?.graduationCertificate} onClick={() => onOpenDocument(teacher._id, 'graduationCertificate')}>
                  <FileText size={18} /><span><strong>شهادة التخرج</strong><small>{teacher.documents?.graduationCertificate ? 'فتح' : 'غير متاح'}</small></span>
                </button>
                {Array.from({ length: teacher.documents?.tajweedCertificatesCount || 0 }).map((_, index) => (
                  <button key={`tajweed-${index}`} type="button" onClick={() => onOpenDocument(teacher._id, 'tajweedCertificates', index)}>
                    <FileText size={18} /><span><strong>شهادة تجويد {index + 1}</strong><small>فتح</small></span>
                  </button>
                ))}
                {Array.from({ length: teacher.documents?.ijazatCount || 0 }).map((_, index) => (
                  <button key={`ijaza-${index}`} type="button" onClick={() => onOpenDocument(teacher._id, 'ijazat', index)}>
                    <FileText size={18} /><span><strong>إجازة {index + 1}</strong><small>فتح</small></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><Clock3 size={18} /><h3>النشاط داخل الأكاديمية</h3></div>
              <div className="wn-admin-dossier__grid">
                <Value label="إجمالي الحصص" value={dossier.activity?.totalSessions || 0} />
                <Value label="حصص مكتملة" value={dossier.activity?.completedSessions || 0} />
                <Value label="حصص مؤكدة" value={dossier.activity?.acceptedSessions || 0} />
                <Value label="طلاب مختلفون" value={dossier.activity?.distinctStudents || 0} />
                <Value label="متوسط التقييم" value={teacher.rating?.average || 0} />
                <Value label="عدد التقييمات" value={teacher.rating?.count || 0} />
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><History size={18} /><h3>تاريخ المراجعة والقرارات</h3></div>
              {(dossier.audit || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا يوجد سجل إداري بعد.</p>
              ) : (
                <div className="wn-admin-audit-list">
                  {(dossier.audit || []).map((entry) => (
                    <div key={entry._id}>
                      <span><strong>{entry.actor?.name || 'الإدارة'}</strong><small>{new Date(entry.createdAt).toLocaleString('ar-EG')}</small></span>
                      <span><strong>{entry.action}</strong>{entry.reason ? <small>{entry.reason}</small> : null}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <footer className="wn-admin-dossier__footer">
              <button type="button" onClick={() => finalDecision('reject')} className="is-reject">رفض الطلب</button>
              <button type="button" onClick={() => finalDecision('request-changes')} className="is-change">طلب استكمال</button>
              <button
                type="button"
                onClick={() => finalDecision('approve')}
                disabled={!gate?.approvalReady}
                className="is-approve"
              >
                <CheckCircle2 size={17} />
                اعتماد المعلم نهائيًا
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
