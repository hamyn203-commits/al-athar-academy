export const ACHIEVEMENTS = {
  FIRST_STEPS: {
    id: 'first_steps',
    name: 'الخطوات الأولى',
    description: 'أكمل أول درس في الأكاديمية',
    icon: '🎯',
    points: 50,
    category: 'learning'
  },
  DEDICATED_LEARNER: {
    id: 'dedicated_learner',
    name: 'المتعلم الملتزم',
    description: 'سجل دخول 7 أيام متتالية',
    icon: '🔥',
    points: 100,
    category: 'consistency'
  },
  QURAN_MEMORIZER: {
    id: 'quran_memorizer',
    name: 'حافظ القرآن',
    description: 'احفظ جزء عم كاملاً',
    icon: '📖',
    points: 500,
    category: 'memorization'
  },
  TAJWEED_MASTER: {
    id: 'tajweed_master',
    name: 'متقن التجويد',
    description: 'اجتز اختبار التجويد بتقدير ممتاز',
    icon: '🎓',
    points: 300,
    category: 'skills'
  },
  HELPFUL_STUDENT: {
    id: 'helpful_student',
    name: 'الطالب المساعد',
    description: 'ساعد 10 طلاب آخرين في المنتدى',
    icon: '🤝',
    points: 200,
    category: 'community'
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'العلامة الكاملة',
    description: 'احصل على 100% في أي اختبار',
    icon: '💯',
    points: 150,
    category: 'academic'
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'الطائر المبكر',
    description: 'سجل دخول قبل الساعة 6 صباحاً',
    icon: '🌅',
    points: 30,
    category: 'consistency'
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'بومة الليل',
    description: 'ادرس بعد الساعة 10 مساءً',
    icon: '🦉',
    points: 30,
    category: 'consistency'
  },
  MARATHON_LEARNER: {
    id: 'marathon_learner',
    name: 'متعلم الماراثون',
    description: 'ادرس لمدة 3 ساعات متواصلة',
    icon: '🏃',
    points: 200,
    category: 'dedication'
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'الفراشة الاجتماعية',
    description: 'انضم إلى 5 حصص مباشرة',
    icon: '🦋',
    points: 150,
    category: 'community'
  }
};

export const LEVELS = [
  { level: 1, name: 'مبتدئ', minPoints: 0, icon: '🌱' },
  { level: 2, name: 'متعلم', minPoints: 100, icon: '📚' },
  { level: 3, name: 'مجتهد', minPoints: 500, icon: '💪' },
  { level: 4, name: 'متقدم', minPoints: 1000, icon: '⭐' },
  { level: 5, name: 'خبير', minPoints: 2500, icon: '🏆' },
  { level: 6, name: 'محترف', minPoints: 5000, icon: '👑' },
  { level: 7, name: 'أسطورة', minPoints: 10000, icon: '🌟' }
];

export function getCurrentLevel(points) {
  return LEVELS.reduce((current, level) => {
    return points >= level.minPoints ? level : current;
  }, LEVELS[0]);
}

export function getNextLevel(points) {
  const currentLevel = getCurrentLevel(points);
  return LEVELS.find(level => level.level === currentLevel.level + 1);
}

export function getLevelProgress(points) {
  const currentLevel = getCurrentLevel(points);
  const nextLevel = getNextLevel(points);
  
  if (!nextLevel) return 100;
  
  const pointsInCurrentLevel = points - currentLevel.minPoints;
  const pointsNeededForNextLevel = nextLevel.minPoints - currentLevel.minPoints;
  
  return Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100));
}

export function checkAchievements(userStats) {
  const unlocked = [];
  
  if (userStats.completedLessons >= 1) {
    unlocked.push(ACHIEVEMENTS.FIRST_STEPS);
  }
  
  if (userStats.loginStreak >= 7) {
    unlocked.push(ACHIEVEMENTS.DEDICATED_LEARNER);
  }
  
  if (userStats.perfectScores >= 1) {
    unlocked.push(ACHIEVEMENTS.PERFECT_SCORE);
  }
  
  if (userStats.liveSessionsJoined >= 5) {
    unlocked.push(ACHIEVEMENTS.SOCIAL_BUTTERFLY);
  }
  
  return unlocked;
}

export function getLeaderboardRank(users, currentUserPoints) {
  const sorted = [...users].sort((a, b) => b.points - a.points);
  const rank = sorted.findIndex(user => user.points <= currentUserPoints) + 1;
  return rank || sorted.length + 1;
}
