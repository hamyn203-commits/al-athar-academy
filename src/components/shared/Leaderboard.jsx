import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppProvider';

export default function Leaderboard({ users, currentUser, limit = 10 }) {
  const { t } = useAppContext();
  
  const sortedUsers = [...users]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, limit);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} style={{ color: '#d4a843' }} />;
    if (rank === 2) return <Medal size={24} style={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <Medal size={24} style={{ color: '#CD7F32' }} />;
    return <span style={{ fontWeight: '700', color: 'var(--athar-text-muted)' }}>#{rank}</span>;
  };

  return (
    <div className="azhar-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* ═══ Header أزهري ═══ */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, var(--azhar-green-deep), var(--azhar-green))',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div className="w-10 h-10 rounded-full bg-[var(--azhar-gold-leaf)]/20 flex items-center justify-center">
          <Trophy size={24} className="text-[var(--azhar-gold-leaf)]" />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Amiri, serif' }}>
          {t.leaderboard?.title || 'لوحة المتصدرين'}
        </h3>
      </div>

      <div style={{ padding: '16px' }}>
        {sortedUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--athar-text-muted)'
          }}>
            <Award size={48} style={{ opacity: 0.3, marginBottom: '12px', color: 'var(--azhar-gold-leaf)' }} />
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
                    background: isCurrentUser ? 'rgba(212, 168, 67, 0.08)' : 'var(--athar-surface)',
                    border: isCurrentUser ? '2px solid var(--azhar-gold-leaf)' : '1px solid var(--athar-cream-dark)',
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
                    background: 'linear-gradient(135deg, var(--azhar-green), var(--azhar-green-deep))',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(20, 83, 45, 0.2)'
                  }}>
                    {user.name?.charAt(0) || '؟'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      color: 'var(--athar-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.name}
                      {isCurrentUser && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          color: 'var(--azhar-gold-leaf)',
                          fontWeight: '600'
                        }}>
                          ({t.leaderboard?.you || 'أنت'})
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--athar-text-muted)',
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
                      color: 'var(--azhar-gold-dark)',
                      fontFamily: 'Amiri, serif'
                    }}>
                      {user.points || 0}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--athar-text-muted)'
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
