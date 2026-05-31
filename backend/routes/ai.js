const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');
const RecitationReport = require('../models/RecitationReport');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post('/quran-assistant', protect, async (req, res) => {
  try {
    const { question, locale = 'ar' } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const result = await aiService.chat(question, { locale, role: 'quran' });
    res.json({
      answer: result.text,
      sources: ['Quran', 'Authentic Tafsir'],
      confidence: result.fallback ? 0.6 : 0.9,
      provider: result.provider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/teacher-assistant', protect, async (req, res) => {
  try {
    const { prompt, locale = 'ar' } = req.body;
    const result = await aiService.chat(
      prompt || 'Suggest a lesson plan for today Quran class',
      { locale, role: 'teacher' }
    );

    res.json({
      suggestions: result.text.split('\n').filter(Boolean).slice(0, 6),
      lessonPlan: result.text,
      provider: result.provider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/student-assistant', protect, async (req, res) => {
  try {
    const { goal, level, locale = 'ar' } = req.body;
    const result = await aiService.chat(
      `Daily plan for student. Goal: ${goal || 'memorization'}. Level: ${level || 'beginner'}. Return structured daily tasks.`,
      { locale, role: 'student' }
    );

    res.json({
      dailyPlan: [
        { task: locale === 'ar' ? 'مراجعة حفظ الأمس' : 'Review yesterday', duration: 15 },
        { task: locale === 'ar' ? 'حفظ جديد (5 آيات)' : 'New memorization (5 ayat)', duration: 30 },
        { task: locale === 'ar' ? 'تدريب تجويد' : 'Tajweed practice', duration: 15 },
      ],
      aiNotes: result.text,
      goal,
      level: level || 'beginner',
      provider: result.provider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/recitation-analyze', protect, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file required' });
    const { locale = 'ar' } = req.body;
    const report = await aiService.analyzeRecitation(req.user.id, req.file, { locale });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recitation-reports', protect, async (req, res) => {
  try {
    const reports = await RecitationReport.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recitation-reports/:reportId', protect, async (req, res) => {
  try {
    const report = await RecitationReport.findOne({
      $or: [{ reportId: req.params.reportId }, { _id: req.params.reportId }],
      user: req.user.id,
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/homework-generate', protect, async (req, res) => {
  try {
    const { topic, level, count = 5, locale = 'ar' } = req.body;
    const result = await aiService.generateHomework({ topic, level, count, locale });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/exam-generate', protect, async (req, res) => {
  try {
    const { courseId, questionCount = 10, locale = 'ar' } = req.body;
    const result = await aiService.chat(
      `Generate ${questionCount} exam questions for course ${courseId || 'general'}. Mix MCQ and short answer.`,
      { locale, role: 'teacher' }
    );
    res.json({
      examId: `EX-${Date.now()}`,
      courseId,
      questions: Array.from({ length: questionCount }, (_, i) => ({
        id: i + 1,
        type: i % 3 === 0 ? 'mcq' : 'short-answer',
        points: 10,
      })),
      aiDraft: result.text,
      provider: result.provider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reports-generate', protect, async (req, res) => {
  try {
    const { studentId, period = 'monthly', locale = 'ar' } = req.body;
    res.json({
      studentId,
      period,
      summary: { attendance: 92, progress: 78, homeworkCompletion: 85, averageScore: 88 },
      generatedAt: new Date().toISOString(),
      note: locale === 'ar' ? 'تقرير تجريبي — اربط بيانات LMS الفعلية' : 'Demo report — connect real LMS data',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', protect, (_req, res) => {
  res.json({
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    mode: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY ? 'cloud' : 'local-fallback',
  });
});

module.exports = router;
