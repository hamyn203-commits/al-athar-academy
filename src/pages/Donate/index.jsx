import { useEffect, useState } from 'react';
import { HeartHandshake, CircleDollarSign, Users, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import SEOHead from '../../components/SEOHead';
import api from '../../lib/api';
import '../../styles/public-experience.css';

const CATEGORIES=[
  {id:'student',icon:Users,ar:'كفالة طالب',en:'Sponsor a Student'},
  {id:'teacher',icon:BookOpen,ar:'دعم تعليم المعلمين',en:'Support Teachers'},
  {id:'halaqa',icon:HeartHandshake,ar:'دعم حلقة قرآن',en:'Support a Quran Halaqa'},
  {id:'general',icon:CircleDollarSign,ar:'مساهمة عامة',en:'General Contribution'},
];

export default function Donate(){
  const {locale}=useI18n();
  const isAr=locale==='ar';
  const [stats,setStats]=useState({totalAmount:0,totalDonors:0});
  const [config,setConfig]=useState({paymentEnabled:false,stripeUrl:'',paypalUrl:''});
  const [form,setForm]=useState({name:'',email:'',phone:'',amount:100,currency:'USD',category:'general',message:'',isAnonymous:false});
  const [method,setMethod]=useState('manual');
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);

  useEffect(()=>{
    Promise.all([api.get('/api/donations/stats'),api.get('/api/donations/config')])
      .then(([s,c])=>{setStats(s||{});setConfig(c||{});})
      .catch(()=>{});
  },[]);

  const submit=async(event)=>{
    event.preventDefault();
    setLoading(true);
    try{
      await api.post('/api/donations',form);
      const paymentUrl=method==='stripe'?config.stripeUrl:method==='paypal'?config.paypalUrl:'';
      if(method!=='manual' && config.paymentEnabled && paymentUrl){
        window.location.assign(paymentUrl);
        return;
      }
      setDone(true);
    }catch(err){
      alert(err.message||(isAr?'تعذر تسجيل المساهمة':'Unable to record contribution'));
    }finally{
      setLoading(false);
    }
  };

  const availableMethods=[
    ...(config.paymentEnabled&&config.stripeUrl?[['stripe',isAr?'بطاقة عبر Stripe':'Card via Stripe']]:[]),
    ...(config.paymentEnabled&&config.paypalUrl?[['paypal','PayPal']]:[]),
    ['manual',isAr?'تعهّد/تحويل يتم تنسيقه مع الفريق':'Pledge / transfer coordinated with the team'],
  ];

  return <>
    <SEOHead page={{url:'/donate',title:isAr?'المساهمة | وحي ونماء':'Support | Wahy Wa Namaa',description:isAr?'صفحة المساهمات المتاحة في أكاديمية وحي ونماء.':'Contribution options available at Wahy Wa Namaa.'}}/>
    <GlobalHeader/>
    <main className="wn-public-shell">
      <section className="wn-public-hero">
        <div className="page-container wn-public-hero__inner">
          <div><span className="wn-auth-visual__eyebrow"><Sparkles size={14}/>{isAr?'المساهمة في التعليم':'SUPPORT LEARNING'}</span><h1>{isAr?'ساهم في رحلة تعلم القرآن':'Support Quran learning'}</h1><p>{isAr?'اختر نوع المساهمة وأدخل بياناتك. وسائل الدفع المباشر لا تظهر إلا عندما تكون مفعّلة فعليًا في النظام.':'Choose a contribution type and enter your details. Direct payment options only appear when they are actually enabled.'}</p></div>
          <div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit"/><div className="wn-public-orbit__core"><HeartHandshake size={46} strokeWidth={1.25}/></div></div>
        </div>
      </section>

      <section className="wn-utility-wrap">
        {stats.totalDonors>0?<div className="text-center mb-4 text-xs font-bold text-[var(--wn-emerald-dark)]">{stats.totalDonors} {isAr?'مساهمة مسجلة':'recorded contributors'}</div>:null}
        <div className="grid md:grid-cols-2 gap-3 mb-5">
          {CATEGORIES.map(({id,icon:Icon,ar,en})=><button key={id} type="button" onClick={()=>setForm({...form,category:id})} className={'wn-career-card '+(form.category===id?'is-active':'')}><div className="flex items-center gap-3"><span className="w-10 h-10 grid place-items-center rounded-xl bg-[var(--wn-emerald-soft)] text-[var(--wn-emerald-dark)]"><Icon size={19}/></span><h3>{isAr?ar:en}</h3></div></button>)}
        </div>

        {done?<div className="wn-utility-card text-center"><CheckCircle size={48} className="mx-auto text-[var(--wn-emerald)]"/><h2 className="mt-3 font-[var(--wn-font-display)] text-xl text-[var(--wn-emerald-deep)]">{isAr?'تم تسجيل مساهمتك':'Contribution recorded'}</h2><p className="mt-2 text-sm text-[var(--wn-text-secondary)]">{isAr?'لو كانت الخطوة التالية تحتاج تنسيقًا، سيستخدم الفريق بيانات التواصل التي أدخلتها.':'If another step requires coordination, the team will use the contact details you provided.'}</p></div>:(
          <form onSubmit={submit} className="wn-utility-card grid gap-4">
            <div className="grid md:grid-cols-2 gap-3">
              <input required placeholder={isAr?'الاسم':'Name'} className="input-field" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
              <input required type="email" placeholder={isAr?'البريد الإلكتروني':'Email'} className="input-field" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/>
              <input placeholder={isAr?'الهاتف (اختياري)':'Phone (optional)'} className="input-field" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/>
              <div className="flex gap-2"><input required type="number" min="1" className="input-field flex-1" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})}/><select className="input-field w-24" value={form.currency} onChange={(e)=>setForm({...form,currency:e.target.value})}>{['USD','EUR','SAR','AED','EGP'].map((c)=><option key={c}>{c}</option>)}</select></div>
            </div>
            <textarea placeholder={isAr?'رسالة (اختياري)':'Message (optional)'} className="input-field min-h-[90px]" value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}/>
            <div><p className="text-xs font-bold text-[var(--wn-emerald-deep)] mb-2">{isAr?'طريقة الإكمال':'Completion method'}</p><div className="grid gap-2">{availableMethods.map(([id,label])=><label key={id} className={'wn-setting-row px-3 rounded-xl border '+(method===id?'border-[var(--wn-gold)] bg-[var(--wn-gold-soft)]':'border-[var(--wn-border)]')}><span className="text-sm">{label}</span><input type="radio" name="payment" checked={method===id} onChange={()=>setMethod(id)} /></label>)}</div></div>
            <label className="flex items-center gap-2 text-sm text-[var(--wn-text-secondary)]"><input type="checkbox" checked={form.isAnonymous} onChange={(e)=>setForm({...form,isAnonymous:e.target.checked})}/>{isAr?'عدم إظهار الاسم في أي عرض عام للمساهمات':'Do not show my name in any public contribution display'}</label>
            <button disabled={loading} className="wn-btn wn-btn--primary wn-btn--block wn-btn--lg">{loading?'...':method==='manual'?(isAr?'تسجيل التعهّد':'Record pledge'):(isAr?'الانتقال للدفع':'Continue to payment')}</button>
          </form>
        )}
      </section>
    </main>
    <GlobalFooter/>
  </>;
}
