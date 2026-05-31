const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

dotenv.config();

const uploadsDir = path.join(__dirname, 'uploads', 'teachers');
const homeworkDir = path.join(__dirname, 'uploads', 'homework');
const coursesDir = path.join(__dirname, 'uploads', 'courses');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(homeworkDir)) fs.mkdirSync(homeworkDir, { recursive: true });
if (!fs.existsSync(coursesDir)) fs.mkdirSync(coursesDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.clarity.ms"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://al-athar-academy.vercel.app',
  ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/al-athar-academy(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }
    const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');
    if (siteUrl && origin === siteUrl) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/i.test(origin)) return callback(null, true);
    // إنتاج: أي HTTPS (دومين مخصص، مشاركة من أي مكان)
    if (process.env.NODE_ENV === 'production' && /^https:\/\//i.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/uploads', express.static('uploads'));
app.use(require('./middleware/detectMarket'));

function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    const cleanKey = key.replace(/[.$]/g, '_');
    sanitized[cleanKey] = sanitizeObject(obj[key]);
  }
  
  return sanitized;
}

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
});

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️ MONGODB_URI is missing. Running in Mock Mode.');
      return;
    }
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Successfully!');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️ Running in Mock Mode due to DB connection failure');
  }
};
connectDB();

app.get('/', (req, res) => {
  res.json({
    service: 'Al-Athar Academy API',
    version: '6.2.0',
    status: 'ok',
    message: 'الـ API يعمل — استخدم المسارات تحت /api',
    health: '/api/health',
    frontend: process.env.FRONTEND_URL || 'https://al-athar-academy.vercel.app',
  });
});

app.get('/api', (_req, res) => res.redirect(301, '/api/health'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Al-Athar Backend API is running!',
    timestamp: new Date().toISOString(),
    version: '6.2.0',
    features: {
      ai: !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.AWS_BEARER_TOKEN_BEDROCK),
      bedrock: !!process.env.AWS_BEARER_TOKEN_BEDROCK,
      email: !!process.env.RESEND_API_KEY,
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      whatsapp: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      livekit: !!(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET &&
        process.env.LIVEKIT_API_KEY !== 'your-api-key'),
      translation: true,
      meetings: process.env.DEFAULT_MEETING_PROVIDER || 'jitsi',
      database: mongoose.connection.readyState === 1,
    },
  });
});

app.use('/api/markets', require('./routes/markets'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/verification'));
app.use('/api/students', require('./routes/students'));
app.use('/api/students/dashboard', require('./routes/studentDashboard'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/teachers/dashboard', require('./routes/teacherDashboard'));
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

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: err.message 
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Invalid ID format' 
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ 
      error: 'Duplicate entry' 
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 Security: Helmet + Rate Limit + Mongo Sanitize enabled`);
});
