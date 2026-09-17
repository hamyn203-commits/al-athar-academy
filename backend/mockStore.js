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

module.exports = {
  addMockUser,
  findMockUserByEmail,
  findMockUserById,
  updateMockUser,
};
