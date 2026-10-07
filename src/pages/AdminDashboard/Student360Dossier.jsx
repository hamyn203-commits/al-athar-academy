import {
  X, UserRound, Users, Calendar, BookOpen, CreditCard, Bell, GraduationCap,
  PlayCircle, CheckCircle2, AlertTriangle, History, MessageSquare, TrendingUp,
} from 'lucide-react';

function titleValue(value) {
  if (!value) return '—';
  if (typeof value === 'string') return value;
  return value.ar || value.en || '—';
}

function Info({ label, value }) {
  return (
    <div className="wn-admin-360__info">
      <span>{label}</span>
      <strong>{value === undefined || value === null || value === '' ? '—' : String(value)}</strong>
    </div>
  );
}

export default function Student360Dossier({
  dossier,
  loading,
  onClose,
  onOpenGuardian,
  onOpenTeacher,
  onOpenHomeworkAudio,
}) {
  const student = dossier?.student;
  const summary = dossier?.summary || {};

  return (
    <div className="wn-admin-dossier-backdrop" dir="rtl" role="dialog" aria-modal="true">
      <div className="wn-admin-dossier wn-admin-people-dossier">
        <header className="wn-admin-dossier__header">
          <div>
            <span>Student 360</span>
            <h2>{student?.name || 'ملف الطالب'}</h2>
            <p>{student?.email || '—'} · {student?.phone || '—'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
        </header>

        {loading ? (
          <div className="wn-admin-dossier__loading">جاري تجميع الملف الكامل للطالب...</div>
        ) : (
          <div className="wn-admin-dossier__body">
            <section className="wn-admin-360-summary">
              <div><Calendar size={18} /><span><strong>{summary.totalSessions || 0}</strong><small>إجمالي الحصص</small></span></div>
              <div><CheckCircle2 size={18} /><span><strong>{summary.completedSessions || 0}</strong><small>مكتملة</small></span></div>
              <div><BookOpen size={18} /><span><strong>{summary.pendingHomework || 0}</strong><small>واجبات معلقة</small></span></div>
              <div className={summary.absentSessions ? 'is-alert' : ''}><AlertTriangle size={18} /><span><strong>{summary.absentSessions || 0}</strong><small>غياب</small></span></div>
              <div><Users size={18} /><span><strong>{summary.guardians || 0}</strong><small>أولياء أمور</small></span></div>
              <div><GraduationCap size={18} /><span><strong>{summary.activeEnrollments || 0}</strong><small>دورات نشطة</small></span></div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><UserRound size={18} /><h3>الحساب والملف الشخصي</h3></div>
              <div className="wn-admin-dossier__grid">
                <Info label="الاسم" value={student?.name} />
                <Info label="البريد" value={student?.email} />
                <Info label="الهاتف" value={student?.phone} />
                <Info label="WhatsApp" value={student?.whatsappPhone} />
                <Info label="العمر" value={student?.age} />
                <Info label="النوع" value={student?.gender} />
                <Info label="المستوى" value={student?.currentLevel} />
                <Info label="المسار" value={student?.preferredTrack} />
                <Info label="الحلقة" value={student?.circle?.name} />
                <Info label="الحساب" value={student?.isActive === false ? 'موقوف' : 'نشط'} />
                <Info label="البريد مؤكد" value={student?.emailVerified ? 'نعم' : 'لا'} />
                <Info label="آخر دخول" value={student?.lastLogin ? new Date(student.lastLogin).toLocaleString('ar-EG') : '—'} />
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><Users size={18} /><h3>أولياء الأمور والربط العائلي</h3></div>
              {(dossier.guardians || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا يوجد ولي أمر مرتبط حاليًا.</p>
              ) : (
                <div className="wn-admin-360-list">
                  {(dossier.guardians || []).map((guardian) => (
                    <button type="button" key={guardian.guardianProfileId} onClick={() => onOpenGuardian?.(guardian.user?._id)}>
                      <span><strong>{guardian.user?.name || 'ولي أمر'}</strong><small>{guardian.relationship} · {guardian.user?.email || '—'} · {guardian.user?.phone || '—'}</small></span>
                      <span>فتح Family 360</span>
                    </button>
                  ))}
                </div>
              )}

              {(dossier.guardianInvitations || []).length > 0 && (
                <div className="wn-admin-360-subsection">
                  <strong>طلبات الربط</strong>
                  {(dossier.guardianInvitations || []).map((invitation) => (
                    <div key={invitation._id}>
                      <span>{invitation.relationship} · {invitation.phoneMasked || '—'}</span>
                      <b>{invitation.status}</b>
                      <small>{new Date(invitation.createdAt).toLocaleString('ar-EG')}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><Calendar size={18} /><h3>الحصص والتقارير</h3></div>
              {(dossier.sessions || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا توجد حصص مسجلة.</p>
              ) : (
                <div className="wn-admin-session-timeline">
                  {(dossier.sessions || []).slice(0, 40).map((session) => (
                    <article key={session._id}>
                      <div>
                        <span>{new Date(session.scheduledAt).toLocaleString('ar-EG')}</span>
                        <h4>{session.teacher?.name || 'معلم'} · {session.type}</h4>
                        <small>{session.status} · حضور: {session.attendanceStatus || '—'} · {session.duration || 0} دقيقة</small>
                      </div>
                      <div className="wn-admin-session-timeline__actions">
                        {session.teacher?.id ? (
                          <button type="button" onClick={() => onOpenTeacher?.(session.teacher.id)}>ملف المعلم</button>
                        ) : null}
                        {session.recordingAvailable ? <span>يوجد تسجيل</span> : null}
                      </div>
                      {session.report ? (
                        <div className="wn-admin-session-report">
                          <span>الحفظ <b>{session.report.memorizationScore ?? '—'}/10</b></span>
                          <span>التجويد <b>{session.report.tajweedScore ?? '—'}/10</b></span>
                          <p>{session.report.surahRecited ? 'تم التسميع: ' + session.report.surahRecited : ''}</p>
                          <p>{session.report.nextHomework ? 'التالي: ' + session.report.nextHomework : ''}</p>
                          {session.report.notes ? <p>ملاحظات: {session.report.notes}</p> : null}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><BookOpen size={18} /><h3>الواجبات والتسليمات</h3></div>
              {(dossier.homework || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا توجد واجبات.</p>
              ) : (
                <div className="wn-admin-homework-list">
                  {(dossier.homework || []).map((task) => (
                    <article key={task._id}>
                      <div>
                        <span>{task.status}</span>
                        <h4>{task.title}</h4>
                        <small>{task.teacher?.name || 'معلم'} · {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : 'بدون موعد'}</small>
                        {task.description ? <p>{task.description}</p> : null}
                        {task.teacherFeedback ? <p><strong>ملاحظة المعلم:</strong> {task.teacherFeedback}</p> : null}
                      </div>
                      {task.submissionAvailable ? (
                        <button type="button" onClick={() => onOpenHomeworkAudio?.(task._id)}>
                          <PlayCircle size={16} /> فتح تسليم الطالب
                        </button>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><TrendingUp size={18} /><h3>التقدم والدورات</h3></div>
              <div className="wn-admin-360-columns">
                <div>
                  <strong>الدورات</strong>
                  {(dossier.enrollments || []).length === 0 ? <small>لا توجد دورات.</small> : (dossier.enrollments || []).map((entry) => (
                    <div key={entry._id}><span>{titleValue(entry.course?.title)}</span><b>{entry.status}</b><small>{entry.progress?.percentage || 0}%</small></div>
                  ))}
                </div>
                <div>
                  <strong>مؤشرات التعلم</strong>
                  {(dossier.progress || []).length === 0 ? <small>لا توجد بيانات تقدم.</small> : (dossier.progress || []).map((entry) => (
                    <div key={entry._id}><span>{titleValue(entry.course?.title)}</span><b>{Math.round(entry.overallProgress?.percentage || 0)}%</b><small>متوسط {Math.round(entry.overallProgress?.averageScore || 0)}</small></div>
                  ))}
                </div>
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><CreditCard size={18} /><h3>المدفوعات</h3></div>
              {(dossier.payments || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا توجد عمليات دفع.</p>
              ) : (
                <div className="wn-admin-360-table">
                  {(dossier.payments || []).map((payment) => (
                    <div key={payment._id}>
                      <span><strong>{titleValue(payment.course?.title)}</strong><small>{payment.provider}</small></span>
                      <span><strong>{payment.amountMinor} {payment.currency}</strong><small>{payment.status}</small></span>
                      <small>{new Date(payment.createdAt).toLocaleString('ar-EG')}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><MessageSquare size={18} /><h3>رسائل المعلمين للطالب</h3></div>
              {(dossier.teacherUpdates || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا توجد رسائل فيديو من المعلمين.</p>
              ) : (
                <div className="wn-admin-360-feed">
                  {(dossier.teacherUpdates || []).map((update) => (
                    <article key={update._id}>
                      <span>{update.teacher?.personalInfo?.fullName || 'معلم'}</span>
                      <h4>{update.title}</h4>
                      <p>{update.message}</p>
                      <small>{update.videoCount || 0} فيديو · {new Date(update.publishedAt || update.createdAt).toLocaleString('ar-EG')}</small>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><Bell size={18} /><h3>آخر التنبيهات</h3></div>
              <div className="wn-admin-360-feed">
                {(dossier.notifications || []).slice(0, 30).map((notice) => (
                  <article key={notice._id}>
                    <span>{notice.type}</span>
                    <h4>{notice.title?.ar || notice.title?.en || 'تنبيه'}</h4>
                    <p>{notice.message?.ar || notice.message?.en || ''}</p>
                    <small>{notice.isRead ? 'تمت القراءة' : 'غير مقروء'} · {new Date(notice.createdAt).toLocaleString('ar-EG')}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><History size={18} /><h3>سجل تدخلات الإدارة</h3></div>
              {(dossier.audit || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا توجد تدخلات إدارية مسجلة.</p>
              ) : (
                <div className="wn-admin-audit-list">
                  {(dossier.audit || []).map((entry) => (
                    <div key={entry._id}>
                      <span><strong>{entry.actor?.name || 'الإدارة'}</strong><small>{new Date(entry.createdAt).toLocaleString('ar-EG')}</small></span>
                      <span><strong>{entry.action}</strong><small>{entry.reason || '—'}</small></span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
