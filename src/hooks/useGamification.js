import { useCallback } from 'react';

const LEVELS = [
  { min: 0, name: 'مبتدئ' },
  { min: 200, name: 'باحث' },
  { min: 500, name: 'قارئ' },
  { min: 1000, name: 'متقن' },
];

function getLevel(points) {
  let level = LEVELS[0].name;
  for (const l of LEVELS) {
    if (points >= l.min) level = l.name;
  }
  return level;
}

export function useGamification(activeStudentProfile, updateStudentData, defaultGamification) {
  const awardPoints = useCallback((pointsToAdd) => {
    if (!activeStudentProfile) return;

    const newPoints = (activeStudentProfile.points || 0) + pointsToAdd;
    const newLevel = getLevel(newPoints);

    const todayIndex = new Date().getDay();
    const mappedDay = todayIndex === 6 ? 0 : todayIndex + 1;

    const newActivityData = [...(activeStudentProfile.activityData || defaultGamification.activityData)];
    newActivityData[mappedDay] = {
      ...newActivityData[mappedDay],
      points: newActivityData[mappedDay].points + pointsToAdd,
    };

    updateStudentData(activeStudentProfile.id, {
      points: newPoints,
      level: newLevel,
      activityData: newActivityData,
    });
  }, [activeStudentProfile, updateStudentData, defaultGamification]);

  const toggleHabit = useCallback((habitKey) => {
    if (!activeStudentProfile) return;
    const currentHabits = activeStudentProfile.dailyHabits || defaultGamification.dailyHabits;
    const isCompleted = !currentHabits[habitKey];

    updateStudentData(activeStudentProfile.id, {
      dailyHabits: { ...currentHabits, [habitKey]: isCompleted },
    });

    if (isCompleted) {
      awardPoints(20, 'إتمام مهمة يومية');
    } else {
      updateStudentData(activeStudentProfile.id, {
        points: Math.max(0, (activeStudentProfile.points || 0) - 20),
      });
    }
  }, [activeStudentProfile, updateStudentData, defaultGamification, awardPoints]);

  return { awardPoints, toggleHabit, getLevel };
}
