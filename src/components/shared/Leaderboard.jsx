import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppProvider';

export default function Leaderboard({ users, currentUser, limit = 10 }) {
  const { t } = useAppContext();
  
  const sortedUsers = [...users]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, limit);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} style={{ color: '#FFD700' }} />;
    if (rank === 2) return <Medal size={24} style={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <Medal size={24} style={{ color: '#CD7F32' }} />;
    return <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>#{rank}</span>;
  };

  return (
    <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, var(--primary-gold-dark), var(--clay-terracotta))',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Trophy size={28} />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
          {t.leaderboard?.title || 'لوحة المتصدرين'}
        </h3>
      </div>

      <div style={{ padding: '16px' }}>
        {sortedUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)'
          }}>
            <Award size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>{t.leaderboard?.noData || 'لا توجد بيانات بعد'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedUsers.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = currentUser && user.id === currentUser.id;
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    background: isCurrentUser ? 'rgba(166, 132, 83, 0.1)' : 'var(--bg-elevated)',
                    border: isCurrentUser ? '2px solid var(--primary-gold)' : '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getRankIcon(rank)}
                  </div>

                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--primary-gold)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    {user.name?.charAt(0) || '؟'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.name}
                      {isCurrentUser && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          color: 'var(--primary-gold)',
                          fontWeight: '600'
                        }}>
                          ({t.leaderboard?.you || 'أنت'})
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: '2px'
                    }}>
                      {user.level || t.leaderboard?.student || 'طالب'}
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'left',
                    flexShrink: 0
                  }}>
                    <div style={{
                      fontWeight: '800',
                      fontSize: '1.1rem',
                      color: 'var(--primary-gold-dark)'
                    }}>
                      {user.points || 0}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {t.student?.points || 'نقطة'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
