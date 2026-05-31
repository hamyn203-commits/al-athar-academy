import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export function useGamificationApi() {
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState({ unlocked: [], locked: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, badgesData, lbData] = await Promise.all([
        api.get('/api/gamification/stats', { auth: true }),
        api.get('/api/gamification/my-badges', { auth: true }),
        api.get('/api/gamification/leaderboard/points/all-time', { auth: true }).catch(() => ({ entries: [] })),
      ]);
      setStats(statsData);
      setBadges(badgesData);
      setLeaderboard(lbData.entries || lbData.leaderboard?.entries || []);
    } catch {
      setStats({ points: { total: 0, level: 1, pointsToNextLevel: 100 }, badges: { unlocked: 0, total: 0 }, streaks: { current: 0, longest: 0 } });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, badges, leaderboard, loading, reload: load };
}
