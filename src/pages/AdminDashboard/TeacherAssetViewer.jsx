import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// Protected assets never receive a public URL. We fetch with the administrator's
// existing authorization, create a temporary blob URL, then revoke it on close.
export default function TeacherAssetViewer({ teacherId, asset, loader, onClose }) {
  const [preview, setPreview] = useState({ status: 'loading' });

  useEffect(() => {
    let active = true;
    let url = null;
    setPreview({ status: 'loading' });

    Promise.resolve()
      .then(() => loader(teacherId, asset.kind, asset.index))
      .then((blob) => {
        if (!active) return;
        if (!(blob instanceof Blob) || blob.size === 0) throw new Error('الملف فارغ أو غير متاح.');
        const format = asset.category === 'document'
          ? (blob.type.startsWith('image/') ? 'image' : blob.type === 'application/pdf' ? 'pdf' : 'other')
          : asset.kind === 'profilePhoto' ? 'image' : asset.kind === 'audioRecordings' ? 'audio' : 'video';
        url = URL.createObjectURL(blob);
        setPreview({ status: 'ready', url, format, playbackError: false });
      })
      .catch((error) => {
        if (active) setPreview({ status: 'error', message: error?.message || 'تعذر تحميل الملف.' });
      });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [teacherId, asset, loader]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="wn-admin-asset-viewer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="wn-admin-asset-viewer__panel" role="dialog" aria-modal="true" aria-label={`معاينة ${asset.label}`} dir="rtl">
        <header className="wn-admin-asset-viewer__header">
          <div><h3>{asset.label}</h3><p>معاينة الملف داخل لوحة الإدارة — دون مغادرة الأكاديمية</p></div>
          <button type="button" onClick={onClose} aria-label="إغلاق المعاينة"><X size={22} /></button>
        </header>
        <div className="wn-admin-asset-viewer__content">
          {preview.status === 'loading' ? (
            <p className="wn-admin-asset-viewer__message" role="status">جاري تحميل الملف… قد يستغرق الفيديو الكبير بعض الوقت.</p>
          ) : preview.status === 'error' ? (
            <p className="wn-admin-asset-viewer__message is-error" role="alert">تعذرت معاينة الملف: {preview.message}</p>
          ) : (
            <>
              {preview.format === 'image' ? <img src={preview.url} alt={asset.label} /> : null}
              {preview.format === 'video' ? (
                <video
                  src={preview.url}
                  controls
                  playsInline
                  preload="metadata"
                  onError={() => setPreview((current) => current.url === preview.url ? { ...current, playbackError: true } : current)}
                >
                  المتصفح لا يدعم تشغيل هذا الفيديو.
                </video>
              ) : null}
              {preview.format === 'audio' ? <audio src={preview.url} controls preload="metadata" /> : null}
              {preview.format === 'pdf' ? <iframe src={preview.url} title={asset.label} /> : null}
              {preview.format === 'other' ? (
                <p className="wn-admin-asset-viewer__message">هذا النوع من الملفات غير مدعوم للمعاينة المباشرة. يمكن تنزيله للمراجعة.</p>
              ) : null}
              {preview.playbackError ? (
                <p className="wn-admin-asset-viewer__message is-error" role="alert">لم يستطع المتصفح فك ترميز الفيديو. يمكنك تنزيله وتشغيله ببرنامج يدعم الصيغة.</p>
              ) : null}
            </>
          )}
        </div>
        <footer className="wn-admin-asset-viewer__footer">
          {preview.status === 'ready' ? (
            <a href={preview.url} download={`teacher-review-${asset.kind}`}><Download size={17} /> تنزيل الملف عند الحاجة</a>
          ) : <span />}
          <button type="button" onClick={onClose}>إغلاق المعاينة</button>
        </footer>
      </section>
    </div>
  );
}
