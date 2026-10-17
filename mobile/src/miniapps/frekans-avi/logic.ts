/** Frekans Avı oyun kuralları ve yardımcıları. */
export const EASY_FREQS = [250, 500, 1000, 2000, 4000, 8000] as const;
export const MID_FREQS = [...EASY_FREQS, 750, 1500, 3000];
export const HARD_FREQS = [...MID_FREQS, 6000];

export const ROUNDS = 10;
export const LIVES = 3;
export const ROUND_SECONDS = 15;
export const BASE_POINTS = 100;
export const TONE_SECONDS = 0.8;

export type Round = { freq: number; options: number[] };

/** 1-4 kolay, 5-7 orta, 8-10 zor. */
export function poolFor(round: number): number[] {
  if (round <= 4) return [...EASY_FREQS];
  if (round <= 7) return MID_FREQS;
  return HARD_FREQS;
}

export function levelName(round: number): string {
  if (round <= 4) return 'Kolay';
  if (round <= 7) return 'Orta';
  return 'Zor';
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i]!; a[i] = a[j]!; a[j] = t;
  }
  return a;
}

export function makeRound(round: number, rng: () => number = Math.random): Round {
  const pool = poolFor(round);
  const freq = pool[Math.floor(rng() * pool.length)]!;
  const rest = pool.filter((f) => f !== freq);
  // zor seviyede komşu frekansları tercih et: oktav olarak yakınlık
  const sorted = rest.sort((a, b) => Math.abs(Math.log2(a / freq)) - Math.abs(Math.log2(b / freq)));
  const near = round >= 8 ? sorted.slice(0, 5) : sorted;
  const distractors = shuffle(near, rng).slice(0, 3);
  const options = [freq, ...distractors].sort((a, b) => a - b);
  return { freq, options };
}

export function fmtFreq(f: number): string {
  if (f >= 1000) return `${(f / 1000).toString().replace('.', ',')} kHz`;
  return `${f} Hz`;
}

export function fmtNum(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function comboLabel(combo: number): string {
  if (combo >= 8) return 'EFSANE';
  if (combo >= 5) return 'ALEV';
  if (combo >= 3) return 'SERİ';
  return '';
}
