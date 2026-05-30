import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, Plus, Users, Calendar, Clock, Play, 
  Video, BookOpen, Trash2, Edit3, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../../components/Logo';
import Modal from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import { useAppContext } from '../../context/AppProvider';
import { API_BASE_URL } from '../../config';
import '../LiveRoom/LiveRoom.css';

export default function LiveSessions() {
  const navigate = useNavigate();
  const { t, activeStudentProfile } = useAppContext();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/live/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (roomId) => {
    const link = `${window.location.origin}/live/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const joinSession = (roomId, isHost = false) => {
    const name = activeStudentProfile?.name || 'مشارك';
    navigate(`/live/${roomId}?name=${encodeURIComponent(name)}&host=${isHost}`);
  };

  const deleteSession = async (roomId) => {
    if (!confirm(t.live.confirmDelete)) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/live/sessions/${roomId}`, {
        method: 'DELETE'
      });
      setSessions(prev => prev.filter(s => s.roomId !== roomId));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <div className="live-sessions-page">
      <header className="live-sessions-header">
        <div className="header-content">
          <div className="header-right">
            <Logo size={50} showText />
            <div className="header-info">
              <h1>{t.live.sessionsTitle}</h1>
              <p>{t.live.sessionsSubtitle}</p>
            </div>
          </div>
          <button 
            className="btn-premium create-session-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            {t.live.createSession}
          </button>
        </div>
      </header>

      <main className="live-sessions-main">
        {loading ? (
          <div className="loading-sessions">
            <div className="spinner spinner-lg"></div>
            <p>{t.common.loading}</p>
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Radio}
            title={t.live.noSessions}
            description={t.live.noSessionsDesc}
            action={
              <button 
                className="btn-premium"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                {t.live.createFirst}
              </button>
            }
          />
        ) : (
          <div className="sessions-grid">
            <AnimatePresence>
              {sessions.map((session, index) => (
                <motion.div
                  key={session.roomId}
                  className="session-card premium-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="session-status">
                    {session.isLive ? (
                      <span className="live-indicator">
                        <span className="live-dot"></span>
                        {t.live.live}
                      </span>
                    ) : (
                      <span className="scheduled-indicator">
                        <Clock size={14} />
                        {t.live.scheduled}
                      </span>
                    )}
                  </div>

                  <div className="session-icon">
                    <Video size={32} />
                  </div>

                  <h3 className="session-title">{session.title}</h3>
                  
                  {session.description && (
                    <p className="session-description">{session.description}</p>
                  )}

                  <div className="session-meta">
                    <div className="meta-item">
                      <BookOpen size={16} />
                      <span>{session.subject || t.live.general}</span>
                    </div>
                    <div className="meta-item">
                      <Users size={16} />
                      <span>{session.participants || 0} {t.live.participants}</span>
                    </div>
                    {session.scheduledAt && (
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>{new Date(session.scheduledAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </div>

                  <div className="session-actions">
                    <button 
                      className="btn-premium join-btn"
                      onClick={() => joinSession(session.roomId, session.isHost)}
                    >
                      <Play size={18} />
                      {session.isLive ? t.live.joinNow : t.live.enterRoom}
                    </button>
                    
                    <button 
                      className="btn-icon copy-btn"
                      onClick={() => copyLink(session.roomId)}
                      title={t.live.copyLink}
                    >
                      {copiedId === session.roomId ? <Check size={18} /> : <Copy size={18} />}
                    </button>

                    <button 
                      className="btn-icon delete-btn"
                      onClick={() => deleteSession(session.roomId)}
                      title={t.common.delete}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <CreateSessionModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(session) => {
          setSessions(prev => [session, ...prev]);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

function CreateSessionModal({ isOpen, onClose, onCreated }) {
  const { t } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/live/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, subject })
      });

      if (response.ok) {
        const session = await response.json();
        onCreated(session);
        setTitle('');
        setDescription('');
        setSubject('');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="create-session-modal">
        <h2 className="text-gradient-gold">{t.live.createSession}</h2>
        <p className="modal-subtitle">{t.live.createSessionDesc}</p>

        <form onSubmit={handleCreate} className="session-form">
          <div className="form-group">
            <label>{t.live.sessionTitle}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.live.sessionTitlePlaceholder}
              className="premium-input"
              required
            />
          </div>

          <div className="form-group">
            <label>{t.live.sessionSubject}</label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="premium-input"
            >
              <option value="">{t.live.selectSubject}</option>
              <option value="quran">{t.live.subjects.quran}</option>
              <option value="tajweed">{t.live.subjects.tajweed}</option>
              <option value="tafseer">{t.live.subjects.tafseer}</option>
              <option value="hadith">{t.live.subjects.hadith}</option>
              <option value="fiqh">{t.live.subjects.fiqh}</option>
              <option value="arabic">{t.live.subjects.arabic}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t.live.sessionDescription}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.live.sessionDescriptionPlaceholder}
              className="premium-input"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-premium-outline"
              onClick={onClose}
            >
              {t.common.cancel}
            </button>
            <button 
              type="submit" 
              className="btn-premium"
              disabled={creating || !title.trim()}
            >
              {creating ? t.common.loading : (
                <>
                  <Radio size={18} />
                  {t.live.startSession}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
