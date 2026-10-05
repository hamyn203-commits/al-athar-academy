const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');

function getReadiness() {
  const databaseConfigured = Boolean(process.env.MONGODB_URI);
  const authConfigured = Boolean(process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET);
  const externalStorage = process.env.FILE_STORAGE_DRIVER === 'external';
  const storageConfigured = !externalStorage || process.env.EXTERNAL_STORAGE_READY === 'true';

  return {
    ready: databaseConfigured && authConfigured && storageConfigured,
    databaseConfigured,
    authConfigured,
    storageConfigured,
    storageDriver: process.env.FILE_STORAGE_DRIVER || 'filesystem',
  };
}

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.googletagmanager.com", "https://www.clarity.ms"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      mediaSrc: ["'self'", "blob:", "https:"],
      frameSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 150),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 8),
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean)
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://wahy-wa-namaa-academy.vercel.app',
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/wahy-wa-namaa-academy(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }
    if (/^http:\/\/localhost:\d+$/i.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  app.use('/api/', generalLimiter);
  app.use('/api/auth/login', authLimiter);
}

app.use(require('./middleware/detectMarket'));

function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    sanitized[key.replace(/[.$]/g, '_')] = sanitizeObject(obj[key]);
  }
  return sanitized;
}

app.use((req, _res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) Object.assign(req.query, sanitizeObject(req.query));
  if (req.params) Object.assign(req.params, sanitizeObject(req.params));
  next();
});

app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'));

// Ensure database connectivity before business API requests. Health remains available
// even when the database is unavailable so deployment diagnostics still work.
app.use('/api', async (req, res, next) => {
  if (req.path === '/health' || req.path === '/readiness') return next();

  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        error: 'API not ready',
        code: 'DATABASE_NOT_CONFIGURED'
      });
    }
    return next();
  }

  try {
    await connectDB();
    return next();
  } catch {
    return res.status(503).json({ error: 'Database temporarily unavailable' });
  }
});

// Filesystem uploads are supported for local/VPS deployments only. Serverless
// deployments use external object storage in the migration phase.
if (process.env.FILE_STORAGE_DRIVER !== 'external') {
  app.use('/uploads/teachers/public', express.static(path.join(__dirname, 'uploads', 'teachers', 'public')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}
app.use('/uploads/teachers', (_req, res) => res.status(404).end());

app.get('/', (_req, res) => {
  res.json({
    service: 'Wahy Wa Namaa Academy API',
    version: '7.0.0',
    status: 'ok',
    runtime: process.env.VERCEL ? 'serverless' : 'node',
    health: '/api/health',
    frontend: process.env.FRONTEND_URL || 'https://wahy-wa-namaa-academy.vercel.app',
  });
});

app.get('/api', (_req, res) => res.redirect(301, '/api/health'));

app.get('/api/health', (_req, res) => {
  const readiness = getReadiness();
  res.status(200).json({
    status: 'ok',
    service: 'wahy-wa-namaa-api',
    version: '7.0.0',
    runtime: process.env.VERCEL ? 'vercel' : 'node',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1,
    databaseConfigured: readiness.databaseConfigured,
    storageDriver: readiness.storageDriver,
    storageConfigured: readiness.storageConfigured,
    features: {
      ai: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.AWS_BEARER_TOKEN_BEDROCK),
      email: Boolean(process.env.RESEND_API_KEY),
      telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      whatsapp: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      livekit: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL),
    },
  });
});

app.get('/api/readiness', (_req, res) => {
  const readiness = getReadiness();
  return res.status(readiness.ready ? 200 : 503).json({
    status: readiness.ready ? 'ready' : 'not-ready',
    ...readiness,
    optionalFeatures: {
      ai: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.AWS_BEARER_TOKEN_BEDROCK),
      email: Boolean(process.env.RESEND_API_KEY),
      whatsapp: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      livekit: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL),
    },
  });
});

app.use('/api/markets', require('./routes/markets'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/verification'));
app.use('/api/students/dashboard', require('./routes/studentDashboard'));
app.use('/api/student-dashboard', require('./routes/studentDashboard'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers/dashboard', require('./routes/teacherDashboard'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/translate', require('./routes/translate'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/sessions/:id/translate', require('./routes/sessionTranslate'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/homework', require('./routes/homework'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/guardians', require('./routes/guardians'));
app.use('/api/guardian', require('./routes/guardian'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/live', require('./routes/live'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/setup', require('./routes/setup'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/growth', require('./routes/adminGrowth'));
app.use('/api/lms', require('./routes/lms'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/careers', require('./routes/careers'));
app.use('/api/women', require('./routes/women'));
app.use('/api/system', require('./routes/system'));
app.use('/api/circles', require('./routes/circles'));
app.use('/api/trials', require('./routes/trials'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/cron', require('./routes/cron'));

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, _next) => {
  console.error('API error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  if (err.name === 'ValidationError') return res.status(400).json({ error: 'Validation error', details: err.message });
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID format' });
  if (err.code === 11000) return res.status(409).json({ error: 'Duplicate entry' });
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: 'Origin not allowed' });

  return res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

module.exports = app;
