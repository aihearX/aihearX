import { useCallback, useEffect, useRef, useState } from 'react';
import { playSignal, type Playback } from '@/core/audio';
import { PAIR_MS, SECOND_AT_MS, TONE_SEC, renderPair, type Trial } from './logic';

export type Sounding = 0 | 1 | 2;

/** İki tonu tek WAV olarak çalar; hangi tonun çaldığını (1/2) bildirir, ikinci ton başlayınca onSecond çağırır. */
export function usePairPlayer() {
  const playback = useRef<Playback | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const run = useRef(0);
  const [sounding, setSounding] = useState<Sounding>(0);

  const stop = useCallback(() => {
    run.current += 1;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    playback.current?.stop();
    playback.current = null;
    setSounding(0);
  }, []);

  const playPair = useCallback(async (t: Trial, onSecond: () => void): Promise<boolean> => {
    stop();
    const id = run.current;
    try {
      const p = await playSignal(renderPair(t), 1);
      if (id !== run.current) { p.stop(); return false; }
      playback.current = p;
    } catch {
      // Ses üretilemedi/çalınamadı: akış yine de ilerlesin (cevap alanı açılsın), aksi halde tur askıda kalır.
      if (id !== run.current) return false;
    }
    const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
    setSounding(1);
    later(() => setSounding(0), TONE_SEC * 1000);
    later(() => { setSounding(2); onSecond(); }, SECOND_AT_MS);
    later(() => setSounding(0), PAIR_MS);
    return true;
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { sounding, playPair, stop };
}
