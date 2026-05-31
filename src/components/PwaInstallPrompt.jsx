import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-dismissed') === '1');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  };

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setDismissed(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[100] bg-white border border-emerald-200 shadow-xl rounded-2xl p-4 flex gap-3 items-start">
      <div className="flex-1">
        <p className="font-bold text-sm text-gray-900">ثبّت تطبيق الأثر</p>
        <p className="text-xs text-gray-500 mt-1">وصول سريع للحصص والشهادات من شاشة الهاتف</p>
        <button type="button" onClick={install} className="mt-3 inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg">
          <Download size={14} /> تثبيت
        </button>
      </div>
      <button type="button" onClick={dismiss} className="text-gray-400 hover:text-gray-600" aria-label="إغلاق">
        <X size={18} />
      </button>
    </div>
  );
}
