import { useCallback, useEffect, useRef, useState } from 'react';
import { concat, playSignal, renderTone, silence, type Playback } from '@/core/audio';
import { NOTES, TONE_SEC } from './logic';

const cache = new Map<number, Float32Array[]>();
function toneSignal(note: number): Float32Array[] {
  const hit = cache.get(note);
  if (hit) return hit;
  const sig = renderTone({ freq: NOTES[note]!.freq, duration: TONE_SEC, amplitude: 0.45, ramp: 0.015 });
  cache.set(note, sig);
  return sig;
}

/**
 * Diziyi tek bir WAV olarak çalar (zamanlama sağlam), ışıkları setTimeout ile eşler.
 * Dokunuşlarda tek nota çalar. Unmount'ta her şeyi durdurur.
 */
export function useSequencePlayer() {
  const playback = useRef<Playback | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pending = useRef<((ok: boolean) => void) | null>(null);
  const run = useRef(0);
  const [lit, setLit] = useState<number | null>(null);

  const stop = useCallback(() => {
    run.current += 1;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    playback.current?.stop();
    playback.current = null;
    pending.current?.(false);
    pending.current = null;
    setLit(null);
  }, []);

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  /** Diziyi çalar; ışıklar isteğe bağlı (sessiz tur). Tamamlanırsa true, iptal edilirse false. */
  const playSequence = useCallback(async (seq: readonly number[], gapMs: number, lights: boolean): Promise<boolean> => {
    stop();
    const id = run.current;
    const parts: Float32Array[][] = [];
    seq.forEach((n) => { parts.push(toneSignal(n)); parts.push(silence(gapMs / 1000)); });
    try {
      const p = await playSignal(concat(parts), 1);
      if (id !== run.current) { p.stop(); return false; }
      playback.current = p;
    } catch { return false; }
    const step = TONE_SEC * 1000 + gapMs;
    if (lights) {
      seq.forEach((n, i) => {
        later(() => setLit(n), i * step);
        later(() => setLit(null), i * step + TONE_SEC * 1000);
      });
    }
    return new Promise<boolean>((resolve) => {
      pending.current = resolve;
      later(() => { pending.current = null; resolve(true); }, seq.length * step);
    });
  }, [stop]);

  /** Dokunulan notayı çalar ve pad'i kısa süre yakar. */
  const playNote = useCallback((note: number) => {
    playback.current?.stop();
    playback.current = null;
    setLit(note);
    later(() => setLit((v) => (v === note ? null : v)), 220);
    playSignal(toneSignal(note), 1).then((p) => { playback.current = p; }).catch(() => {});
  }, []);

  useEffect(() => stop, [stop]);
  return { lit, playSequence, playNote, stop };
}
