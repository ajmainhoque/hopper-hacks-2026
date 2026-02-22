import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(durationSeconds: number, onExpire: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          // Call onExpire outside the setState updater to avoid
          // "Cannot update a component while rendering" errors
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    setSecondsLeft(durationSeconds);
    setIsRunning(true);
  }, [durationSeconds]);

  const startWith = useCallback((seconds: number) => {
    setSecondsLeft(seconds);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setSecondsLeft(prev => {
      if (prev > 0) setIsRunning(true);
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setSecondsLeft(durationSeconds);
    setIsRunning(false);
  }, [durationSeconds]);

  return { secondsLeft, isRunning, start, startWith, stop, pause, resume, reset };
}
