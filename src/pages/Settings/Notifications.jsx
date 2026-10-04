import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BellRing, Sparkles } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import { enableWebPush, isPushSupported } from '../../lib/webPush';
import '../../styles/public-experience.css';

export default function NotificationSettings(){
  const {isAuthenticated}=useAuth();const {locale}=useI18n();const isAr=locale==='ar';const navigate=useNavigate();
  const [prefs,setPrefs]=useState({email:true,push:true,telegram:true,sms:false});const [telegramId,setTelegramId]=useState('');const [saved,setSaved]=useState(false);const [pushLoading,setPushLoading]=useState(false);const [pushEnabled,setPushEnabled]=useState(false);
  useEffect(()=>{if(!isAuthenticated){navigate(localizedPath('/login',locale)+'?redirect=/settings/notifications');return;}api.get('/api/notifications/preferences',{auth:true}).then((d)=>{if(d.preferences)setPrefs(d.preferences);}).catch(()=>{});},[isAuthenticated,navigate,locale]);
  const savePrefs=async()=>{await api.put('/api/notifications/preferences',{preferences:prefs},{auth:true});setSaved(true);setTimeout(()=>setSaved(false),1800);};
  const registerTelegram=async()=>{if(!telegramId.trim())return;await api.post('/api/notifications/telegram-id',{telegramId},{auth:true});setSaved(true);};
  const registerPush=async()=>{setPushLoading(true);try{await enableWebPush();setPushEnabled(true);setPrefs((p)=>({...p,push:true}));}catch(err){alert(err.message||(isAr?'تعذر تفعيل الإشعارات':'Unable to enable notifications'));}finally{setPushLoading(false);}};

  return <div className="wn-public-shell min-h-screen"><GlobalHeader/>
    <section className="wn-public-hero"><div className="page-container wn-public-hero__inner"><div><span className="wn-auth-visual__eyebrow"><Sparkles size={14}/>{isAr?'تفضيلات التواصل':'COMMUNICATION PREFERENCES'}</span><h1>{isAr?'إعدادات الإشعارات':'Notification settings'}</h1><p>{isAr?'اختر القنوات التي ترغب في استخدامها عندما تكون متاحة لحسابك.':'Choose the channels you want to use when available for your account.'}</p></div><div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit"/><div className="wn-public-orbit__core"><BellRing size={46} strokeWidth={1.25}/></div></div></div></section>
    <main className="wn-utility-wrap max-w-2xl">
      <section className="wn-utility-card">{[['email',isAr?'البريد الإلكتروني':'Email'],['push',isAr?'إشعارات المتصفح':'Browser push'],['telegram','Telegram'],['sms',isAr?'WhatsApp / SMS':'WhatsApp / SMS']].map(([key,label])=><label key={key} className="wn-setting-row"><span className="text-sm font-semibold text-[var(--wn-text-primary)]">{label}</span><input type="checkbox" checked={!!prefs[key]} onChange={(e)=>setPrefs({...prefs,[key]:e.target.checked})} className="w-5 h-5 accent-[var(--wn-emerald)]"/></label>)}<button onClick={savePrefs} className="wn-btn wn-btn--primary wn-btn--block mt-4">{saved?(isAr?'تم الحفظ':'Saved'):(isAr?'حفظ التفضيلات':'Save preferences')}</button></section>
      <section className="wn-utility-card mt-4"><h2 className="font-[var(--wn-font-display)] text-lg text-[var(--wn-emerald-deep)]">{isAr?'ربط Telegram':'Connect Telegram'}</h2><div className="flex gap-2 mt-3"><input value={telegramId} onChange={(e)=>setTelegramId(e.target.value)} placeholder="Chat ID" className="flex-1 min-h-11 border rounded-xl px-3"/><button onClick={registerTelegram} className="wn-btn wn-btn--secondary">{isAr?'ربط':'Connect'}</button></div></section>
      <section className="wn-utility-card mt-4"><h2 className="font-[var(--wn-font-display)] text-lg text-[var(--wn-emerald-deep)]">{isAr?'إشعارات تطبيق الويب':'Web app notifications'}</h2>{!isPushSupported()?<p className="text-sm text-[var(--wn-text-secondary)] mt-2">{isAr?'المتصفح الحالي لا يدعم إشعارات الويب.':'This browser does not support web push.'} <Link to={localizedPath('/app',locale)} className="font-bold text-[var(--wn-emerald-dark)]">{isAr?'صفحة التطبيق':'App page'}</Link></p>:<button onClick={registerPush} disabled={pushLoading} className="wn-btn wn-btn--primary mt-3">{pushLoading?(isAr?'جاري التفعيل...':'Enabling...'):pushEnabled?(isAr?'تم التفعيل':'Enabled'):(isAr?'تفعيل إشعارات الويب':'Enable web push')}</button>}</section>
    </main><GlobalFooter/>
  </div>;
}
