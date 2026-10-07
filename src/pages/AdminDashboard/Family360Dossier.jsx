import { X, Users, UserRound, Bell, Calendar, ShieldCheck, History } from 'lucide-react';

function Info({ label, value }) {
  return (
    <div className="wn-admin-360__info">
      <span>{label}</span>
      <strong>{value === undefined || value === null || value === '' ? '—' : String(value)}</strong>
    </div>
  );
}

export default function Family360Dossier({ dossier, loading, onClose, onOpenStudent }) {
  const guardian = dossier?.guardian;
  const summary = dossier?.summary || {};

  return (
    <div className="wn-admin-dossier-backdrop" dir="rtl" role="dialog" aria-modal="true">
      <div className="wn-admin-dossier wn-admin-people-dossier">
        <header className="wn-admin-dossier__header">
          <div>
            <span>Family 360</span>
            <h2>{guardian?.name || 'ملف ولي الأمر'}</h2>
            <p>{guardian?.email || '—'} · {guardian?.phone || '—'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
        </header>

        {loading ? (
          <div className="wn-admin-dossier__loading">جاري تجميع ملف الأسرة...</div>
        ) : (
          <div className="wn-admin-dossier__body">
            <section className="wn-admin-360-summary">
              <div><Users size={18} /><span><strong>{summary.children || 0}</strong><small>أبناء مرتبطون</small></span></div>
              <div><UserRound size={18} /><span><strong>{summary.activeChildren || 0}</strong><small>أبناء نشطون</small></span></div>
              <div><ShieldCheck size={18} /><span><strong>{summary.pendingInvitations || 0}</strong><small>طلبات ربط معلقة</small></span></div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><UserRound size={18} /><h3>حساب ولي الأمر</h3></div>
              <div className="wn-admin-dossier__grid">
                <Info label="الاسم" value={guardian?.name} />
                <Info label="البريد" value={guardian?.email} />
                <Info label="الهاتف" value={guardian?.phone} />
                <Info label="الحساب" value={guardian?.isActive === false ? 'موقوف' : 'نشط'} />
                <Info label="البريد مؤكد" value={guardian?.emailVerified ? 'نعم' : 'لا'} />
                <Info label="آخر دخول" value={guardian?.lastLogin ? new Date(guardian.lastLogin).toLocaleString('ar-EG') : '—'} />
                <Info label="اللغة" value={dossier.profile?.settings?.language || guardian?.preferences?.language} />
                <Info label="المنطقة الزمنية" value={dossier.profile?.settings?.timezone || guardian?.preferences?.timezone} />
              </div>
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><Users size={18} /><h3>الأبناء</h3></div>
              {(dossier.children || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا يوجد أبناء مرتبطون.</p>
              ) : (
                <div className="wn-admin-family-grid">
                  {(dossier.children || []).map((child) => (
                    <button type="button" key={child.student?._id} onClick={() => onOpenStudent?.(child.student?._id)}>
                      <span className="wn-admin-family-avatar">{child.student?.name?.slice(0, 1) || 'ط'}</span>
                      <span>
                        <strong>{child.student?.name || 'طالب'}</strong>
                        <small>{child.relationship} · {child.student?.currentLevel || '—'}</small>
                      </span>
                      <div>
                        <span>{child.summary?.sessions || 0}<small>حصة</small></span>
                        <span>{child.summary?.pendingHomework || 0}<small>واجب</small></span>
                        <span>{child.summary?.submittedHomework || 0}<small>تصحيح</small></span>
                      </div>
                      {child.summary?.nextSession ? (
                        <p><Calendar size={13} /> القادمة: {new Date(child.summary.nextSession.scheduledAt).toLocaleString('ar-EG')}</p>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><ShieldCheck size={18} /><h3>طلبات الربط</h3></div>
              {(dossier.invitations || []).length === 0 ? (
                <p className="wn-admin-dossier__empty">لا توجد طلبات ربط مرتبطة بهذا الحساب.</p>
              ) : (
                <div className="wn-admin-360-table">
                  {(dossier.invitations || []).map((invitation) => (
                    <div key={invitation._id}>
                      <span><strong>{invitation.student?.name || 'طالب'}</strong><small>{invitation.relationship} · {invitation.phoneMasked || '—'}</small></span>
                      <span><strong>{invitation.status}</strong><small>{invitation.source}</small></span>
                      <small>{new Date(invitation.createdAt).toLocaleString('ar-EG')}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="wn-admin-dossier__section">
              <div className="wn-admin-dossier__section-title"><Bell size={18} /><h3>إعدادات المتابعة</h3></div>
              <div className="wn-admin-dossier__grid">
                <Info label="تقارير دورية" value={dossier.profile?.settings?.reportFrequency} />
                <Info label="إشعارات البريد" value={dossier.profile?.notificationPreferences?.email?.enabled ? 'مفعلة' : 'غير مفعلة'} />
                <Info label="Push" value={dossier.profile?.notificationPreferences?.push?.enabled ? 'مفعل' : 'غير مفعل'} />
                <Info label="SMS" value={dossier.profile?.notificationPreferences?.sms?.enabled ? 'مفعل' : 'غير مفعل'} />
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
