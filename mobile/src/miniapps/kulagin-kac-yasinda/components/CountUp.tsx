import React, { useEffect, useRef, useState } from 'react';
import type { TextStyle } from 'react-native';
import { AppText } from '@/core/ui';

/** 0'dan hedefe yumuşak sayan sayı (ease-out). */
export function CountUp({ to, duration = 1300, color, style }: { to: number; duration?: number; color?: string; style?: TextStyle }) {
  const [v, setV] = useState(0);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const t0 = Date.now();
    raf.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased));
      if (p >= 1 && raf.current) { clearInterval(raf.current); raf.current = null; }
    }, 28);
    return () => { if (raf.current) clearInterval(raf.current); };
  }, [to, duration]);
  return <AppText color={color} style={style}>{v}</AppText>;
}
