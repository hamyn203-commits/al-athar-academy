import { useState } from 'react';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Camera,
  Video,
  Images,
  Trash2,
} from 'lucide-react';

function fileExtension(name = '') {
  const index = String(name).lastIndexOf('.');
  return index >= 0 ? String(name).slice(index).toLowerCase() : '';
}

function formatMb(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

function extensionForMime(type = '') {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };
  return map[String(type || '').toLowerCase()] || '';
}

function ensureFilename(file, captureKind) {
  if (!file || fileExtension(file.name)) return file;
  const extension = extensionForMime(file.type);
  if (!extension) return file;

  const prefix = captureKind === 'video' ? 'camera-video' : 'camera-photo';
  return new File(
    [file],
    `${prefix}-${Date.now()}${extension}`,
    { type: file.type, lastModified: file.lastModified || Date.now() }
  );
}

export default function FileBox({
  id,
  label,
  hint,
  accept,
  multiple,
  file,
  files,
  onChange,
  preview,
  maxBytes,
  allowedMimeTypes,
  allowedExtensions,
  captureKind,
}) {
  const [error, setError] = useState('');
  const count = multiple ? (files?.length || 0) : (file ? 1 : 0);

  const validate = (item) => {
    if (maxBytes && item.size > maxBytes) {
      return `حجم الملف "${item.name}" هو ${formatMb(item.size)} MB. الحد الأقصى ${formatMb(maxBytes)} MB.`;
    }

    if (item.size <= 0) {
      return `الملف "${item.name}" فارغ أو غير صالح.`;
    }

    if (allowedMimeTypes?.length && !allowedMimeTypes.includes(item.type)) {
      return `نوع الملف "${item.name}" غير مدعوم.`;
    }

    if (allowedExtensions?.length && !allowedExtensions.includes(fileExtension(item.name))) {
      return `امتداد الملف "${item.name}" غير مدعوم.`;
    }

    return '';
  };

  const applyFiles = (rawFiles, { append = false } = {}) => {
    const selected = rawFiles.map((item) => ensureFilename(item, captureKind));
    if (!selected.length) return;

    for (const item of selected) {
      const validationError = validate(item);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError('');

    if (multiple) {
      const base = append ? (files || []) : [];
      const merged = [...base, ...selected].filter((item, index, all) => (
        all.findIndex((candidate) => (
          candidate.name === item.name
          && candidate.size === item.size
          && candidate.lastModified === item.lastModified
        )) === index
      ));
      onChange(merged);
      return;
    }

    onChange(selected[0]);
  };

  const handleLibraryChange = (event) => {
    const selected = Array.from(event.target.files || []);
    applyFiles(selected, { append: Boolean(multiple && count) });
    event.target.value = '';
  };

  const handleCaptureChange = (event) => {
    const selected = Array.from(event.target.files || []);
    applyFiles(selected, { append: Boolean(multiple) });
    event.target.value = '';
  };

  const clearSelection = () => {
    setError('');
    onChange(multiple ? [] : null);
  };

  const cameraLabel = captureKind === 'video'
    ? 'تسجيل فيديو بالكاميرا'
    : 'التقاط بالكاميرا';

  const CameraIcon = captureKind === 'video' ? Video : Camera;

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition bg-slate-50/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">{label}</p>
          {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
          {maxBytes && (
            <p className="text-xs text-slate-500 mt-1">
              الحد الأقصى لكل ملف: {formatMb(maxBytes)} MB
            </p>
          )}
        </div>
        {count > 0 && <CheckCircle className="text-emerald-600 shrink-0" size={20} />}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <input
        type="file"
        id={`${id}-library`}
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleLibraryChange}
      />

      {captureKind && (
        <input
          type="file"
          id={`${id}-camera`}
          accept={captureKind === 'video' ? 'video/*' : 'image/*'}
          capture="user"
          className="hidden"
          onChange={handleCaptureChange}
        />
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {captureKind && (
          <label
            htmlFor={`${id}-camera`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-800"
          >
            <CameraIcon size={16} /> {cameraLabel}
          </label>
        )}

        <label
          htmlFor={`${id}-library`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-50 hover:border-emerald-200"
        >
          {captureKind ? <Images size={16} /> : <Upload size={16} />}
          {captureKind
            ? (multiple && count ? 'إضافة من الألبوم/الجهاز' : 'اختيار من الألبوم/الجهاز')
            : (count ? `تم (${count}) — تغيير` : 'اختر ملف')}
        </label>

        {count > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={15} /> مسح الاختيار
          </button>
        )}
      </div>

      {multiple && count > 0 && (
        <p className="mt-3 text-xs text-emerald-700">
          تم اختيار {count} ملف/ملفات.
        </p>
      )}

      {preview && file && (
        <div className="mt-3">{preview(file)}</div>
      )}
    </div>
  );
}
