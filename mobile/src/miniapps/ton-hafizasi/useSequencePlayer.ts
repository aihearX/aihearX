import { useCallback, useEffect, useRef, useState } from 'react';
import { concat, playSignal, renderTone, silence, type Playback } from '@/core/audio';
import { TONE_SEC, type Pad, type RhythmEvent } from './logic';

const cache = new Map<string, Float32Array[]>();
function toneSignal(freq: number, sec: number): Float32Array[] {
  const key = `${freq}:${sec}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const sig = renderTone({ freq, duration: sec, amplitude: 0.45, ramp: 0.015 });
  cache.set(key, sig);
  return sig;
}

/**
 * Diziyi tek bir WAV olarak çalar (zamanlama sağlam), ışıkları setTimeout ile eşler.
 * Dokunuşlarda tek nota çalar; ritimli cümle çalımı (reveal) ayrı. Unmount'ta her şeyi durdurur.
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

  /** Hazır sinyali çalar; ışık planını zamanlar. Tamamlanırsa true, iptal edilirse false. */
  const playPlan = useCallback(async (signal: Float32Array[], lights: { pad: number; at: number; off: number }[], totalMs: number): Promise<boolean> => {
    stop();
    const id = run.current;
    try {
      const p = await playSignal(signal, 1);
      if (id !== run.current) { p.stop(); return false; }
      playback.current = p;
    } catch { return false; }
    for (const l of lights) {
      later(() => setLit(l.pad), l.at);
      later(() => setLit((v) => (v === l.pad ? null : v)), l.off);
    }
    return new Promise<boolean>((resolve) => {
      pending.current = resolve;
      later(() => { pending.current = null; resolve(true); }, totalMs);
    });
  }, [stop]);

  /** Simon dizisi: eşit aralıklı notalar; ışıklar isteğe bağlı (sessiz tur). */
  const playSequence = useCallback((seq: readonly number[], pads: readonly Pad[], gapMs: number, lights: boolean): Promise<boolean> => {
    const parts: Float32Array[][] = [];
    seq.forEach((n) => { parts.push(toneSignal(pads[n]!.freq, TONE_SEC)); parts.push(silence(gapMs / 1000)); });
    const step = TONE_SEC * 1000 + gapMs;
    const plan = lights ? seq.map((n, i) => ({ pad: n, at: i * step, off: i * step + TONE_SEC * 1000 })) : [];
    return playPlan(concat(parts), plan, seq.length * step);
  }, [playPlan]);

  /** Ritimli çalım: her nota kendi süresinde (legato %85), esler sessiz; pad'ler eşlik eder. */
  const playRhythm = useCallback((events: readonly RhythmEvent[], pads: readonly Pad[]): Promise<boolean> => {
    const parts: Float32Array[][] = [];
    const plan: { pad: number; at: number; off: number }[] = [];
    let t = 0;
    for (const e of events) {
      if (e.pad === null) { parts.push(silence(e.ms / 1000)); t += e.ms; continue; }
      const on = Math.max(80, Math.round(e.ms * 0.85));
      parts.push(toneSignal(pads[e.pad]!.freq, on / 1000));
      parts.push(silence((e.ms - on) / 1000));
      plan.push({ pad: e.pad, at: t, off: t + on });
      t += e.ms;
    }
    parts.push(silence(0.15));
    return playPlan(concat(parts), plan, t + 150);
  }, [playPlan]);

  /** Dokunulan pad'i çalar ve kısa süre yakar. */
  const playNote = useCallback((pad: Pad) => {
    playback.current?.stop();
    playback.current = null;
    setLit(pad.id);
    later(() => setLit((v) => (v === pad.id ? null : v)), 220);
    playSignal(toneSignal(pad.freq, TONE_SEC), 1).then((p) => { playback.current = p; }).catch(() => {});
  }, []);

  useEffect(() => stop, [stop]);
  return { lit, playSequence, playRhythm, playNote, stop };
}
