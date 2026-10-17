'use dom';
import React, { useEffect, useRef } from 'react';
import { mount } from '@/arcade/koklea-kosusu';
import type { ArcadeDomProps } from '@/core/arcade/ArcadeShell';

export default function Dom({ onEvent, seed, mode, sounds }: ArcadeDomProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const h = mount(ref.current, { onEvent, seed, mode, sounds });
    return () => h.destroy();
  }, [onEvent, seed, mode, sounds]);
  return <div ref={ref} style={{ position: 'fixed', inset: 0, background: '#fff', overflow: 'hidden', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} />;
}
