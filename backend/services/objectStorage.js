const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

let client = null;

function isConfigured() {
  return Boolean(
    process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  );
}

function getClient() {
  if (!isConfigured()) {
    throw new Error('S3-compatible object storage is not configured');
  }

  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  return client;
}

function sanitizeFilename(filename = 'file') {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path.basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';

  return { base, ext };
}

function createObjectKey(prefix, originalName) {
  const { base, ext } = sanitizeFilename(originalName);
  return `${String(prefix || 'uploads').replace(/^\/+|\/+$/g, '')}/${Date.now()}-${crypto.randomUUID()}-${base}${ext}`;
}

function publicUrlForKey(key) {
  const base = String(process.env.S3_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return base ? `${base}/${key}` : null;
}

async function createUploadUrl({ key, contentType, expiresIn = 600 }) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
  });

  return getSignedUrl(getClient(), command, { expiresIn });
}

async function createDownloadUrl({ key, expiresIn = 300 }) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(getClient(), command, { expiresIn });
}

async function deleteObject(key) {
  await getClient().send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }));
}

module.exports = {
  isConfigured,
  createObjectKey,
  publicUrlForKey,
  createUploadUrl,
  createDownloadUrl,
  deleteObject,
};
