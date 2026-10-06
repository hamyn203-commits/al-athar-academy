import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

function fileExtension(name = '') {
  const index = String(name).lastIndexOf('.');
  return index >= 0 ? String(name).slice(index).toLowerCase() : '';
}

function formatMb(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
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
}) {
  const [error, setError] = useState('');
  const count = multiple ? (files?.length || 0) : (file ? 1 : 0);

  const handleChange = (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    for (const item of selected) {
      if (maxBytes && item.size > maxBytes) {
        setError(`حجم الملف "${item.name}" هو ${formatMb(item.size)} MB. الحد الأقصى ${formatMb(maxBytes)} MB.`);
        event.target.value = '';
        return;
      }

      if (item.size <= 0) {
        setError(`الملف "${item.name}" فارغ أو غير صالح.`);
        event.target.value = '';
        return;
      }

      if (allowedMimeTypes?.length && !allowedMimeTypes.includes(item.type)) {
        setError(`نوع الملف "${item.name}" غير مدعوم.`);
        event.target.value = '';
        return;
      }

      if (allowedExtensions?.length && !allowedExtensions.includes(fileExtension(item.name))) {
        setError(`امتداد الملف "${item.name}" غير مدعوم.`);
        event.target.value = '';
        return;
      }
    }

    setError('');
    onChange(multiple ? selected : selected[0]);
    event.target.value = '';
  };

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
        id={id}
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <label
        htmlFor={id}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-50 hover:border-emerald-200"
      >
        <Upload size={16} /> {count ? `تم (${count}) — تغيير` : 'اختر ملف'}
      </label>
      {preview && file && (
        <div className="mt-3">{preview(file)}</div>
      )}
    </div>
  );
}
