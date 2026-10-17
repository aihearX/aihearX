import { useCallback, useEffect, useRef, useState } from 'react';

/** Geri sayım sayacı (saniye). start/stop/reset; 0'a inince onExpire. */
export function useGameTimer(seconds: number, onExpire?: () => void) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  const stop = useCallback(() => { if (ref.current) clearInterval(ref.current); ref.current = null; setRunning(false); }, []);
  const start = useCallback((from?: number) => {
    stop();
    setLeft(from ?? seconds);
    setRunning(true);
    ref.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 0.1) { if (ref.current) clearInterval(ref.current); ref.current = null; setRunning(false); expireRef.current?.(); return 0; }
        return Math.round((v - 0.1) * 10) / 10;
      });
    }, 100);
  }, [seconds, stop]);
  useEffect(() => stop, [stop]);
  return { left, running, start, stop, pct: Math.max(0, Math.min(1, left / seconds)) };
}
