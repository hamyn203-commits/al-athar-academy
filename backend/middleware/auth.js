const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProduction = process.env.NODE_ENV === 'production';

// Single source of truth for the signing secrets. Both the sign and the verify
// paths MUST read these constants — never inline a fallback string, otherwise
// tokens get signed with one secret and verified with another.
const DEV_FALLBACK_SECRET = 'dev-only-fallback-secret';
const DEV_FALLBACK_REFRESH_SECRET = 'dev-only-fallback-refresh-secret';

const PLACEHOLDER_SECRETS = new Set([
  'change-me-in-production',
  'fallback-secret-change-in-production',
  'fallback-refresh-secret-change-in-production',
  DEV_FALLBACK_SECRET,
  DEV_FALLBACK_REFRESH_SECRET,
]);

const isWeak = (secret) => !secret || PLACEHOLDER_SECRETS.has(secret) || secret.length < 32;

if (isProduction) {
  const problems = [];
  if (isWeak(process.env.JWT_SECRET)) problems.push('JWT_SECRET');
  if (isWeak(process.env.JWT_REFRESH_SECRET)) problems.push('JWT_REFRESH_SECRET');
  if (problems.length) {
    console.error(
      `❌ FATAL: ${problems.join(' and ')} missing, placeholder, or shorter than 32 chars. ` +
      'Set strong random secrets before starting in production.'
    );
    process.exit(1);
  }
} else if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn('⚠️  JWT secrets not set — using insecure development fallbacks. Never do this in production.');
}

const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || DEV_FALLBACK_REFRESH_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
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
      JWT_SECRET
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
      JWT_REFRESH_SECRET
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
      JWT_SECRET
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
