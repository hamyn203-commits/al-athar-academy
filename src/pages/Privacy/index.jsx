import { ShieldCheck, Sparkles } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import '../../styles/public-experience.css';

export default function Privacy() {
  return (
    <>
      <SEOHead page={{ title: 'سياسة الخصوصية', description: 'معلومات عامة عن تعامل أكاديمية وحي ونماء مع بيانات المستخدمين.', url: '/privacy' }} />
      <GlobalHeader />
      <main className="wn-public-shell" dir="rtl">
        <section className="wn-public-hero">
          <div className="page-container wn-public-hero__inner">
            <div>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> الخصوصية والبيانات</span>
              <h1>سياسة الخصوصية</h1>
              <p>توضح هذه الصفحة بصورة عامة أنواع البيانات التي قد تحتاجها المنصة لتقديم الخدمة وكيفية استخدامها.</p>
            </div>
            <div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit" /><div className="wn-public-orbit__core"><ShieldCheck size={46} strokeWidth={1.25} /></div></div>
          </div>
        </section>

        <section className="wn-editorial-wrap">
          <div className="wn-editorial-card">
            <h2>البيانات التي قد نجمعها</h2>
            <ul>
              <li>بيانات الحساب مثل الاسم والبريد الإلكتروني ورقم الهاتف عند إدخاله.</li>
              <li>بيانات الدراسة والتقدم والجلسات اللازمة لتقديم خدمات التعلم.</li>
              <li>ملفات أو تسجيلات يرفعها المستخدم عندما تتطلب ميزة تعليمية ذلك.</li>
            </ul>

            <h2>استخدام البيانات</h2>
            <p>تُستخدم البيانات لتشغيل الحساب، تقديم الخدمات التعليمية، المتابعة، الدعم، وتحسين وظائف المنصة.</p>

            <h2>مشاركة البيانات والوصول إليها</h2>
            <p>الوصول إلى البيانات يجب أن يكون في حدود ما تتطلبه الخدمة ودور المستخدم. لا ترسل كلمات المرور أو بيانات الدفع من خلال نماذج التواصل العامة.</p>

            <h2>طلبات المستخدم</h2>
            <p>يمكن إرسال استفسار أو طلب متعلق بالبيانات من صفحة التواصل، وسيتم التعامل معه وفق الإمكانات والسياسات المعمول بها وقت الطلب.</p>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
