import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
  const [activeId, setActiveId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearTimer();
          setIsPlaying(false);
          return 0;
        }
        return prev + 2;
      });
    }, 150);
  }, [clearTimer]);

  const toggle = useCallback((id) => {
    if (activeId === id) {
      if (isPlaying) {
        clearTimer();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        startProgress();
      }
    } else {
      clearTimer();
      setActiveId(id);
      setIsPlaying(true);
      setProgress(0);
      startProgress();
    }
  }, [activeId, isPlaying, clearTimer, startProgress]);

  const stop = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setProgress(0);
    setActiveId(null);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    activeId,
    isPlaying,
    progress,
    toggle,
    stop,
    isActive: (id) => activeId === id,
  };
}
