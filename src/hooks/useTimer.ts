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
          onExpireRef.current();
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

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setSecondsLeft(durationSeconds);
    setIsRunning(false);
  }, [durationSeconds]);

  return { secondsLeft, isRunning, start, stop, reset };
}
