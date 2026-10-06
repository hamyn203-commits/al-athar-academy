import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Settings, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';
import GlobalFooter from '../../components/GlobalFooter';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n';
import { localizedPath } from '../../lib/locale';
import '../../styles/public-experience.css';

function pickText(value,locale){if(!value)return '';if(typeof value==='string')return value;return value[locale]||value.ar||value.en||'';}

export default function NotificationsPage(){
  const {isAuthenticated}=useAuth();
  const {locale}=useI18n();
  const isAr=locale==='ar';
  const navigate=useNavigate();
  const [notifications,setNotifications]=useState([]);
  const [unreadCount,setUnreadCount]=useState(0);
  const [loading,setLoading]=useState(true);

  const load=useCallback(async()=>{try{const data=await api.get('/api/notifications?limit=50',{auth:true});setNotifications(data.notifications||[]);setUnreadCount(data.unreadCount||0);}catch{setNotifications([]);}finally{setLoading(false);}},[]);
  useEffect(()=>{if(!isAuthenticated){navigate(localizedPath('/login',locale)+'?redirect=/notifications');return;}load();},[isAuthenticated,navigate,load,locale]);

  const markAsRead=async(id)=>{await api.put('/api/notifications/'+id+'/read',{}, {auth:true});setNotifications((prev)=>prev.map((n)=>n._id===id?{...n,isRead:true}:n));setUnreadCount((count)=>Math.max(0,count-1));};
  const markAll=async()=>{await api.put('/api/notifications/read-all',{}, {auth:true});setNotifications((prev)=>prev.map((n)=>({...n,isRead:true})));setUnreadCount(0);};

  return <div className="wn-public-shell min-h-screen"><GlobalHeader/>
    <section className="wn-public-hero"><div className="page-container wn-public-hero__inner"><div><span className="wn-auth-visual__eyebrow"><Sparkles size={14}/>{isAr?'مركز الإشعارات':'NOTIFICATION CENTER'}</span><h1>{isAr?'إشعارات حسابك':'Your notifications'}</h1><p>{isAr?'الجلسات والتحديثات المرتبطة بحسابك تظهر هنا عند وصولها من النظام.':'Account-related session alerts and updates appear here when sent by the system.'}</p></div><div className="wn-public-hero__art" aria-hidden="true"><div className="wn-public-orbit"/><div className="wn-public-orbit__core"><Bell size={46} strokeWidth={1.25}/></div></div></div></section>
    <main className="wn-utility-wrap">
      <div className="flex items-center justify-between gap-3 mb-4"><span className="text-sm font-bold text-[var(--wn-emerald-deep)]">{unreadCount?unreadCount+' '+(isAr?'غير مقروء':'unread'):(isAr?'لا إشعارات جديدة':'No new notifications')}</span><div className="flex gap-2">{unreadCount>0?<button onClick={markAll} className="wn-btn wn-btn--secondary wn-btn--sm"><CheckCheck size={14}/>{isAr?'تعليم الكل':'Mark all'}</button>:null}<Link to={localizedPath('/settings/notifications',locale)} className="wn-btn wn-btn--secondary wn-btn--sm"><Settings size={14}/>{isAr?'الإعدادات':'Settings'}</Link></div></div>
      {loading?<div className="wn-public-empty">{isAr?'جاري التحميل...':'Loading...'}</div>:notifications.length===0?<div className="wn-public-empty"><Bell size={42}/><h3>{isAr?'لا توجد إشعارات':'No notifications'}</h3></div>:<div className="wn-notification-list">{notifications.map((n)=><article key={n._id} className={'wn-notification-item '+(!n.isRead?'is-unread':'')}><div className="flex items-start justify-between gap-3"><div><h3>{pickText(n.title,locale)}</h3><p className="mt-1">{pickText(n.message,locale)}</p></div>{!n.isRead?<button onClick={()=>markAsRead(n._id)} className="text-[11px] font-bold text-[var(--wn-emerald)]">{isAr?'تمت القراءة':'Mark read'}</button>:null}</div><p className="mt-2 !text-[10px] !text-[var(--wn-text-tertiary)]">{new Date(n.createdAt).toLocaleString(isAr?'ar-EG':'en')}</p>{n.data?.meetingLink?<a href={n.data.meetingLink} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-bold text-[var(--wn-emerald-dark)]">{isAr?'فتح رابط الجلسة':'Open session link'}</a>:null}{n.data?.actionUrl?<Link to={localizedPath(n.data.actionUrl,locale)} className="inline-block mt-2 me-3 text-xs font-bold text-[var(--wn-emerald-dark)]">{isAr?'فتح':'Open'}</Link>:null}</article>)}</div>}
    </main><GlobalFooter/>
  </div>;
}
