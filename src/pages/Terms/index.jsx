import { FileText, Sparkles } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import '../../styles/public-experience.css';

export default function Terms() {
  return (
    <>
      <SEOHead page={{ title: 'الشروط والأحكام', description: 'الشروط العامة لاستخدام أكاديمية وحي ونماء.', url: '/terms' }} />
      <GlobalHeader />
      <main className="wn-public-shell" dir="rtl">
        <section className="wn-public-hero">
          <div className="page-container wn-public-hero__inner">
            <div>
              <span className="wn-auth-visual__eyebrow"><Sparkles size={14} /> الاستخدام والخدمة</span>
              <h1>الشروط والأحكام</h1>
              <p>شروط عامة لتنظيم استخدام الحسابات والخدمات التعليمية داخل أكاديمية وحي ونماء.</p>
            </div>
            <div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit" /><div className="wn-public-orbit__core"><FileText size={46} strokeWidth={1.25} /></div></div>
          </div>
        </section>

        <section className="wn-editorial-wrap">
          <div className="wn-editorial-card">
            <h2>استخدام المنصة</h2>
            <p>تُستخدم المنصة لأغراض التعلم والتواصل المرتبط بالخدمات المتاحة، مع الالتزام بعدم إساءة الاستخدام أو تعطيل الخدمة أو التعدي على حسابات الآخرين.</p>

            <h2>الحسابات</h2>
            <p>المستخدم مسؤول عن الحفاظ على سرية بيانات الدخول وعدم مشاركة كلمة المرور. يجب تقديم بيانات صحيحة بالقدر اللازم لتقديم الخدمة.</p>

            <h2>المحتوى التعليمي</h2>
            <p>إتاحة دورة أو درس أو شهادة أو ميزة معينة تعتمد على حالة الحساب والبرنامج والبيانات الفعلية المسجلة في النظام.</p>

            <h2>الحجوزات والمدفوعات</h2>
            <p>أي سعر أو سياسة إلغاء أو استرداد تكون هي المعلومات المعروضة للمستخدم في مسار الحجز أو الدفع المعني وقت تنفيذ العملية. لا تفترض هذه الصفحة مدة استرداد ثابتة.</p>

            <h2>التحديثات</h2>
            <p>قد تتغير وظائف المنصة وهذه الشروط مع تطور الخدمة. النسخة المنشورة على الموقع هي المرجع المتاح للمستخدم وقت الزيارة.</p>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </>
  );
}
