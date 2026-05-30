import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';
import { translations, languages } from '../data/translations';

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
  // LANGUAGE STATE
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('academy_lang');
    return saved && languages[saved] ? saved : 'ar';
  });

  const changeLanguage = (lang) => {
    if (languages[lang]) {
      setCurrentLang(lang);
      localStorage.setItem('academy_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = languages[lang].dir;
    }
  };

  const t = translations[currentLang];
  const lang = languages[currentLang];

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = languages[currentLang].dir;
  }, [currentLang]);

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

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  return useContext(AppContext);
}
