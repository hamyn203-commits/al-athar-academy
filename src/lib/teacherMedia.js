const FALLBACK = '/default-teacher.png';

/**
 * Public teacher media is always fetched from this site's origin.
 * This avoids CORP/same-origin blocking on cross-origin API image responses.
 * Private assets must never be converted into public references.
 */
export function teacherPublicImage(value) {
  const reference = String(value || '').trim();
  if (!reference || reference === 'not-provided') return FALLBACK;
  if (reference.startsWith('data:image/')) return reference;
  if (reference.startsWith('blob:')) return FALLBACK;

  try {
    const url = new URL(reference, 'https://wahy.invalid');
    const pathname = url.pathname;
    if (pathname === '/api/uploads/public') {
      const original = url.searchParams.get('ref');
      return original
        ? `/api/uploads/public?ref=${encodeURIComponent(original)}`
        : FALLBACK;
    }

    // Old records might still contain the raw Vercel Blob URL.
    if (url.protocol === 'https:' && url.hostname.endsWith('.blob.vercel-storage.com')
      && (pathname.startsWith('/uploads/teacher-public/') || pathname.startsWith('/uploads/course-media/'))) {
      return `/api/uploads/public?ref=${encodeURIComponent(reference)}`;
    }

    if (reference.startsWith('/uploads/teachers/public/')) return reference;
    if (reference.startsWith('/uploads/teacher-public/')) return reference;

    // Other relative app images and trusted avatar URLs retain their normal behavior.
    if (reference.startsWith('/') && !reference.startsWith('//')
      && !reference.startsWith('/private/')) return reference;
    if (url.protocol === 'https:' && url.hostname !== 'wahy.invalid') return reference;
  } catch { return FALLBACK; }

  return FALLBACK;
}

export function teacherImageFallback(event) {
  const image = event.currentTarget;
  if (image && !image.src.endsWith(FALLBACK)) {
    image.src = FALLBACK;
  }
}
