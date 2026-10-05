const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const DEFAULT_JWT_SECRET = 'wahy-namaa-dev-access-secret-change-me';
const DEFAULT_REFRESH_SECRET = 'wahy-namaa-dev-refresh-secret-change-me';

if (process.env.NODE_ENV === 'production') {
  const invalidAccess = !JWT_SECRET || JWT_SECRET === 'change-me-in-production';
  const invalidRefresh = !JWT_REFRESH_SECRET || JWT_REFRESH_SECRET === 'change-me-in-production';

  if (invalidAccess || invalidRefresh) {
    console.error('❌ FATAL: JWT_SECRET and JWT_REFRESH_SECRET must both be strong production secrets.');
    process.exit(1);
  }
}

const accessSecret = () => JWT_SECRET || DEFAULT_JWT_SECRET;
const refreshSecret = () => JWT_REFRESH_SECRET || DEFAULT_REFRESH_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role
    },
    accessSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id },
    refreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, accessSecret());
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    req.refreshToken = jwt.verify(refreshToken, refreshSecret());
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const attachTeacherProfile = async (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (teacher) req.user.teacherProfile = teacher._id;
  }
  next();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  requireRole,
  attachTeacherProfile,
  protect: verifyAccessToken,
  authorize: requireRole
};
