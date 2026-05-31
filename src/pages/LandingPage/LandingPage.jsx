import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Sparkles, Video, Calendar, Clock, Send, ArrowRight, Users, Star, MapPin } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';
import Header from '../../components/Header';
import AudioPlayer from '../../components/shared/AudioPlayer';
import VideoModal from '../../components/shared/VideoModal';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useAppContext } from '../../context/AppProvider';
import { sheikhs, honorBoard } from '../../data/mockData';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' } };

function HeroSection({ t }) {
  return (
    <section id="hero" style={{
      padding: '100px 20px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      background: 'linear-gradient(rgba(15, 14, 13, 0.88), rgba(15, 14, 13, 0.95)), url(/assets/hero-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      borderBottom: '1px solid rgba(197, 168, 128, 0.15)',
    }}>
      <motion.div className="animate-float" style={{ marginBottom: '28px' }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, type: 'spring' }}>
        <Logo size={140} showText={false} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
        className="text-gradient-gold"
        style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', marginBottom: '20px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
      >
        {t.hero.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#e0d8cc', maxWidth: '750px', marginBottom: '40px', lineHeight: '1.9', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
      >
        {t.hero.subtitle}
      </motion.p>

      <motion.div className="animate-fade flex-center" style={{ gap: '16px', flexWrap: 'wrap' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Link to="/student" className="btn-premium" style={{ fontSize: '1.1rem', padding: '16px 40px', boxShadow: '0 10px 35px rgba(197, 168, 128, 0.35)' }}>
          {t.hero.joinAsStudent} <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </Link>
        <Link to="/teachers" className="btn-premium" style={{ fontSize: '1.1rem', padding: '16px 40px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 10px 35px rgba(16, 185, 129, 0.35)' }}>
          <Users size={20} style={{ marginLeft: '8px' }} />
          تصفح المعلمين
        </Link>
        <Link to="/teacher/register" className="btn-premium-outline" style={{ fontSize: '1.1rem', padding: '16px 40px', background: 'rgba(0,0,0,0.4)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
          سجل كمعلم
        </Link>
      </motion.div>
    </section>
  );
}

function AboutSection({ t }) {
  const features = t.about.features.map((f, i) => ({
    icon: [BookOpen, Award, Sparkles][i],
    ...f
  }));

  return (
    <section id="about" style={{ background: 'var(--bg-elevated)', padding: '80px 0', borderY: '1px solid var(--border-light)' }}>
      <div className="container">
        <motion.div style={{ textAlign: 'center', marginBottom: '50px' }} {...fadeUp} transition={{ duration: 0.6 }}>
          <span className="badge-gold" style={{ fontSize: '0.9rem', padding: '6px 20px' }}>{t.about.badge}</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: '16px' }} className="text-gradient-gold">{t.about.title}</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {features.map((f, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.15 }}>
              <Tilt className="premium-card" tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.02} transitionSpeed={2000} glareEnable glareMaxOpacity={0.08} glarePosition="all" style={{ height: '100%' }}>
                <div style={{ display: 'inline-flex', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(197, 168, 128, 0.08)', color: 'var(--primary-gold)', marginBottom: '18px' }}>
                  <f.icon size={28} />
                </div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{f.desc}</p>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedTeachersSection() {
  return (
    <section style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))', padding: '80px 0', borderY: '1px solid rgba(16, 185, 129, 0.2)' }}>
      <div className="container">
        <motion.div style={{ textAlign: 'center', marginBottom: '50px' }} {...fadeUp} transition={{ duration: 0.6 }}>
          <span className="badge-gold" style={{ fontSize: '0.9rem', padding: '6px 20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            🌟 معلمون معتمدون
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: '16px' }} className="text-gradient-gold">
            نخبة من أفضل المعلمين
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '600px', margin: '10px auto 0' }}>
            اختر معلمك من بين مجموعة من المعلمين المجازين والمعتمدين
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {[1, 2, 3].map((i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.15 }}>
              <Tilt className="premium-card" tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.02} transitionSpeed={2000} glareEnable glareMaxOpacity={0.08} glarePosition="all" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '200px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={80} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', color: '#10b981' }}>
                    ⭐ معلم مميز
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>معلم {i}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{ fontWeight: '600' }}>4.{8 + i}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({50 + i * 10} تقييم)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} />
                      <span>مصر</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      <span>{5 + i * 2} سنوات خبرة</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem' }}>تجويد</span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem' }}>حفظ</span>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>

        <motion.div style={{ textAlign: 'center' }} {...fadeUp} transition={{ duration: 0.6, delay: 0.5 }}>
          <Link to="/teachers" className="btn-premium" style={{ fontSize: '1.1rem', padding: '16px 48px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 10px 35px rgba(16, 185, 129, 0.35)' }}>
            <Users size={20} style={{ marginLeft: '8px' }} />
            تصفح جميع المعلمين
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function SheikhsSection({ onVideoOpen, t }) {
  const audio = useAudioPlayer();

  return (
    <section id="sheikhs" className="container" style={{ padding: '80px 20px' }}>
      <motion.div style={{ textAlign: 'center', marginBottom: '50px' }} {...fadeUp} transition={{ duration: 0.6 }}>
        <span className="badge-gold" style={{ fontSize: '0.9rem', padding: '6px 20px' }}>{t.sheikhs.badge}</span>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: '16px' }} className="text-gradient-gold">{t.sheikhs.title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '600px', margin: '10px auto 0' }}>{t.sheikhs.subtitle}</p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sheikhs.map((sheikh, i) => (
          <motion.div key={sheikh.id} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}>
            <Tilt className="premium-card" tiltMaxAngleX={4} tiltMaxAngleY={4} scale={1.01} transitionSpeed={1500} glareEnable glareMaxOpacity={0.04} glarePosition="all">
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--primary-gold)', flexShrink: 0 }} className="flex-center">
                  <img src={sheikh.image} alt={sheikh.name} width="120" height="120" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{sheikh.name}</h3>
                      <p style={{ color: 'var(--primary-gold)', fontSize: '0.9rem', fontWeight: '500', marginTop: '4px' }}>{sheikh.specialty}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => onVideoOpen(sheikh)} className="btn-premium-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }} aria-label={`${t.sheikhs.watchVideo} ${sheikh.name}`}>
                        <Video size={16} /> {t.sheikhs.watchVideo}
                      </button>
                      <AudioPlayer
                        isActive={audio.isActive(sheikh.id)}
                        isPlaying={audio.isActive(sheikh.id) && audio.isPlaying}
                        progress={audio.isActive(sheikh.id) ? audio.progress : 0}
                        onToggle={() => audio.toggle(sheikh.id)}
                      />
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.7' }}>{sheikh.bio}</p>
                </div>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HonorBoardSection({ t }) {
  return (
    <section id="honors" style={{ background: 'var(--bg-elevated)', padding: '80px 0', borderY: '1px solid var(--border-light)' }}>
      <div className="container">
        <motion.div style={{ textAlign: 'center', marginBottom: '50px' }} {...fadeUp} transition={{ duration: 0.6 }}>
          <span className="badge-terracotta" style={{ fontSize: '0.9rem', padding: '6px 20px' }}>{t.honors.badge}</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: '16px' }} className="text-gradient-gold">{t.honors.title}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>{t.honors.subtitle}</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {honorBoard.map((item, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.12 }}>
              <Tilt className="premium-card" tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.04} transitionSpeed={1500} glareEnable glareMaxOpacity={0.1} glarePosition="all" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '36px 24px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(197, 168, 128, 0.08)', border: '1.5px solid var(--primary-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', color: 'var(--primary-gold)' }}>
                  <Award size={36} />
                </div>
                <span className="badge-gold" style={{ fontSize: '0.75rem', marginBottom: '12px' }}>{item.badge}</span>
                <h4 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>{item.name}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.7' }}>{item.achievement}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-gold)', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <Calendar size={12} /> {item.date}
                </span>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ t }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="container" style={{ padding: '80px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' }}>
        <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
          <span className="badge-gold" style={{ fontSize: '0.9rem', padding: '6px 20px' }}>{t.contact.badge}</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: '16px', marginBottom: '20px' }} className="text-gradient-gold">{t.contact.title}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.8' }}>
            {t.contact.description}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(197, 168, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={20} style={{ color: 'var(--primary-gold)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>{t.contact.contactHours}</strong>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{t.contact.hoursValue}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }}>
          <form onSubmit={handleSubmit} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="contact-name" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.contact.nameLabel}</label>
              <input id="contact-name" name="name" type="text" placeholder={t.contact.namePlaceholder} required className="premium-input" autoComplete="name" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="contact-phone" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.contact.phoneLabel}</label>
              <input id="contact-phone" name="phone" type="tel" inputMode="tel" placeholder="+966…" required className="premium-input" style={{ direction: 'ltr', textAlign: 'right' }} autoComplete="tel" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="contact-message" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.contact.messageLabel}</label>
              <textarea id="contact-message" name="message" placeholder={t.contact.messagePlaceholder} rows="4" required className="premium-input" autoComplete="off" />
            </div>
            <button type="submit" className="btn-premium" style={{ justifyContent: 'center', marginTop: '10px' }} disabled={submitted}>
              {submitted ? t.contact.sentSuccess : <><Send size={18} /> {t.contact.sendButton}</>}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { t } = useAppContext();
  const [videoModal, setVideoModal] = useState({ open: false, video: null });

  return (
    <>
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <HeroSection t={t} />
        <AboutSection t={t} />
        <FeaturedTeachersSection />
        <SheikhsSection onVideoOpen={(v) => setVideoModal({ open: true, video: v })} t={t} />
        <HonorBoardSection t={t} />
        <ContactSection t={t} />
      </main>
      <VideoModal isOpen={videoModal.open} onClose={() => setVideoModal({ open: false, video: null })} video={videoModal.video} />
    </>
  );
}
