import { Upload, CheckCircle } from 'lucide-react';

export default function FileBox({ id, label, hint, accept, multiple, file, files, onChange, preview }) {
  const count = multiple ? (files?.length || 0) : (file ? 1 : 0);
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition bg-slate-50/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">{label}</p>
          {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
        {count > 0 && <CheckCircle className="text-emerald-600 shrink-0" size={20} />}
      </div>
      <input type="file" id={id} accept={accept} multiple={multiple} className="hidden"
        onChange={(e) => onChange(multiple ? Array.from(e.target.files) : e.target.files[0])} />
      <label htmlFor={id} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-50 hover:border-emerald-200">
        <Upload size={16} /> {count ? `تم (${count}) — تغيير` : 'اختر ملف'}
      </label>
      {preview && file && (
        <div className="mt-3">{preview(file)}</div>
      )}
    </div>
  );
}
