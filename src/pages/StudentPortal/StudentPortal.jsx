import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import {
  BookOpen, BookOpenCheck, Users, Mic, UserPlus, AlertCircle,
  Trophy, Video, CheckCircle, Square, Send,
  Flame, Star, Activity, CheckSquare, Target,
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import AudioPlayer from '../../components/shared/AudioPlayer';
import VideoModal from '../../components/shared/VideoModal';
import EmptyState from '../../components/shared/EmptyState';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useGamification } from '../../hooks/useGamification';
import { sheikhs, quizQuestion } from '../../data/mockData';
import { useAppContext } from '../../context/AppProvider';

function LoginView({ studentsData, onLogin, navigate, defaultGamification, setStudentsData, t }) {
  // التحقق من وجود token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'student') {
        navigate('/student/dashboard');
      }
    }
  }, [navigate]);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', minHeight: '100vh' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '40px 30px', textAlign: 'center', border: '1px solid var(--primary-gold)' }}>
        <Logo size={80} showText={false} />
        <h2 style={{ margin: '20px 0 8px' }} className="text-gradient-gold">{t.student.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '30px' }}>
          {t.student.subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-premium"
            style={{ justifyContent: 'center', fontSize: '1rem', padding: '14px 20px' }}
          >
            <UserPlus size={18} /> {t.student.login || 'تسجيل الدخول'}
          </button>
          <button 
            onClick={() => navigate('/register/student')} 
            className="btn-premium-outline"
            style={{ justifyContent: 'center', fontSize: '1rem', padding: '14px 20px' }}
          >
            <UserPlus size={18} /> {t.student.register || 'إنشاء حساب جديد'}
          </button>
          <button onClick={() => navigate('/')} className="btn-premium-outline" style={{ justifyContent: 'center' }}>
            {t.student.backHome}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardTab({ profile, defaultGamification, onToggleHabit, t, days }) {
  const sHabits = profile?.dailyHabits || defaultGamification.dailyHabits;
  const sActivity = profile?.activityData || defaultGamification.activityData;

  const habits = [
    { id: 'adhkar', label: t.student.dashboard.adhkar },
    { id: 'werd', label: t.student.dashboard.werd },
    { id: 'murajaah', label: t.student.dashboard.murajaah },
  ];

  const activityData = sActivity.map((item, i) => ({
    ...item,
    name: days[i] || item.name
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={18} style={{ color: 'var(--emerald)' }} /> {t.student.dashboard.dailyHabits}</h3>
            <span className="badge-green">{t.student.dashboard.pointsReward}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {habits.map((h) => (
              <div key={h.id} className={`habit-item ${sHabits[h.id] ? 'completed' : ''}`} onClick={() => onToggleHabit(h.id)} role="checkbox" aria-checked={sHabits[h.id]} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleHabit(h.id); }}>
                <span style={{ color: sHabits[h.id] ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: sHabits[h.id] ? '600' : '400' }}>{h.label}</span>
                <div className="habit-check">{sHabits[h.id] && <CheckCircle size={16} color="#fff" />}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} style={{ color: 'var(--primary-gold)' }} /> {t.student.dashboard.weeklyActivity}</h3>
          <div style={{ flex: 1, minHeight: '180px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary-gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }} itemStyle={{ color: 'var(--primary-gold)' }} />
                <Area type="monotone" dataKey="points" name={t.student.pointsLabel} stroke="var(--primary-gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="premium-card" style={{ border: '1px solid rgba(200, 138, 88, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={18} style={{ color: 'var(--clay-terracotta)' }} /> {t.student.dashboard.currentHomework}</h3>
          <div style={{ background: 'rgba(200, 138, 88, 0.04)', padding: '16px', borderRadius: 'var(--radius-sm)', borderRight: '4px solid var(--clay-terracotta)', flex: 1 }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: '500', lineHeight: '1.8' }}>
              {profile?.homework || t.student.dashboard.noHomework}
            </p>
          </div>
        </div>

        <QuizWidget t={t} />
      </div>
    </motion.div>
  );
}

function QuizWidget({ t }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={18} style={{ color: 'var(--primary-gold)' }} /> {t.student.dashboard.quizTitle}</h3>
        <span className="badge-gold">{t.student.dashboard.quizReward}</span>
      </div>
      <div style={{ background: 'var(--bg-elevated)', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: '600', lineHeight: '1.7' }}>
        {quizQuestion.text}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {quizQuestion.options.map((opt) => (
          <button
            key={opt.id}
            disabled={submitted}
            onClick={() => setSelected(opt.id)}
            style={{
              textAlign: 'right', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              background: selected === opt.id ? 'rgba(197, 168, 128, 0.1)' : 'var(--bg-elevated)',
              border: selected === opt.id ? '1.5px solid var(--primary-gold)' : '1.5px solid transparent',
              color: selected === opt.id ? 'var(--primary-gold-dark)' : 'var(--text-secondary)',
              cursor: submitted ? 'default' : 'pointer', fontSize: '0.88rem', fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            {opt.id}) {opt.text}
            {submitted && opt.id === quizQuestion.correctId && <span style={{ color: 'var(--emerald)', marginRight: '10px', fontWeight: 'bold' }}>✓</span>}
          </button>
        ))}
      </div>
      {!submitted ? (
        <button onClick={() => { if (selected) setSubmitted(true); }} disabled={!selected} className="btn-premium" style={{ width: '100%', justifyContent: 'center', padding: '10px', opacity: selected ? 1 : 0.5 }}>
          {t.student.dashboard.submitAnswer}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '14px', background: 'var(--emerald-light)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', lineHeight: '1.7' }}>
          <strong style={{ color: 'var(--emerald)' }}>{t.student.dashboard.explanation}</strong> {quizQuestion.explanation}
        </motion.div>
      )}
    </div>
  );
}

function PlanTab({ profile, onGoToRecord, t }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="premium-card">
      <h3 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>{t.student.plan.title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', padding: '20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600' }}>{t.student.plan.totalProgress}</span>
            <span style={{ color: 'var(--primary-gold)', fontWeight: 'bold' }}>{profile?.progress || 0}%</span>
          </div>
          <div className="progress-bar" style={{ height: '10px' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${profile?.progress || 0}%` }} transition={{ duration: 1, delay: 0.2 }} className="progress-bar-fill" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingRight: '24px' }}>
        <div className="timeline-line" />
        <div style={{ display: 'flex', gap: '24px', position: 'relative' }}>
          <div className="timeline-dot completed" />
          <div style={{ background: 'var(--emerald-light)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', flex: 1 }}>
            <span className="badge-green">{t.student.plan.completed}</span>
            <h4 style={{ marginTop: '10px', fontSize: '1.05rem' }}>{t.student.plan.completedTitle}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{t.student.plan.completedDesc}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', position: 'relative' }}>
          <div className="timeline-dot current" />
          <div style={{ background: 'rgba(197, 168, 128, 0.06)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-gold)', flex: 1 }}>
            <span className="badge-gold">{t.student.plan.currentTarget}</span>
            <h4 style={{ marginTop: '10px', fontSize: '1.15rem', color: 'var(--primary-gold-dark)' }}>{profile?.currentSurah}</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{t.student.plan.currentDesc}</p>
            <button className="btn-premium" style={{ fontSize: '0.82rem', padding: '8px 16px', marginTop: '14px' }} onClick={onGoToRecord}><Mic size={14} /> {t.student.plan.reciteNew}</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', position: 'relative', opacity: 0.5 }}>
          <div className="timeline-dot upcoming" />
          <div style={{ padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-light)', flex: 1 }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>{t.student.plan.nextStep}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>{t.student.plan.nextStepDesc}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SheikhsTab({ onVideoOpen, t }) {
  const audio = useAudioPlayer();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="premium-card">
        <h3>{t.student.sheikhs.changeSheikh}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{t.student.sheikhs.changeDesc}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {sheikhs.map((s) => (
          <div key={s.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <img src={s.image} alt={s.name} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--primary-gold)' }} loading="lazy" />
              <div>
                <h4 style={{ fontSize: '1rem' }}>{s.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-gold)' }}>{s.specialty}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.7' }}>{s.bio}</p>
            <AudioPlayer isActive={audio.isActive(s.id)} isPlaying={audio.isActive(s.id) && audio.isPlaying} progress={audio.isActive(s.id) ? audio.progress : 0} onToggle={() => audio.toggle(s.id)} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onVideoOpen(s)} className="btn-premium-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '8px', display: 'flex', gap: '4px' }}>
                <Video size={14} /> {t.student.sheikhs.video}
              </button>
              <button onClick={() => alert(`${t.student.sheikhs.joinSuccess} ${s.name}`)} className="btn-premium" style={{ flex: 2, justifyContent: 'center', fontSize: '0.85rem', padding: '8px' }}>
                {t.student.sheikhs.joinRequest}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RecordingTab({ profile, t }) {
  const recorder = useAudioRecorder();

  const handleSubmit = async () => {
    try {
      await recorder.submit(`${API_BASE_URL}/api/audio/upload`);
      setTimeout(() => { recorder.reset(); alert(t.student.record.uploadSuccess); }, 1500);
    } catch (err) {
      alert(t.student.record.uploadError + ' ' + err.message);
    }
  };

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '50px 20px', textAlign: 'center' }}>
      <div>
        <span className="badge-gold">{t.student.record.badge}</span>
        <h3 style={{ fontSize: '1.6rem', marginTop: '12px' }}>{t.student.record.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '500px', margin: '12px auto 0', lineHeight: '1.7' }}>
          {t.student.record.description} (<strong style={{ color: 'var(--primary-gold)' }}>{profile?.currentSurah}</strong>). {t.student.record.clearRecording}
        </p>
      </div>

      <div className={`recording-visualizer ${recorder.state === 'recording' ? 'active' : ''}`}>
        {recorder.state === 'recording' ? (
          [20, 50, 16, 40, 25].map((h, i) => (
            <div key={i} className="wave-bar" style={{ background: 'var(--danger)', height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
          ))
        ) : recorder.state === 'recorded' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-gold)', fontSize: '1.05rem' }}><CheckCircle size={24} /> {t.student.record.readyToSend}</div>
        ) : (
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t.student.record.readyToRecord}</span>
        )}
      </div>

      {recorder.state === 'recording' && <span style={{ fontSize: '1.3rem', color: 'var(--danger)', fontWeight: 'bold' }}>{recorder.duration} {t.student.record.seconds}</span>}

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {recorder.state === 'idle' && <button onClick={() => recorder.start().catch(() => alert(t.student.record.micError))} className="btn-premium" style={{ background: 'var(--danger)', padding: '14px 28px', fontSize: '1.05rem' }}><Mic size={20} /> {t.student.record.startRecitation}</button>}
        {recorder.state === 'recording' && <button onClick={recorder.stop} className="btn-premium" style={{ background: 'var(--text-primary)', padding: '14px 28px', fontSize: '1.05rem' }}><Square size={20} /> {t.student.record.stopRecording}</button>}
        {recorder.state === 'recorded' && (
          <>
            <button onClick={recorder.reset} className="btn-premium-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{t.student.record.retry}</button>
            <button onClick={handleSubmit} className="btn-premium" style={{ padding: '14px 28px', fontSize: '1.05rem' }} disabled={recorder.state === 'uploading'}>
              {recorder.state === 'uploading' ? t.student.record.uploading : <><Send size={20} /> {t.student.record.submit}</>}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function StudentPortal() {
  const navigate = useNavigate();
  const { studentsData, setStudentsData, loggedInStudentId, handleStudentLogin, handleStudentLogout, activeStudentProfile, updateStudentData, defaultGamification, t } = useAppContext();
  const [subTab, setSubTab] = useState('dashboard');
  const [videoModal, setVideoModal] = useState({ open: false, video: null });
  const { toggleHabit } = useGamification(activeStudentProfile, updateStudentData, defaultGamification);

  const days = t.days;

  if (!loggedInStudentId) {
    return <LoginView studentsData={studentsData} onLogin={handleStudentLogin} navigate={navigate} defaultGamification={defaultGamification} setStudentsData={setStudentsData} t={t} />;
  }

  const sPoints = activeStudentProfile?.points || 0;
  const sLevel = activeStudentProfile?.level || 'مبتدئ';
  const sStreak = activeStudentProfile?.streak || 0;

  const tabs = [
    { id: 'dashboard', icon: Activity, label: t.student.tabs.dashboard },
    { id: 'plan', icon: BookOpenCheck, label: t.student.tabs.plan },
    { id: 'sheikhs', icon: Users, label: t.student.tabs.sheikhs },
    { id: 'record', icon: Mic, label: t.student.tabs.record },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
          <Logo size={44} showText />
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 0 15px var(--primary-gold-glow)', flexShrink: 0 }}>
            {activeStudentProfile?.name.charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.92rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{activeStudentProfile?.name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} /> {sLevel}</span>
          </div>
        </div>
        <ul className="sidebar-nav" style={{ flex: 1 }}>
          {tabs.map((tab) => (
            <li key={tab.id} className={`sidebar-item ${subTab === tab.id ? 'active' : ''}`} onClick={() => setSubTab(tab.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSubTab(tab.id); }}>
              <tab.icon size={18} /> {tab.label}
            </li>
          ))}
        </ul>
        <button onClick={() => { handleStudentLogout(); navigate('/'); }} className="btn-premium-outline" style={{ justifyContent: 'center', width: '100%' }}>
          {t.student.logout}
        </button>
      </aside>

      <main className="dashboard-content animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-gold)' }}>{t.student.greeting}</span>
            <h2 style={{ fontSize: '1.7rem', marginTop: '4px' }}>{t.student.welcome} {activeStudentProfile?.name}</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.03 }} className="glass-card flex-center" style={{ padding: '10px 18px', gap: '10px', border: '1px solid rgba(200, 138, 88, 0.3)', background: 'rgba(200, 138, 88, 0.04)' }}>
              <Flame size={20} style={{ color: 'var(--clay-terracotta)' }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{t.student.streakDays}</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{sStreak} {t.student.days}</strong>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="glass-card flex-center" style={{ padding: '10px 18px', gap: '10px', border: '1px solid var(--primary-gold)' }}>
              <Trophy size={20} style={{ color: 'var(--primary-gold)' }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{t.student.pointsLabel}</span>
                <strong style={{ color: 'var(--primary-gold-dark)', fontSize: '1.05rem' }}>{sPoints} {t.student.points}</strong>
              </div>
            </motion.div>
          </div>
        </div>

        {subTab === 'dashboard' && <DashboardTab profile={activeStudentProfile} defaultGamification={defaultGamification} onToggleHabit={toggleHabit} t={t} days={days} />}
        {subTab === 'plan' && <PlanTab profile={activeStudentProfile} onGoToRecord={() => setSubTab('record')} t={t} />}
        {subTab === 'sheikhs' && <SheikhsTab onVideoOpen={(v) => setVideoModal({ open: true, video: v })} t={t} />}
        {subTab === 'record' && <RecordingTab profile={activeStudentProfile} t={t} />}
      </main>

      <VideoModal isOpen={videoModal.open} onClose={() => setVideoModal({ open: false, video: null })} video={videoModal.video} />
    </div>
  );
}
