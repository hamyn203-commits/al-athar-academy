import { upload } from '@vercel/blob/client';
import { apiUrl } from '../config';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

function sanitizeSegment(value = 'file') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'file';
}

function currentAccessToken() {
  return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
}

export async function uploadFileDirect(file, purpose, options = {}) {
  if (!file) throw new Error('No file selected');

  const accessToken = options.accessToken || currentAccessToken();
  const phoneVerificationToken = options.phoneVerificationToken || '';

  let owner = '';
  if (accessToken) owner = decodeJwt(accessToken).id || '';
  if (!owner && phoneVerificationToken) owner = decodeJwt(phoneVerificationToken).phone || '';
  if (!owner) throw new Error('Upload authorization is missing');

  const pathname = `uploads/${sanitizeSegment(purpose)}/${sanitizeSegment(owner)}/${Date.now()}-${sanitizeSegment(file.name || 'file')}`;

  const blob = await upload(pathname, file, {
    access: 'private',
    handleUploadUrl: apiUrl('/api/uploads/blob'),
    multipart: file.size > 5 * 1024 * 1024,
    clientPayload: JSON.stringify({
      purpose,
      accessToken: accessToken || undefined,
      phoneVerificationToken: phoneVerificationToken || undefined,
    }),
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    name: file.name,
    size: file.size,
    contentType: file.type || 'application/octet-stream',
  };
}
