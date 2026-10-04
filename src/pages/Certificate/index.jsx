import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Award, Calendar, User, BookOpen, CheckCircle, XCircle, Download, Share2, Sparkles } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import { downloadCertificatePdf } from '../../lib/certificatePdf';
import { useI18n } from '../../i18n';
import '../../styles/public-experience.css';

export default function CertificateView(){
  const {certificateId}=useParams();const {locale}=useI18n();const isAr=locale==='ar';
  const [certificate,setCertificate]=useState(null);const [verification,setVerification]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState(null);
  useEffect(()=>{fetch('/api/certificates/'+certificateId).then(async(response)=>{const data=await response.json();if(!response.ok)throw new Error(data.error||'Failed');setCertificate(data.certificate);setVerification(data.verification||null);}).catch((err)=>setError(err.message||(isAr?'تعذر تحميل الشهادة':'Unable to load certificate'))).finally(()=>setLoading(false));},[certificateId,isAr]);
  const handleDownload=async()=>{try{await downloadCertificatePdf({certificate,locale});}catch{alert(isAr?'تعذر إنشاء ملف PDF':'PDF generation failed');}};
  const handleShare=async()=>{const title=isAr?'شهادة إتمام '+(certificate.course?.title?.ar||''):'Certificate of completion';if(navigator.share){try{await navigator.share({title,text:title,url:window.location.href});}catch{}}else{await navigator.clipboard.writeText(window.location.href);alert(isAr?'تم نسخ الرابط':'Link copied');}};
  if(loading)return <><GlobalHeader/><div className="wn-public-shell min-h-[70vh] grid place-items-center">{isAr?'جاري التحقق...':'Verifying...'}</div><GlobalFooter/></>;
  if(error||!certificate)return <><GlobalHeader/><main className="wn-public-shell min-h-[70vh] grid place-items-center px-4"><div className="wn-public-empty max-w-xl w-full"><XCircle size={48}/><h3>{isAr?'الشهادة غير موجودة أو غير متاحة':'Certificate not found or unavailable'}</h3></div></main><GlobalFooter/></>;
  const isValid=verification?.valid===true;const courseTitle=certificate.course?.title?.[locale]||certificate.course?.title?.ar||certificate.course?.title?.en||'';const studentName=certificate.student?.name||'—';const score=certificate.metadata?.score;
  return <><SEOHead page={{title:isAr?'التحقق من شهادة '+studentName:'Certificate verification',description:isAr?'التحقق من شهادة صادرة من نظام وحي ونماء.':'Verify a certificate issued by Wahy Wa Namaa.',url:'/verify-certificate/'+certificateId}}/><GlobalHeader/><main className="wn-public-shell"><section className="wn-utility-wrap max-w-4xl">
    <div className={'mb-4 p-4 rounded-2xl border flex items-start gap-3 '+(isValid?'border-emerald-200 bg-emerald-50':'border-red-200 bg-red-50')}>{isValid?<CheckCircle className="text-emerald-700 shrink-0" size={20}/>:<XCircle className="text-red-700 shrink-0" size={20}/>}<div><strong className={isValid?'text-emerald-900':'text-red-900'}>{isValid?(isAr?'تم التحقق من الشهادة في النظام':'Certificate verified in the system'):(isAr?'تعذر التحقق من الشهادة':'Certificate could not be verified')}</strong>{!isValid&&verification?.reason?<p className="text-xs mt-1 text-red-700">{verification.reason}</p>:null}</div></div>
    <article className="wn-certificate"><header className="wn-certificate__head"><Sparkles size={18} className="mx-auto text-[#efd28e]"/><Award size={52} className="mx-auto mt-3"/><h1>{isAr?'شهادة إتمام':'Certificate of Completion'}</h1><p>{isAr?'أكاديمية وَحْيٌ وَنَمَاء':'Wahy Wa Namaa Academy'}</p></header><div className="wn-certificate__body"><p className="text-sm text-[var(--wn-text-secondary)]">{isAr?'تشهد هذه الشهادة بأن':'This certificate records that'}</p><h2 className="wn-certificate__name">{studentName}</h2><p className="text-sm text-[var(--wn-text-secondary)]">{isAr?'أتم الدورة المسجلة باسم':'completed the recorded course'}</p><h3 className="wn-certificate__course mt-2">{courseTitle}</h3>
    <div className="wn-certificate__meta"><div><Calendar size={19}/><small>{isAr?'تاريخ الإصدار':'Issue date'}</small><strong>{certificate.issuedAt?new Date(certificate.issuedAt).toLocaleDateString(isAr?'ar-EG':'en'):'—'}</strong></div><div><BookOpen size={19}/><small>{isAr?'النتيجة المسجلة':'Recorded score'}</small><strong>{score!=null?score+'%':'—'}</strong></div><div><User size={19}/><small>{isAr?'معرّف الشهادة':'Certificate ID'}</small><strong>{certificate.certificateId||certificateId}</strong></div></div>
    {certificate.qrCode?<div className="mt-7"><img src={certificate.qrCode} alt="QR" className="mx-auto w-36 h-36"/><p className="text-xs text-[var(--wn-text-tertiary)] mt-2">{isAr?'امسح الرمز لفتح صفحة التحقق':'Scan to open verification page'}</p></div>:null}
    <div className="flex flex-wrap justify-center gap-2 mt-7"><button onClick={handleDownload} className="wn-btn wn-btn--primary"><Download size={16}/>{isAr?'تحميل PDF':'Download PDF'}</button><button onClick={handleShare} className="wn-btn wn-btn--secondary"><Share2 size={16}/>{isAr?'مشاركة':'Share'}</button></div></div></article>
  </section></main><GlobalFooter/></>;
}
