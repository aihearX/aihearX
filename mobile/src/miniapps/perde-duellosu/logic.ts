/**
 * Perde Düellosu — kurallar ve ses üretimi (React'siz).
 * Aralık p = yüzde fark (100 = bir oktav, 1 ≈ yarım tonun altıda biri).
 */
import { SAMPLE_RATE, concat, silence } from '@/core/audio';

export const START_P = 100;
export const FLOOR_P = 1;
export const TONE_SEC = 0.4;
export const GAP_SEC = 0.15;
export const SOLO_SECONDS = 60;
export const MAX_LIVES = 3;
export const DUEL_TARGET = 10;
export const PAIR_MS = Math.round((TONE_SEC * 2 + GAP_SEC) * 1000);
export const SECOND_AT_MS = Math.round((TONE_SEC + GAP_SEC) * 1000);

export const shrink = (p: number) => Math.max(FLOOR_P, p * 0.8);
export const grow = (p: number) => Math.min(START_P, p * 1.4);
export const growDuel = (p: number) => Math.min(START_P, p * 1.25);

export type Trial = { f1: number; f2: number; higherFirst: boolean; p: number; warble: number; amp1: number; amp2: number };

/** Taban frekans 200–4000 Hz arasında log-düzgün; genlik ±%15 oynar ki yükseklik ipucu olmasın. */
export function makeTrial(p: number, level: number, rng: () => number = Math.random): Trial {
  const ratio = 1 + p / 100;
  const lo = Math.log(200);
  const hi = Math.log(4000 / ratio);
  const base = Math.exp(lo + rng() * (hi - lo));
  const higherFirst = rng() < 0.5;
  const warble = level >= 3 && rng() < 0.35 ? Math.min(0.012, (p / 100) * 0.25) : 0;
  return {
    f1: higherFirst ? base * ratio : base,
    f2: higherFirst ? base : base * ratio,
    higherFirst,
    p,
    warble,
    amp1: 0.3 + rng() * 0.1,
    amp2: 0.3 + rng() * 0.1,
  };
}

/** Faz biriktiren sinüs; isteğe bağlı küçük derinlikli 6 Hz vibrato (warble). */
function tone(freq: number, amp: number, warble: number): Float32Array[] {
  const n = Math.floor(TONE_SEC * SAMPLE_RATE);
  const ramp = Math.floor(0.015 * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const f = freq * (1 + warble * Math.sin(2 * Math.PI * 6 * t));
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    const env = i < ramp ? i / ramp : i > n - ramp ? Math.max(0, (n - i) / ramp) : 1;
    out[i] = amp * Math.sin(phase) * env;
  }
  return [out, out];
}

export const renderPair = (t: Trial): Float32Array[] => concat([tone(t.f1, t.amp1, t.warble), silence(GAP_SEC), tone(t.f2, t.amp2, t.warble)]);

export const levelForP = (p: number) => (p >= 50 ? 1 : p >= 25 ? 2 : p >= 12 ? 3 : p >= 6 ? 4 : p >= 3 ? 5 : p >= 1.5 ? 6 : 7);
/** Aralık küçüldükçe puan artar: %100 → 10, %1 → 100. */
export const basePoints = (p: number) => Math.round(10 + (90 * Math.log(START_P / Math.max(FLOOR_P, p))) / Math.log(START_P));
export const multiplier = (streak: number) => Math.min(3, 1 + Math.floor(streak / 4) * 0.5);

export const semitones = (p: number) => 12 * Math.log2(1 + p / 100);
const tr = (n: number, digits: number) => n.toFixed(digits).replace('.', ',');
export const fmtPct = (p: number) => (p >= 10 ? `%${Math.round(p)}` : `%${tr(p, 1)}`);
export const fmtSemi = (p: number) => { const s = semitones(p); return `${s >= 1 ? tr(s, 1) : tr(s, 2)} yarım ton`; };

/** Rütbe oranı: %100 → 0, %1 → 1 (logaritmik). */
export function ratioFor(minP: number | null): number {
  if (minP === null) return 0;
  return Math.max(0, Math.min(1, Math.log(START_P / minP) / Math.log(START_P)));
}

export const soloShareText = (score: number, minP: number | null, rank: string) =>
  `Perde Düellosu 🎼 ${score.toLocaleString('tr-TR')} puan${minP !== null ? ` · ${fmtPct(minP)} fark` : ''} · ${rank} · aihearX`;
export const duelShareText = (winner: string, ws: number, loser: string, ls: number) => `Perde Düellosu ⚔️ ${winner} ${ws}-${ls} ${loser} · aihearX`;
