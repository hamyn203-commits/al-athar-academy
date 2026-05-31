import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEOHead title="الشروط والأحكام" description="شروط استخدام أكاديمية الأثر" />
      <GlobalHeader />
      <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-lg">
        <h1>الشروط والأحكام</h1>
        <p>باستخدامك لمنصة أكاديمية الأثر، فإنك توافق على الشروط التالية:</p>
        <h2>استخدام المنصة</h2>
        <p>المنصة مخصصة للتعليم الشرعي والقرآني. يُمنع أي استخدام مخالف للشريعة أو القانون.</p>
        <h2>حسابات المستخدمين</h2>
        <p>أنت مسؤول عن حفظ بيانات دخولك. يُمنع مشاركة الحساب مع الغير.</p>
        <h2>المعلمون</h2>
        <p>يجب أن يكون المعلم حاصلاً على إجازة أو مؤهل معتمد. تحتفظ الأكاديمية بحق مراجعة وقبول أو رفض الطلبات.</p>
        <h2>المدفوعات والاسترداد</h2>
        <p>سياسة الاسترداد تُطبق خلال 7 أيام من الشراء وفق شروط محددة.</p>
      </div>
      <GlobalFooter />
    </div>
  );
}
