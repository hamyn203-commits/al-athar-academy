import { Link } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import TeacherDashboard from './index';

export default function TeacherDashboardGate() {
  const { user, ready, logout } = useRequireAuth(['teacher']);
  const { locale } = useI18n();
  if (!ready) return null;
  if (user.teacherApproved === true) return <TeacherDashboard />;
  const status = user.teacherApprovalStatus || 'pending';
  const hasSubmittedApplication = status !== 'pending' || Boolean(user.onboarding?.teacherApplicationReady);
  return <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center" dir="rtl">
    <section className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h1 className="text-2xl font-bold mb-4">حساب المعلم — وحي ونماء</h1>
      <p className="text-slate-700 mb-4">{hasSubmittedApplication ? 'طلبك قيد متابعة الإدارة. لا يمكنك التدريس أو الظهور للطلاب قبل الاعتماد.' : 'تم إنشاء حسابك. الخطوة التالية هي استكمال ملف التقديم للمعلم.'}</p>
      <p className="text-sm text-slate-500 mb-5">حالة الحساب: {status === 'under-review' ? 'قيد المراجعة' : status === 'rejected' ? 'يحتاج مراجعة' : status === 'suspended' ? 'موقوف' : 'لم يعتمد بعد'}</p>
      <Link className="block text-center bg-emerald-800 text-white py-3 rounded-xl font-bold mb-3" to={localizedPath('/profile/setup', locale)}>استكمال البيانات الأساسية</Link>
      {!hasSubmittedApplication && <Link className="block text-center border border-emerald-800 text-emerald-900 py-3 rounded-xl font-bold mb-4" to={localizedPath('/register/teacher', locale)}>استكمال طلب المعلم ورفع المستندات والفيديوهات</Link>}
      <button className="w-full text-slate-600 underline" onClick={logout}>تسجيل الخروج</button>
    </section>
  </main>;
}
