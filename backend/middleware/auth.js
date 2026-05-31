const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (process.env.NODE_ENV === 'production' && (!JWT_SECRET || JWT_SECRET === 'change-me-in-production')) {
  console.error('❌ FATAL: JWT_SECRET is missing or default. Set a strong secret in production!');
  process.exit(1);
}

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET || 'dev-only-fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET || 'dev-only-fallback-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    );
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ 
      error: 'Refresh token is required' 
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production'
    );
    req.refreshToken = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired refresh token' 
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token, 
      JWT_SECRET || 'dev-only-fallback-secret'
    );
    req.user = decoded;
  } catch (error) {
    // Token invalid but we continue without user
  }

  next();
};

const attachTeacherProfile = async (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (teacher) {
      req.user.teacherProfile = teacher._id;
    }
  }
  next();
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  requireRole,
  optionalAuth,
  attachTeacherProfile,
  protect: verifyAccessToken,
  authorize: requireRole
};
