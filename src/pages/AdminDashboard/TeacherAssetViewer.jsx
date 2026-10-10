import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// Protected assets never receive a public URL. We fetch with the administrator's
// existing authorization, create a temporary blob URL, then revoke it on close.
export default function TeacherAssetViewer({ teacherId, asset, loader, onClose }) {
  const [preview, setPreview] = useState({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    let ownedObjectUrl = null;
    setPreview({ status: 'loading' });

    Promise.resolve()
      .then(() => loader(teacherId, asset.kind, asset.index))
      .then((result) => {
        if (!active) return;
        const isBlob = result instanceof Blob;
        if (isBlob && result.size === 0) throw new Error('الملف فارغ أو غير متاح.');
        if (!isBlob && (!result?.url || !/^https:\/\//i.test(result.url))) {
          throw new Error('لم يصل رابط تشغيل صالح من الخادم.');
        }
        const format = asset.category === 'document'
          ? (result.type.startsWith('image/') ? 'image' : result.type === 'application/pdf' ? 'pdf' : 'other')
          : asset.kind === 'profilePhoto' ? 'image' : asset.kind === 'audioRecordings' ? 'audio' : 'video';
        if (isBlob) ownedObjectUrl = URL.createObjectURL(result);
        setPreview({ status: 'ready', url: isBlob ? ownedObjectUrl : result.url, format, playbackError: false, temporary: !isBlob });
      })
      .catch((error) => {
        if (active) setPreview({ status: 'error', message: error?.message || 'تعذر تحميل الملف.' });
      });

    return () => {
      active = false;
      if (ownedObjectUrl) URL.revokeObjectURL(ownedObjectUrl);
    };
  }, [teacherId, asset, loader, retryKey]);

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
            <p className="wn-admin-asset-viewer__message is-error" role="alert">تعذرت معاينة الملف: {preview.message}<br />تحقق من اتصال الإنترنت ثم أعد المحاولة.</p>
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
                <p className="wn-admin-asset-viewer__message is-error" role="alert">تعذر تشغيل هذا الفيديو. قد تكون صيغته غير مدعومة أو انتهت صلاحية رابط المعاينة؛ اضغط إعادة المحاولة للحصول على رابط جديد.</p>
              ) : null}
            </>
          )}
        </div>
        <footer className="wn-admin-asset-viewer__footer">
          {preview.status === 'ready' ? (
            <a href={preview.url} download={`teacher-review-${asset.kind}`} rel="noreferrer" referrerPolicy="no-referrer"><Download size={17} /> تنزيل الملف عند الحاجة</a>
          ) : <span />}
          {preview.status === 'error' || preview.playbackError ? (
            <button type="button" className="wn-admin-asset-viewer__retry" onClick={() => setRetryKey((count) => count + 1)}>إعادة المحاولة</button>
          ) : null}
          <button type="button" onClick={onClose}>إغلاق المعاينة</button>
        </footer>
      </section>
    </div>
  );
}
