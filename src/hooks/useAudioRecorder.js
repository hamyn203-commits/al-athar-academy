import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioRecorder() {
  const [state, setState] = useState('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      recorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      recorderRef.current.start();
      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      throw new Error('تعذر الوصول إلى الميكروفون', { cause: err });
    }
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current && state === 'recording') {
      recorderRef.current.stop();
      recorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    clearTimer();
    setState('recorded');
  }, [state, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState('idle');
    setDuration(0);
    setAudioBlob(null);
  }, [clearTimer]);

  const submit = useCallback(async (url) => {
    if (!audioBlob) return null;
    setState('uploading');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recitation.webm');

    try {
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok || res.status === 503) {
        setState('submitted');
        return data;
      }
      throw new Error(data.message || 'فشل الرفع');
    } catch (err) {
      setState('recorded');
      throw err;
    }
  }, [audioBlob]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { state, duration, audioBlob, start, stop, reset, submit };
}
