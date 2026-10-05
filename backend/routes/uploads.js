const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { protect } = require('../middleware/auth');
const storage = require('../services/objectStorage');

const PURPOSES = {
  homework: {
    roles: ['student'],
    types: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/x-m4a'],
    maxBytes: 20 * 1024 * 1024,
  },
  assignment: {
    roles: ['student'],
    types: ['application/pdf', 'image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'],
    maxBytes: 50 * 1024 * 1024,
  },
  'course-media': {
    roles: ['teacher', 'admin'],
    types: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/webm'],
    maxBytes: 200 * 1024 * 1024,
  },
  'teacher-public': {
    roles: ['teacher', 'admin', 'teacher-registration'],
    types: ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'],
    maxBytes: 100 * 1024 * 1024,
  },
  'teacher-private': {
    roles: ['teacher', 'admin', 'teacher-registration'],
    types: ['image/jpeg', 'image/png', 'application/pdf'],
    maxBytes: 25 * 1024 * 1024,
  },
};

function verifyClientIdentity(payload = {}) {
  const secret = process.env.JWT_SECRET || 'wahy-namaa-dev-access-secret-change-me';

  if (payload.accessToken) {
    const user = jwt.verify(payload.accessToken, secret);
    return { role: user.role, owner: user.id };
  }

  if (payload.phoneVerificationToken) {
    const verification = jwt.verify(payload.phoneVerificationToken, secret);
    if (verification.purpose !== 'teacher-phone-verification') {
      throw new Error('Invalid teacher verification proof');
    }
    return { role: 'teacher-registration', owner: verification.phone };
  }

  throw new Error('Authentication required');
}

function assertUploadPath(pathname, purpose, owner) {
  const prefix = `uploads/${storage.sanitizeSegment(purpose)}/${storage.sanitizeSegment(owner)}/`;
  if (!String(pathname || '').startsWith(prefix)) {
    throw new Error('Invalid upload path');
  }
}

router.get('/status', (_req, res) => {
  res.json({
    driver: storage.getDriver(),
    configured: storage.isConfigured(),
    directUpload: true,
    privateByDefault: storage.getDriver() === 'vercel-blob',
  });
});

router.post('/blob', async (req, res) => {
  if (storage.getDriver() !== 'vercel-blob') {
    return res.status(409).json({ error: 'Vercel Blob is not the active storage driver' });
  }

  try {
    const { handleUpload } = await import('@vercel/blob/client');
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const request = new Request(`${protocol}://${host}${req.originalUrl}`, {
      method: 'POST',
      headers: new Headers(Object.entries(req.headers).filter(([, value]) => typeof value === 'string')),
      body: JSON.stringify(req.body || {}),
    });

    const jsonResponse = await handleUpload({
      body: req.body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}');
        const rule = PURPOSES[payload.purpose];
        if (!rule) throw new Error('Unsupported upload purpose');

        const identity = verifyClientIdentity(payload);
        if (!rule.roles.includes(identity.role)) {
          throw new Error('Not allowed for this upload purpose');
        }

        assertUploadPath(pathname, payload.purpose, identity.owner);

        return {
          allowedContentTypes: rule.types,
          maximumSizeInBytes: rule.maxBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            purpose: payload.purpose,
            owner: String(identity.owner),
            role: identity.role,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const meta = JSON.parse(tokenPayload || '{}');
        console.log('Blob upload completed', {
          pathname: blob.pathname,
          purpose: meta.purpose,
          role: meta.role,
        });
      },
    });

    return res.json(jsonResponse);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Upload authorization failed' });
  }
});

router.post('/presign', protect, async (req, res) => {
  if (storage.getDriver() !== 's3') {
    return res.status(409).json({ error: 'S3 storage is not active' });
  }

  const { purpose, filename, contentType, size } = req.body || {};
  const rule = PURPOSES[purpose];

  if (!rule) return res.status(400).json({ error: 'Unsupported upload purpose' });
  if (!rule.roles.includes(req.user.role)) return res.status(403).json({ error: 'Not allowed' });
  if (!filename || !contentType) return res.status(400).json({ error: 'filename and contentType are required' });
  if (!rule.types.includes(String(contentType).toLowerCase())) return res.status(400).json({ error: 'File type is not allowed' });

  const numericSize = Number(size || 0);
  if (!Number.isFinite(numericSize) || numericSize <= 0 || numericSize > rule.maxBytes) {
    return res.status(400).json({ error: 'Invalid file size' });
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ext || ext.length > 10) return res.status(400).json({ error: 'Invalid filename' });

  const key = storage.createObjectKey(
    `uploads/${purpose}/${storage.sanitizeSegment(req.user.id)}`,
    filename
  );
  const uploadUrl = await storage.createUploadUrl({ key, contentType });

  return res.json({
    key,
    uploadUrl,
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    expiresIn: 600,
  });
});

router.get('/public', async (req, res) => {
  try {
    const reference = String(req.query.ref || '');
    if (!reference) return res.status(400).json({ error: 'Missing file reference' });

    const pathname = storage.extractPathname(reference);
    const publicPurpose =
      pathname.startsWith('uploads/teacher-public/') ||
      pathname.startsWith('uploads/course-media/');

    if (!publicPurpose) {
      return res.status(403).json({ error: 'This file is not public media' });
    }

    if (storage.getDriver() === 'vercel-blob' && !storage.isVercelBlobReference(reference)) {
      return res.status(400).json({ error: 'Invalid media reference' });
    }

    const result = await storage.getPrivateObject(reference, {
      ifNoneMatch: req.headers['if-none-match'],
    });

    if (!result) return res.status(404).end();
    if (result.statusCode === 304) return res.status(304).end();

    res.setHeader('Content-Type', result.blob?.contentType || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (result.blob?.etag) res.setHeader('ETag', result.blob.etag);

    if (result.stream?.pipe) {
      return result.stream.pipe(res);
    }

    const reader = result.stream?.getReader?.();
    if (!reader) return res.status(500).end();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    return res.end();
  } catch (error) {
    console.error('Public media stream failed:', error.message);
    return res.status(404).end();
  }
});

module.exports = router;
