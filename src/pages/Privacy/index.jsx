import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEOHead title="سياسة الخصوصية" description="سياسة الخصوصية — أكاديمية الأثر" />
      <GlobalHeader />
      <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-lg">
        <h1>سياسة الخصوصية</h1>
        <p>نحن في أكاديمية الأثر نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً لأعلى المعايير العالمية (GDPR).</p>
        <h2>البيانات التي نجمعها</h2>
        <ul><li>معلومات التسجيل (الاسم، البريد، الهاتف)</li><li>بيانات التعلم والتقدم</li><li>التسجيلات الصوتية للتلاوة (بموافقتك)</li></ul>
        <h2>كيف نستخدم بياناتك</h2>
        <p>لتقديم خدمات التعليم، تحسين المنصة، وإرسال الإشعارات التعليمية.</p>
        <h2>حقوقك</h2>
        <p>يمكنك طلب حذف بياناتك أو تصديرها في أي وقت عبر التواصل معنا.</p>
      </div>
      <GlobalFooter />
    </div>
  );
}
