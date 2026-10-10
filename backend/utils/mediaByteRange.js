'use strict';

// Vercel Functions must never send an entire teacher video as a single response.
// Native browser media controls request byte ranges, including open-ended ranges.
const DEFAULT_CHUNK_BYTES = 2 * 1024 * 1024;

function boundedMediaRange(rangeHeader, totalSize, chunkBytes = DEFAULT_CHUNK_BYTES) {
  const size = Number(totalSize);
  const cap = Math.floor(Number(chunkBytes));
  if (!Number.isSafeInteger(size) || size <= 0 || !Number.isSafeInteger(cap) || cap <= 0 || cap > 2 * 1024 * 1024) {
    throw new RangeError('Invalid media length or chunk size');
  }

  const header = String(rangeHeader || '').trim();
  if (!header) return { start: 0, end: Math.min(size - 1, cap - 1), size, partial: true };

  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) throw new RangeError('Invalid byte range');

  let start;
  let end;
  if (match[1]) {
    start = Number(match[1]);
    if (!Number.isSafeInteger(start) || start < 0 || start >= size) throw new RangeError('Range outside media');
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(end) || end < start) throw new RangeError('Invalid byte range');
    end = Math.min(size - 1, end, start + cap - 1);
  } else {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) throw new RangeError('Invalid suffix range');
    start = Math.max(0, size - suffixLength);
    end = Math.min(size - 1, start + cap - 1);
  }
  return { start, end, size, partial: true };
}

module.exports = { DEFAULT_CHUNK_BYTES, boundedMediaRange };
