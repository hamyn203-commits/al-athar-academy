import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
  useParticipants,
  TrackToggle,
  DisconnectButton
} from '@livekit/components-react';
import '@livekit/components-styles';
import './LiveRoom.css';
import '../../components/classroom/classroom.css';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  PhoneOff, Users, MessageSquare, Send, X, ArrowRight, 
  Languages, BookOpen, Shield, Sparkles, AlertTriangle, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../../components/Logo';
import { useAppContext } from '../../context/AppProvider';
import { API_BASE_URL } from '../../config';
import { LangSelect } from '../../components/live/SessionTranslateChat';
import { translateText } from '../../lib/translateApi';
import { detectBrowserLocale } from '../../lib/locale';
import SyncedMushaf from '../../components/classroom/SyncedMushaf';
import CircleTurnManager from '../../components/classroom/CircleTurnManager';
import { inspectMessage } from '../../components/classroom/ChatSafetyFilter';

function LiveRoomContent({ isHost, isObserver, participantName, roomId }) {
  const { t } = useAppContext();
  
  // شاشات الفصل الذكي (المصحف المتزامن / حلقة الـ 10 طلاب / شبكة الكاميرات)
  const [activeTab, setActiveTab] = useState('mushaf'); // 'mushaf' | 'circle' | 'video'

  // حالة الشات
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [safetyWarning, setSafetyWarning] = useState(null);

  // الترجمة الفورية
  const [myLang, setMyLang] = useState(detectBrowserLocale());
  const [partnerLang, setPartnerLang] = useState(myLang === 'ar' ? 'id' : 'ar');
  const [autoTranslate, setAutoTranslate] = useState(true);

  // LiveKit hooks
  const participants = useParticipants();
  const room = useRoomContext();
  const localParticipant = useLocalParticipant();

  const addMessage = useCallback(async (text, sender, isMe, lang) => {
    let displayText = text;
    let original = null;
    if (autoTranslate && lang && lang !== myLang) {
      try {
        displayText = await translateText(text, lang, myLang);
        original = text;
      } catch { /* keep original */ }
    }
    setChatMessages((prev) => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      sender,
      text: displayText,
      original,
      lang,
      timestamp: new Date().toLocaleTimeString(),
      isMe,
    }]);
  }, [autoTranslate, myLang]);

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = async (payload, participant) => {
      try {
        const raw = new TextDecoder().decode(payload);
        const message = JSON.parse(raw);

        // تصفية أحداث المزامنة للمصحف والحلقة لمنع تداخلها مع الشات
        if (message.type === 'MUSHAF_ACTION' || message.type === 'CIRCLE_ACTION') {
          return;
        }

        if (message.text) {
          await addMessage(
            message.text,
            participant?.name || 'Unknown',
            false,
            message.lang || 'ar'
          );
        }
      } catch (e) {
        console.error('Failed to parse incoming message:', e);
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => room.off('dataReceived', handleDataReceived);
  }, [room, myLang, autoTranslate, addMessage]);

  // إرسال رسالة شات آمنة مع فحص الشات الأخلاقي
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !localParticipant.localParticipant) return;

    // فحص الأمان الأخلاقي وحظر أرقام الهواتف والروابط والبريد
    const inspection = inspectMessage(newMessage);
    if (!inspection.isSafe) {
      setSafetyWarning(inspection.warning);
      return;
    }

    setSafetyWarning(null);

    const messageData = {
      type: 'chat',
      text: newMessage,
      lang: myLang,
      timestamp: Date.now(),
    };

    try {
      await localParticipant.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(messageData)),
        { reliable: true }
      );

      setChatMessages((prev) => [...prev, {
        id: Date.now(),
        sender: 'أنا',
        text: newMessage,
        lang: myLang,
        timestamp: new Date().toLocaleTimeString(),
        isMe: true,
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="live-room-container">
      {/* ── شريط وضع المراقب الصامت (ولي أمر / مشرف) ── */}
      {isObserver && (
        <div className="observer-banner">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-amber-300" />
            <span>
              أهلاً بك في وضع المراقب الصامت. تم إغلاق الكاميرا والمايكروفون تلقائياً لضمان خصوصيتك وهدوء الحلقة القرآنية.
            </span>
          </div>
          <span className="observer-badge">
            <Eye size={12} />
            استماع ومشاهدة فقط
          </span>
        </div>
      )}

      {/* ── رأس الغرفة المباشرة ── */}
      <div className="live-room-header">
        <div className="live-room-header-right">
          <Logo size={40} showText />
          <div className="live-room-info">
            <div className="flex items-center gap-2">
              <h2>{t.live.title}</h2>
              {isObserver ? (
                <span className="observer-badge">
                  <Shield size={12} />
                  مراقب / ولي أمر
                </span>
              ) : isHost ? (
                <span className="teacher-badge">
                  <Sparkles size={12} />
                  الشيخ المعلم
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                  طالب
                </span>
              )}
            </div>
            <div className="live-room-stats">
              <span className="live-badge">
                <span className="live-dot"></span>
                {t.live.live}
              </span>
              <span className="participants-count">
                <Users size={16} />
                {participants.length} {t.live.participants}
              </span>
            </div>
          </div>
        </div>

        {/* أزرار تبديل وجهة الفصل (المصحف / الحلقة / الكاميرات) */}
        <div className="live-room-tabs">
          <button
            className={`room-tab-btn ${activeTab === 'mushaf' ? 'active' : ''}`}
            onClick={() => setActiveTab('mushaf')}
          >
            <BookOpen size={16} />
            <span>المصحف المتزامن</span>
          </button>
          <button
            className={`room-tab-btn ${activeTab === 'circle' ? 'active' : ''}`}
            onClick={() => setActiveTab('circle')}
          >
            <Users size={16} />
            <span>حلقة الـ 10 طلاب</span>
          </button>
          <button
            className={`room-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <Video size={16} />
            <span>شبكة الكاميرات</span>
          </button>
        </div>

        <div className="live-room-header-left">
          <button 
            className={`chat-toggle-btn ${showChat ? 'active' : ''}`}
            onClick={() => setShowChat(!showChat)}
            title="المحادثة الفورية"
          >
            <MessageSquare size={20} />
            {chatMessages.length > 0 && (
              <span className="chat-badge">{chatMessages.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── جسم الغرفة الرئيسي ── */}
      <div className="live-room-main">
        {/* العرض المختار */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-900">
          {activeTab === 'mushaf' && (
            <div className="w-full h-full p-2 flex flex-col">
              <SyncedMushaf
                room={room}
                localParticipant={localParticipant}
                isTeacher={isHost}
                isObserver={isObserver}
              />
            </div>
          )}

          {activeTab === 'circle' && (
            <div className="w-full h-full p-3 flex flex-col overflow-y-auto">
              <CircleTurnManager
                room={room}
                localParticipant={localParticipant}
                participants={participants}
                isTeacher={isHost}
                isObserver={isObserver}
                currentUserName={participantName}
              />
            </div>
          )}

          {activeTab === 'video' && (
            <div className="video-area">
              <VideoConference />
            </div>
          )}

          {/* مشغّل الصوت المشترك للغرفة دائماً مفعل للاستماع */}
          <RoomAudioRenderer />
        </div>

        {/* ── لوحة الشات الجانبية مع فلتر الأمان الأخلاقي ── */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              className="chat-panel"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="chat-header">
                <h3>{t.live.chat}</h3>
                <button onClick={() => setShowChat(false)} className="chat-close-btn">
                  <X size={20} />
                </button>
              </div>

              {/* ترجمة فورية */}
              <div className="p-3 border-b bg-emerald-50/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
                  <Languages size={14} /> ترجمة فورية
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LangSelect label="لغتي" value={myLang} onChange={setMyLang} isAr />
                  <LangSelect label="ترجم إلى" value={partnerLang} onChange={setPartnerLang} isAr />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)} />
                  ترجمة تلقائية للرسائل الواردة
                </label>
              </div>
              
              {/* الرسائل */}
              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <div className="chat-empty">
                    <MessageSquare size={48} />
                    <p>{t.live.noMessages}</p>
                  </div>
                ) : (
                  chatMessages.map(msg => (
                    <div key={msg.id} className={`chat-message ${msg.isMe ? 'mine' : ''}`}>
                      <div className="message-header">
                        <span className="sender-name">{msg.sender}</span>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                      <p className="message-text">{msg.text}</p>
                      {msg.original && msg.original !== msg.text && (
                        <p className="text-xs text-gray-400 mt-1 italic">{msg.original}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* تنبيه فلتر الأمان الأخلاقي اللحظي */}
              {safetyWarning && (
                <div className="p-3 bg-red-50 border-t border-red-200 text-red-900 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold mb-0.5">تنبيه خصوصية وسلامة الغرفة:</p>
                    <p>{safetyWarning}</p>
                  </div>
                  <button 
                    onClick={() => setSafetyWarning(null)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* إدخال الرسالة */}
              <form className="chat-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (safetyWarning) setSafetyWarning(null);
                  }}
                  placeholder={t.live.typeMessage}
                  className="chat-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── أشرطة التحكم السفلية ── */}
      <div className="live-room-controls">
        <div className="controls-group">
          {/* وضع المراقب: أزرار الصوت والكاميرا مغلقة تماماً */}
          {isObserver ? (
            <div className="observer-media-locked" title="الكاميرا والمايك مغلقان في وضع المراقب الصامت">
              <div className="observer-lock-pill">
                <MicOff size={18} className="text-red-400" />
                <VideoOff size={18} className="text-red-400" />
                <span>وضع المراقب الصامت (مشاهدة فقط)</span>
              </div>
            </div>
          ) : (
            <>
              <TrackToggle source="microphone">
                {(isEnabled) => isEnabled ? <Mic size={24} /> : <MicOff size={24} />}
              </TrackToggle>
              
              <TrackToggle source="camera">
                {(isEnabled) => isEnabled ? <Video size={24} /> : <VideoOff size={24} />}
              </TrackToggle>

              {isHost && (
                <TrackToggle source="screen_share">
                  {(isEnabled) => isEnabled ? <Monitor size={24} /> : <MonitorOff size={24} />}
                </TrackToggle>
              )}
            </>
          )}
        </div>

        <DisconnectButton>
          <PhoneOff size={24} />
          <span>{t.live.leave}</span>
        </DisconnectButton>
      </div>
    </div>
  );
}

export default function LiveRoom() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useAppContext();
  
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // استخراج الصلاحيات والدور من الرابط
  const isHost = searchParams.get('host') === 'true' || searchParams.get('teacher') === 'true';
  const roleParam = searchParams.get('role');
  const isObserver = roleParam === 'guardian' || roleParam === 'supervisor' || roleParam === 'observer' || searchParams.get('observer') === 'true';
  const participantName = searchParams.get('name') || (isObserver ? 'مراقب أكاديمي' : isHost ? 'الشيخ المعلم' : 'طالب');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/live/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomId,
            participantName,
            isHost: isHost && !isObserver
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get token');
        }

        const data = await response.json();
        setToken(data.token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchToken();
    }
  }, [roomId, participantName, isHost, isObserver]);

  if (loading) {
    return (
      <div className="live-room-loading">
        <Logo size={80} showText={false} />
        <div className="spinner spinner-lg"></div>
        <p>{t.live.connecting}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-room-error">
        <Logo size={80} showText={false} />
        <h2>{t.live.error}</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn-premium">
          <ArrowRight size={20} />
          {t.common.backHome}
        </button>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  const serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://your-livekit-server.livekit.cloud';

  return (
    <LiveKitRoom
      video={!isObserver}
      audio={!isObserver}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      onDisconnected={() => navigate('/')}
    >
      <LiveRoomContent 
        isHost={isHost} 
        isObserver={isObserver}
        participantName={participantName}
        roomId={roomId}
      />
    </LiveKitRoom>
  );
}
