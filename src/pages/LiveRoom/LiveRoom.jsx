import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
  useParticipants,
  useTracks,
  TrackToggle,
  DisconnectButton
} from '@livekit/components-react';
import '@livekit/components-styles';
import './LiveRoom.css';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  PhoneOff, Users, MessageSquare, Send, X, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../../components/Logo';
import { useAppContext } from '../../context/AppProvider';
import { API_BASE_URL } from '../../config';

function LiveRoomContent({ isHost }) {
  const { t } = useAppContext();
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const participants = useParticipants();
  const room = useRoomContext();
  const localParticipant = useLocalParticipant();

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload, participant) => {
      try {
        const message = JSON.parse(new TextDecoder().decode(payload));
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: participant?.name || 'Unknown',
          text: message.text,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => room.off('dataReceived', handleDataReceived);
  }, [room]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !localParticipant.localParticipant) return;

    const messageData = {
      text: newMessage,
      timestamp: Date.now()
    };

    try {
      await localParticipant.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(messageData)),
        { reliable: true }
      );

      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'أنا',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        isMe: true
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="live-room-container">
      <div className="live-room-header">
        <div className="live-room-header-right">
          <Logo size={40} showText />
          <div className="live-room-info">
            <h2>{t.live.title}</h2>
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
        <div className="live-room-header-left">
          <button 
            className={`chat-toggle-btn ${showChat ? 'active' : ''}`}
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare size={20} />
            {chatMessages.length > 0 && (
              <span className="chat-badge">{chatMessages.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="live-room-main">
        <div className="video-area">
          <VideoConference />
          <RoomAudioRenderer />
        </div>

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
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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

      <div className="live-room-controls">
        <div className="controls-group">
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

  const isHost = searchParams.get('host') === 'true';
  const participantName = searchParams.get('name') || 'مشارك';

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
            isHost
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
  }, [roomId, participantName, isHost]);

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
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      onDisconnected={() => navigate('/')}
    >
      <LiveRoomContent isHost={isHost} />
    </LiveKitRoom>
  );
}
