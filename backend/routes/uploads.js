const express = require('express');
const path = require('path');
const router = express.Router();
const { protect } = require('../middleware/auth');
const storage = require('../services/objectStorage');

const PURPOSES = {
  homework: {
    roles: ['student'],
    prefix: 'private/homework',
    types: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac'],
    maxBytes: 20 * 1024 * 1024,
    public: false,
  },
  assignment: {
    roles: ['student'],
    prefix: 'private/assignments',
    types: ['application/pdf', 'image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'],
    maxBytes: 50 * 1024 * 1024,
    public: false,
  },
  'course-media': {
    roles: ['teacher', 'admin'],
    prefix: 'public/courses',
    types: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/webm'],
    maxBytes: 200 * 1024 * 1024,
    public: true,
  },
  'teacher-public': {
    roles: ['teacher', 'admin'],
    prefix: 'public/teachers',
    types: ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'audio/wav'],
    maxBytes: 100 * 1024 * 1024,
    public: true,
  },
  'teacher-private': {
    roles: ['teacher', 'admin'],
    prefix: 'private/teachers',
    types: ['image/jpeg', 'image/png', 'application/pdf'],
    maxBytes: 25 * 1024 * 1024,
    public: false,
  },
};

router.get('/status', (_req, res) => {
  res.json({
    driver: process.env.FILE_STORAGE_DRIVER || 'filesystem',
    configured: storage.isConfigured(),
    directUpload: true,
  });
});

router.post('/presign', protect, async (req, res) => {
  if (!storage.isConfigured()) {
    return res.status(503).json({ error: 'Object storage is not configured', code: 'FILE_STORAGE_NOT_READY' });
  }

  const { purpose, filename, contentType, size } = req.body || {};
  const rule = PURPOSES[purpose];

  if (!rule) return res.status(400).json({ error: 'Unsupported upload purpose' });
  if (!rule.roles.includes(req.user.role)) return res.status(403).json({ error: 'Not allowed for this upload purpose' });
  if (!filename || !contentType) return res.status(400).json({ error: 'filename and contentType are required' });

  const normalizedType = String(contentType).toLowerCase();
  if (!rule.types.includes(normalizedType)) {
    return res.status(400).json({ error: 'File type is not allowed' });
  }

  const numericSize = Number(size || 0);
  if (!Number.isFinite(numericSize) || numericSize <= 0 || numericSize > rule.maxBytes) {
    return res.status(400).json({ error: 'Invalid file size' });
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ext || ext.length > 10) return res.status(400).json({ error: 'Invalid filename' });

  const ownerPrefix = `${rule.prefix}/${req.user.id}`;
  const key = storage.createObjectKey(ownerPrefix, filename);
  const uploadUrl = await storage.createUploadUrl({ key, contentType: normalizedType });

  return res.json({
    key,
    uploadUrl,
    method: 'PUT',
    headers: { 'Content-Type': normalizedType },
    publicUrl: rule.public ? storage.publicUrlForKey(key) : null,
    expiresIn: 600,
    maxBytes: rule.maxBytes,
  });
});

module.exports = router;
