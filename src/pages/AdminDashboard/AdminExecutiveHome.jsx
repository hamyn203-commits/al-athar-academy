import {
  Activity, AlertTriangle, ArrowLeft, BookOpen, Calendar, CheckCircle2,
  CreditCard, DollarSign, GraduationCap, History, MonitorPlay, ServerCog,
  ShieldCheck, Sparkles, Users, WalletCards,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import LaunchReadinessPanel from './LaunchReadinessPanel';
import TeacherReviewQueue from './TeacherReviewQueue';

const ACTION_META = {
  'teacher-review': { icon: GraduationCap, tone: 'danger' },
  'manual-payments': { icon: CreditCard, tone: 'danger' },
  payouts: { icon: WalletCards, tone: 'warning' },
  messages: { icon: Activity, tone: 'warning' },
  'guardian-links': { icon: Users, tone: 'info' },
  'overdue-sessions': { icon: Calendar, tone: 'danger' },
  'missing-session-reports': { icon: BookOpen, tone: 'warning' },
};

const CHART_COLORS = ['#d3a33c', '#0c2749', '#2563eb', '#16a56f', '#7c3aed', '#e87928', '#d64545'];

function compactNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('ar-EG', { notation: number >= 10000 ? 'compact' : 'standard' }).format(number);
}

function currency(value) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function OverviewMetric({ icon: Icon, label, value, note, tone = 'navy', badge }) {
  return (
    <article className={`wn-admin-exec-metric is-${tone}`}>
      <div className="wn-admin-exec-metric__top">
        <span className="wn-admin-exec-metric__icon"><Icon size={20} /></span>
        {badge ? <span className="wn-admin-exec-metric__badge">{badge}</span> : null}
      </div>
      <div className="wn-admin-exec-metric__body">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <i aria-hidden="true" />
    </article>
  );
}

function EmptyState({ children }) {
  return <div className="wn-admin-exec-empty"><CheckCircle2 size={19} /><span>{children}</span></div>;
}

export default function AdminExecutiveHome({
  stats,
  commandCenter,
  health,
  pendingTeachers,
  loading,
  onRefreshTeachers,
  onOpenTeacher,
  onNavigate,
  onSelectTab,
}) {
  const actions = commandCenter?.actions || [];
  const priorityActions = actions
    .filter((item) => Number(item.count || 0) > 0)
    .sort((a, b) => {
      const priority = { high: 3, medium: 2, info: 1, ok: 0 };
      return (priority[b.severity] || 0) - (priority[a.severity] || 0) || Number(b.count || 0) - Number(a.count || 0);
    });

  const chartData = actions.map((item) => ({
    name: item.label.length > 24 ? item.label.slice(0, 24) + '…' : item.label,
    count: Number(item.count || 0),
    id: item.id,
  }));

  const features = Object.entries(health?.features || {});
  const healthyFeatures = features.filter(([, enabled]) => Boolean(enabled)).length;
  const healthPercent = features.length ? Math.round((healthyFeatures / features.length) * 100) : 0;
  const critical = Number(commandCenter?.summary?.criticalActions || 0);
  const totalPending = Number(commandCenter?.summary?.totalPendingActions || 0);

  const handleAction = (item) => {
    if (item.actionUrl === '/admin/payments') {
      onNavigate?.('payments');
      return;
    }
    const match = item.actionUrl?.match(/tab=([^&]+)/);
    if (match?.[1]) onSelectTab?.(match[1]);
  };

  return (
    <div className="wn-admin-exec-home">
      <section className="wn-admin-exec-hero">
        <div className="wn-admin-exec-hero__copy">
          <span><Sparkles size={14} /> EXECUTIVE OVERVIEW</span>
          <h2>صورة الأكاديمية الآن، بدون تشتيت</h2>
          <p>الأرقام الحية، الأولويات التشغيلية، صحة النظام، وأهم ما يحتاج قرارًا من الإدارة.</p>
        </div>
        <div className={`wn-admin-exec-hero__status ${critical ? 'is-alert' : 'is-clear'}`}>
          <span>{critical ? <AlertTriangle size={21} /> : <ShieldCheck size={21} />}</span>
          <div>
            <strong>{critical ? `${critical} حالة حرجة` : 'الوضع التشغيلي مستقر'}</strong>
            <small>{totalPending ? `${totalPending} إجراء إجمالي يحتاج متابعة` : 'لا توجد إجراءات معلقة حاليًا'}</small>
          </div>
        </div>
      </section>

      <section className="wn-admin-exec-metrics">
        <OverviewMetric
          icon={Users}
          label="إجمالي الطلاب"
          value={compactNumber(stats?.totalStudents)}
          note="كل الحسابات المسجلة كطلاب"
          tone="blue"
          badge="LIVE"
        />
        <OverviewMetric
          icon={GraduationCap}
          label="المعلمون المعتمدون"
          value={compactNumber(stats?.totalTeachers)}
          note="معلمون اجتازوا Approval Gate"
          tone="gold"
        />
        <OverviewMetric
          icon={Calendar}
          label="الحصص المكتملة"
          value={compactNumber(stats?.totalSessions)}
          note={`${compactNumber(stats?.totalHours)} ساعة تعليمية تقريبًا`}
          tone="green"
        />
        <OverviewMetric
          icon={DollarSign}
          label="إيرادات الحصص"
          value={currency(stats?.totalEarnings)}
          note="من الحصص المكتملة المسجلة"
          tone="purple"
        />
        <OverviewMetric
          icon={AlertTriangle}
          label="تدخل الإدارة"
          value={compactNumber(totalPending)}
          note={critical ? `${critical} منها عالية الأولوية` : 'لا توجد حالات حرجة'}
          tone={critical ? 'red' : 'navy'}
        />
      </section>

      <section className="wn-admin-exec-grid">
        <article className="wn-admin-exec-panel wn-admin-exec-panel--chart">
          <header className="wn-admin-exec-panel__head">
            <div>
              <span>OPERATIONS PULSE</span>
              <h3>ضغط العمل التشغيلي</h3>
              <p>عدد الحالات المفتوحة حاليًا حسب نوع التدخل.</p>
            </div>
            <span className="wn-admin-exec-live"><i /> LIVE</span>
          </header>

          {chartData.some((item) => item.count > 0) ? (
            <div className="wn-admin-exec-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 6, right: 12, left: 12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(12,39,73,.07)" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7b8495' }} />
                  <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(211,163,60,.06)' }}
                    contentStyle={{ background: '#071a33', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[7, 7, 7, 7]} barSize={15}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.id} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState>لا توجد حالات تشغيلية مفتوحة حاليًا.</EmptyState>
          )}
        </article>

        <article className="wn-admin-exec-panel wn-admin-exec-panel--priority">
          <header className="wn-admin-exec-panel__head">
            <div>
              <span>ACTION CENTER</span>
              <h3>الأولوية الآن</h3>
              <p>ابدأ بالأعلى تأثيرًا على التشغيل.</p>
            </div>
            <strong className="wn-admin-exec-count">{totalPending}</strong>
          </header>

          <div className="wn-admin-exec-priority-list">
            {priorityActions.length ? priorityActions.slice(0, 5).map((item) => {
              const meta = ACTION_META[item.id] || { icon: Activity, tone: 'info' };
              const Icon = meta.icon;
              return (
                <button type="button" key={item.id} className={`is-${meta.tone}`} onClick={() => handleAction(item)}>
                  <span className="wn-admin-exec-priority-list__icon"><Icon size={17} /></span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.severity === 'high' ? 'أولوية عالية' : item.severity === 'medium' ? 'تحتاج متابعة' : 'للمراجعة'}</small>
                  </span>
                  <b>{item.count}</b>
                  <ArrowLeft size={15} />
                </button>
              );
            }) : <EmptyState>كل قوائم التدخل الإداري فارغة.</EmptyState>}
          </div>
        </article>
      </section>

      <section className="wn-admin-exec-grid wn-admin-exec-grid--secondary">
        <article className="wn-admin-exec-panel wn-admin-exec-system">
          <header className="wn-admin-exec-panel__head">
            <div>
              <span>SYSTEM HEALTH</span>
              <h3>جاهزية الخدمات</h3>
              <p>صورة مختصرة للخدمات التي يعتمد عليها التشغيل.</p>
            </div>
            <span className={`wn-admin-exec-health-score ${healthPercent === 100 ? 'is-good' : 'is-warning'}`}>
              {healthPercent}%
            </span>
          </header>

          <div className="wn-admin-exec-system__body">
            <div className="wn-admin-exec-system__ring" style={{ '--health': `${healthPercent * 3.6}deg` }}>
              <div><ServerCog size={20} /><strong>{healthyFeatures}/{features.length || 0}</strong><small>خدمة فعالة</small></div>
            </div>
            <div className="wn-admin-exec-system__features">
              {features.length ? features.map(([key, enabled]) => (
                <span key={key} className={enabled ? 'is-on' : 'is-off'}>
                  <i /> {key}
                </span>
              )) : <small>بيانات Health غير متاحة حاليًا.</small>}
            </div>
          </div>
        </article>

        <article className="wn-admin-exec-panel wn-admin-exec-activity">
          <header className="wn-admin-exec-panel__head">
            <div>
              <span>RECENT ADMIN ACTIVITY</span>
              <h3>آخر نشاط إداري</h3>
              <p>أحدث الأحداث المسجلة في الـAudit Trail.</p>
            </div>
            <History size={19} />
          </header>

          <div className="wn-admin-exec-activity__list">
            {(commandCenter?.recentAudit || []).length ? (commandCenter.recentAudit || []).slice(0, 6).map((entry) => (
              <div key={entry._id}>
                <span className="wn-admin-exec-activity__dot" />
                <span>
                  <strong>{entry.actor?.name || 'الإدارة'}</strong>
                  <small>{entry.action}</small>
                </span>
                <time>{new Date(entry.createdAt).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
              </div>
            )) : <EmptyState>لا توجد أحداث إدارية حديثة.</EmptyState>}
          </div>
        </article>
      </section>

      <section className="wn-admin-exec-shortcut">
        <div>
          <span><CreditCard size={18} /></span>
          <div>
            <strong>مراجعة مدفوعات الطلاب</strong>
            <small>راجع إثباتات التحويل ثم فعّل الاشتراك بعد التحقق من وصول المبلغ.</small>
          </div>
        </div>
        <button type="button" onClick={() => onNavigate?.('payments')}>فتح مركز المدفوعات <ArrowLeft size={15} /></button>
      </section>

      <section className="wn-admin-exec-review">
        <div className="wn-admin-exec-section-title">
          <div>
            <span>TEACHER APPROVALS</span>
            <h3>المعلمون الذين يحتاجون مراجعة</h3>
            <p>الاعتماد النهائي يظل مقفولًا حتى اكتمال Teacher 360 Review Gate.</p>
          </div>
          <button type="button" onClick={() => onSelectTab?.('teachers')}>كل المعلمين <ArrowLeft size={15} /></button>
        </div>

        <TeacherReviewQueue
          teachers={pendingTeachers}
          loading={loading}
          onRefresh={onRefreshTeachers}
          onOpenDossier={onOpenTeacher}
          compact
        />
      </section>

      <section className="wn-admin-exec-launch">
        <LaunchReadinessPanel />
      </section>
    </div>
  );
}
