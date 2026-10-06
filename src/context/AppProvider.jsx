import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { translations, languages } from '../data/translations';
import { useI18n } from '../i18n';
import { isValidLocale, RTL_LOCALES } from '../lib/locale';

const AppContext = createContext();

// Default gamification and habits skeleton for new or legacy students
const defaultGamification = {
  points: 0,
  level: 'مبتدئ', // مبتدئ، باحث، قارئ، متقن
  streak: 0,
  badges: [],
  dailyHabits: {
    adhkar: false,
    werd: false,
    murajaah: false
  },
  activityData: [
    { name: 'السبت', points: 0 },
    { name: 'الأحد', points: 0 },
    { name: 'الإثنين', points: 0 },
    { name: 'الثلاثاء', points: 0 },
    { name: 'الأربعاء', points: 0 },
    { name: 'الخميس', points: 0 },
    { name: 'الجمعة', points: 0 }
  ]
};

export function AppProvider({ children }) {
  // LANGUAGE STATE — derive from I18nProvider only.
  // The legacy dictionary is retained for older Live UI copy until those keys are migrated.
  const { locale: currentLang, changeLocale } = useI18n();

  const changeLanguage = (nextLocale) => {
    if (isValidLocale(nextLocale)) {
      changeLocale(nextLocale);
    }
  };

  const t = translations[currentLang] || translations.en || translations.ar;
  const lang = languages[currentLang] || {
    code: currentLang,
    name: currentLang.toUpperCase(),
    dir: RTL_LOCALES.includes(currentLang) ? 'rtl' : 'ltr',
    flag: '🌐',
  };


  // DYNAMIC DATA PERSISTENCE (localStorage)
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from Azure Backend (via our Node.js API)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/students`);
        if (response.ok) {
          const data = await response.json();
          // Merge defaults in case backend data is old
          const mergedData = data.map(student => ({
            ...defaultGamification,
            ...student,
            dailyHabits: { ...defaultGamification.dailyHabits, ...(student.dailyHabits || {}) }
          }));
          setStudentsData(mergedData);
        } else {
          console.warn('Backend API not returning OK. Falling back to local storage.');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.warn('Backend API is offline. Falling back to local storage.', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem('academy_students');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStudentsData(parsed.map(student => ({
            ...defaultGamification,
            ...student,
            dailyHabits: { ...defaultGamification.dailyHabits, ...(student.dailyHabits || {}) }
          })));
        } catch (error) {
          console.error('Failed to parse localStorage data:', error);
          setStudentsData([]);
        }
      } else {
        setStudentsData([]);
      }
    };

    fetchStudents();
  }, []);

  // Sync to local storage as backup, and sync to backend API
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('academy_students', JSON.stringify(studentsData));
    }
  }, [studentsData, isLoading]);

  // LOGGED IN IDENTITY STATE
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);

  const handleStudentLogin = (id) => {
    setLoggedInStudentId(id);
  };

  const handleStudentLogout = () => {
    setLoggedInStudentId(null);
  };

  const updateStudentData = (id, updates) => {
    setStudentsData(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...updates };
      }
      return s;
    }));
  };

  const activeStudentProfile = studentsData.find(s => s.id === loggedInStudentId);

  return (
    <AppContext.Provider value={{
      studentsData,
      setStudentsData,
      loggedInStudentId,
      handleStudentLogin,
      handleStudentLogout,
      activeStudentProfile,
      updateStudentData,
      defaultGamification,
      currentLang,
      changeLanguage,
      t,
      lang,
      languages
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}