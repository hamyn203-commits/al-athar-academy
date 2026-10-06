const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

let s3Client = null;

function getDriver() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'vercel-blob';
  if (
    process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  ) return 's3';
  if (process.env.FILE_STORAGE_DRIVER === 'filesystem') return 'filesystem';
  return 'unconfigured';
}

function isConfigured() {
  return ['vercel-blob', 's3', 'filesystem'].includes(getDriver());
}

function getS3Client() {
  if (getDriver() !== 's3') throw new Error('S3-compatible object storage is not configured');
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

function sanitizeSegment(value = 'file') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'file';
}

function sanitizeFilename(filename = 'file') {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = sanitizeSegment(path.basename(filename, path.extname(filename))).slice(0, 60);
  return { base, ext };
}

function createObjectKey(prefix, originalName) {
  const { base, ext } = sanitizeFilename(originalName);
  return `${String(prefix || 'uploads').replace(/^\/+|\/+$/g, '')}/${Date.now()}-${crypto.randomUUID()}-${base}${ext}`;
}

function extractPathname(reference) {
  if (!reference) return '';
  try {
    const parsed = new URL(reference);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
  } catch {
    return String(reference).replace(/^\/+/, '');
  }
}

function isSafeObjectPath(pathname) {
  const value = String(pathname || '');
  if (!value || value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) return false;

  const segments = value.split('/');
  return segments.length >= 2 && segments.every((segment) => (
    segment &&
    segment !== '.' &&
    segment !== '..'
  ));
}

function referenceMatches(reference, purpose, owner) {
  const pathname = extractPathname(reference);
  if (!isSafeObjectPath(pathname)) return false;
  const expected = `uploads/${sanitizeSegment(purpose)}/${sanitizeSegment(owner)}/`;
  return pathname.startsWith(expected);
}

function isVercelBlobReference(reference) {
  try {
    const parsed = new URL(reference);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

function publicProxyUrl(reference) {
  if (!reference) return null;
  const apiBase = String(process.env.API_PUBLIC_URL || '').replace(/\/$/, '');
  if (getDriver() === 'vercel-blob') {
    return `${apiBase}/api/uploads/public?ref=${encodeURIComponent(reference)}`;
  }
  if (getDriver() === 's3') {
    const base = String(process.env.S3_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    return base ? `${base}/${extractPathname(reference)}` : reference;
  }
  return reference;
}

async function createUploadUrl({ key, contentType, expiresIn = 600 }) {
  if (getDriver() !== 's3') throw new Error('Presigned S3 uploads are not enabled');
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

async function getPrivateObject(reference, options = {}) {
  if (getDriver() === 'vercel-blob') {
    const { get } = await import('@vercel/blob');
    return get(reference, {
      access: 'private',
      ifNoneMatch: options.ifNoneMatch,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  }

  if (getDriver() === 's3') {
    const result = await getS3Client().send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: extractPathname(reference),
    }));
    return {
      statusCode: 200,
      stream: result.Body,
      blob: {
        contentType: result.ContentType || 'application/octet-stream',
        etag: result.ETag,
      },
    };
  }

  return null;
}

function isOwnedObjectReference(reference, purpose, owner, driver = getDriver()) {
  if (!referenceMatches(reference, purpose, owner)) return false;
  if (driver === 'vercel-blob') return isVercelBlobReference(reference);
  if (driver === 's3') return true;
  return false;
}

async function deleteObject(reference) {
  if (getDriver() === 'vercel-blob') {
    const { del } = await import('@vercel/blob');
    await del(reference, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }

  if (getDriver() === 's3') {
    await getS3Client().send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: extractPathname(reference),
    }));
    return;
  }

  throw new Error('External object storage is not configured for deletion');
}

async function deleteOwnedObject(reference, purpose, owner) {
  if (!isOwnedObjectReference(reference, purpose, owner)) {
    throw new Error('Object reference does not belong to this owner and purpose');
  }

  await deleteObject(reference);
}

module.exports = {
  getDriver,
  isConfigured,
  sanitizeSegment,
  createObjectKey,
  extractPathname,
  isSafeObjectPath,
  referenceMatches,
  isVercelBlobReference,
  isOwnedObjectReference,
  publicProxyUrl,
  createUploadUrl,
  getPrivateObject,
  deleteObject,
  deleteOwnedObject,
};