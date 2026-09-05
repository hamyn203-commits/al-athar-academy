/**
 * In-memory user store used only when MONGODB_URI is absent (Mock Mode).
 *
 * Mock Mode exists so the frontend can be developed without a database. It is
 * process-local and NOT persisted — every restart starts empty. `server.js`
 * refuses to boot in Mock Mode when NODE_ENV=production.
 *
 * Records intentionally mimic the shape of a Mongoose User document so the
 * route handlers in routes/auth.js can treat both paths uniformly.
 */

const users = new Map();

/**
 * The auth routes return the user object straight into the HTTP response.
 * Defining `password` as non-enumerable keeps `user.password === password`
 * working for the mock login check while keeping it out of JSON.stringify,
 * so the plaintext password can never leak into an API response.
 */
const toRecord = ({ password, ...rest }) => {
  const record = { ...rest };
  Object.defineProperty(record, 'password', {
    value: password,
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return record;
};

const normaliseEmail = (email) => String(email || '').trim().toLowerCase();

const addMockUser = (user) => {
  const id = user._id || user.id || `mock-${Date.now()}`;
  const record = toRecord({
    ...user,
    _id: id,
    id,
    email: normaliseEmail(user.email),
    createdAt: user.createdAt || new Date(),
  });
  users.set(id, record);
  return record;
};

const findMockUserByEmail = (email) => {
  const target = normaliseEmail(email);
  for (const user of users.values()) {
    if (user.email === target) return user;
  }
  return null;
};

const findMockUserById = (id) => users.get(String(id)) || null;

const updateMockUser = (id, updates = {}) => {
  const existing = users.get(String(id));
  if (!existing) return null;

  // Never let an update change identity fields.
  const { _id, id: _ignoredId, ...safeUpdates } = updates;

  if (Object.prototype.hasOwnProperty.call(safeUpdates, 'password')) {
    existing.password = safeUpdates.password;
    delete safeUpdates.password;
  }
  if (safeUpdates.email) safeUpdates.email = normaliseEmail(safeUpdates.email);

  Object.assign(existing, safeUpdates);
  return existing;
};

const clearMockUsers = () => users.clear();

module.exports = {
  addMockUser,
  findMockUserByEmail,
  findMockUserById,
  updateMockUser,
  clearMockUsers,
};
