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

module.exports = {
  addMockUser,
  findMockUserByEmail,
  findMockUserById,
  updateMockUser,
  addMockTeacher,
  findMockTeacherByUserId,
  getMockTeachers,
  tasks,
  withdrawals,
};

