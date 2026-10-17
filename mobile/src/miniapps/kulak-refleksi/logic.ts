export const TRIALS = 20;
export const MIN_DELAY = 1000;
export const MAX_DELAY = 3000;
export const RESPONSE_WINDOW = 2000;
export const TONE_FREQ = 1000;
export const TONE_SECONDS = 0.15;
export const WRONG_PENALTY = 300;

export type Ear = 'left' | 'right';
export type TrialKind = 'hit' | 'wrong' | 'early' | 'miss';
export type Trial = { ear: Ear; kind: TrialKind; rt: number | null };

export const KIND_LABEL: Record<TrialKind, string> = { hit: 'Doğru', wrong: 'Yanlış taraf', early: 'Erken', miss: 'Kaçtı' };

export function randomEar(rng: () => number = Math.random): Ear { return rng() < 0.5 ? 'left' : 'right'; }
export function randomDelay(rng: () => number = Math.random): number { return MIN_DELAY + Math.floor(rng() * (MAX_DELAY - MIN_DELAY)); }

export type Summary = { hits: number; accuracy: number; meanRt: number | null; medianRt: number | null; bestRt: number | null; points: number; penalized: number };

export function summarize(trials: Trial[]): Summary {
  const rts = trials.filter((t): t is Trial & { rt: number } => t.kind === 'hit' && t.rt != null).map((t) => t.rt).sort((a, b) => a - b);
  const hits = rts.length;
  const accuracy = trials.length ? hits / trials.length : 0;
  const meanRt = hits ? Math.round(rts.reduce((a, b) => a + b, 0) / hits) : null;
  const medianRt = hits ? rts[Math.floor(hits / 2)]! : null;
  const bestRt = hits ? rts[0]! : null;
  const penalized = trials.filter((t) => t.kind === 'wrong').length * WRONG_PENALTY;
  const effective = meanRt == null ? null : meanRt + penalized / Math.max(1, hits);
  const points = effective == null ? 0 : Math.round(Math.max(0, 1000 - effective) * accuracy);
  return { hits, accuracy, meanRt, medianRt, bestRt, points, penalized };
}

export const BUCKETS = [
  { label: '< 200', min: 0, max: 200 },
  { label: '200-300', min: 200, max: 300 },
  { label: '300-400', min: 300, max: 400 },
  { label: '400-500', min: 400, max: 500 },
  { label: '500+', min: 500, max: Infinity },
] as const;

export function distribution(trials: Trial[]): number[] {
  const rts = trials.filter((t) => t.kind === 'hit' && t.rt != null).map((t) => t.rt as number);
  return BUCKETS.map((b) => rts.filter((r) => r >= b.min && r < b.max).length);
}

export function rtVerdict(meanRt: number | null): string {
  if (meanRt == null) return 'Ölçülemedi';
  if (meanRt < 220) return 'Şimşek gibi ⚡';
  if (meanRt < 300) return 'Çok hızlı';
  if (meanRt < 400) return 'İyi refleks';
  if (meanRt < 550) return 'Ortalama';
  return 'Isınma turu';
}
