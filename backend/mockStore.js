const users = [];

function addMockUser(user) {
  const existing = findMockUserByEmail(user.email);
  if (existing) return existing;
  const newUser = {
    ...user,
    _id: user._id || `mock-${Date.now()}`,
    id: user.id || user._id || `mock-${Date.now()}`,
    role: user.role || 'student',
    isActive: user.isActive !== undefined ? user.isActive : true,
  };
  users.push(newUser);
  return newUser;
}

function findMockUserByEmail(email) {
  if (!email) return null;
  return users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
}

function findMockUserById(id) {
  if (!id) return null;
  return users.find((user) => user._id === id || user.id === id);
}

function updateMockUser(id, updates) {
  const user = findMockUserById(id);
  if (!user) return null;
  Object.assign(user, updates);
  return user;
}

const teachers = [];
const tasks = [];
const withdrawals = [];
const guardianChildren = new Map();

function addMockTeacher(teacher) {
  const existingIndex = teachers.findIndex((t) => t.user === teacher.user || t.user?._id === teacher.user);
  if (existingIndex >= 0) {
    teachers[existingIndex] = { ...teachers[existingIndex], ...teacher };
    return teachers[existingIndex];
  }
  const newT = {
    _id: teacher._id || `mock-teacher-${Date.now()}`,
    id: teacher.id || `mock-teacher-${Date.now()}`,
    status: teacher.status || 'approved',
    isVerified: true,
    rating: { average: 4.9, count: 18 },
    hourlyRate: 50,
    wallet: { pendingEarnings: 850, totalWithdrawn: 3400 },
    ...teacher,
  };
  teachers.push(newT);
  return newT;
}

function findMockTeacherByUserId(userId) {
  if (!userId) return null;
  return teachers.find((t) => t.user === userId || t.user?._id === userId || t.user?.id === userId);
}

function getMockTeachers() {
  return teachers;
}

function getMockGuardianChildren(guardianUserId) {
  if (!guardianChildren.has(guardianUserId)) {
    // Seed default sample child for newly registered guardian
    guardianChildren.set(guardianUserId, [
      {
        studentId: 'mock-child-1',
        name: 'عبد الله أحمد',
        email: 'abdallah@student.athar.com',
        phone: '+201012345678',
        avatar: null,
        relationship: 'father',
        permissions: { viewProgress: true, viewGrades: true, viewAttendance: true, receiveNotifications: true },
        circle: {
          _id: 'mock-circle-1',
          name: 'حلقة الإمام قالون (بنين - مبتدئ)',
          level: 'beginner',
          schedule: 'السبت والإثنين والأربعاء 05:00 م',
          capacity: 10
        },
        studentProfile: {
          plan: 'حفظ جزء عم وتبارك',
          currentSurah: 'سورة الملك',
          points: 420,
          streak: 7,
          level: 'مبتدئ'
        },
        attendance: {
          rate: 92,
          total: 12,
          attended: 11,
          excused: 1,
          absent: 0
        },
        latestEvaluation: {
          memorizationScore: 9.5,
          tajweedScore: 9,
          surahRecited: 'الملك',
          fromAyah: 1,
          toAyah: 15,
          nextHomework: 'حفظ من آية 16 إلى 30 مع المراجعة',
          notes: 'ما شاء الله تبارك الله، تميز واضح في مخارج الحروف وأحكام القلقلة',
          date: new Date(Date.now() - 86400000)
        },
        coursesProgress: [
          { courseTitle: 'أحكام النون الساكنة والتنوين', percentage: 75 }
        ]
      }
    ]);
  }
  return guardianChildren.get(guardianUserId);
}

function addMockGuardianChild(guardianUserId, childData) {
  const current = getMockGuardianChildren(guardianUserId);
  const newChild = {
    studentId: childData.studentId || `mock-child-${Date.now()}`,
    name: childData.name || 'طالب جديد',
    email: childData.email || 'newchild@example.com',
    phone: childData.phone || '',
    avatar: null,
    relationship: childData.relationship || 'guardian',
    permissions: { viewProgress: true, viewGrades: true, viewAttendance: true, receiveNotifications: true },
    circle: {
      _id: 'mock-circle-2',
      name: 'حلقة الإمام عاصم (تحفيظ مكثف)',
      level: 'intermediate',
      schedule: 'الأحد والثلاثاء والخميس 06:00 م',
      capacity: 10
    },
    studentProfile: {
      plan: 'تحفيظ جزء عم',
      currentSurah: 'سورة النبأ',
      points: 100,
      streak: 1,
      level: 'مبتدئ'
    },
    attendance: { rate: 100, total: 1, attended: 1, excused: 0, absent: 0 },
    latestEvaluation: {
      memorizationScore: 10,
      tajweedScore: 9,
      surahRecited: 'النبأ',
      fromAyah: 1,
      toAyah: 10,
      nextHomework: 'حفظ الآيات 11 إلى 20',
      notes: 'بداية ممتازة ومبشرة',
      date: new Date()
    },
    coursesProgress: []
  };
  current.push(newChild);
  guardianChildren.set(guardianUserId, current);
  return newChild;
}

module.exports = {
  addMockUser,
  findMockUserByEmail,
  findMockUserById,
  updateMockUser,
  addMockTeacher,
  findMockTeacherByUserId,
  getMockTeachers,
  getMockGuardianChildren,
  addMockGuardianChild,
  tasks,
  withdrawals,
};

