/**
 * Ton Hafızası — saf oyun kuralları (React'siz, test edilebilir).
 * Notalar pentatonik (Do Re Mi Sol La Do' Re' Mi'); her dizi kulağa hoş gelir.
 */
import { colors, gradients } from '@/core/theme';
import { dayIndex, seededRandom } from '@/core/util/day';

export type Note = { id: number; name: string; freq: number; color: string };

export const NOTES: readonly Note[] = [
  { id: 0, name: 'Do', freq: 261.63, color: colors.accent },
  { id: 1, name: 'Re', freq: 293.66, color: gradients.rose[0] },
  { id: 2, name: 'Mi', freq: 329.63, color: colors.mint },
  { id: 3, name: 'Sol', freq: 392.0, color: colors.amber },
  { id: 4, name: 'La', freq: 440.0, color: colors.blue },
  { id: 5, name: "Do'", freq: 523.25, color: colors.accent2 },
  { id: 6, name: "Re'", freq: 587.33, color: colors.red },
  { id: 7, name: "Mi'", freq: 659.25, color: gradients.ember[1] },
];

export const DAILY_CAP = 20;
export const TONE_SEC = 0.35;
export const MAX_LIVES = 3;
export const SILENT_FROM = 4;
export const SHUFFLE_FROM = 7;

export type Mode = 'free' | 'daily';
export type RoundInfo = { silent: boolean; shuffled: boolean };

/** Her 2 turda bir seviye. */
export const levelFor = (round: number) => Math.max(1, Math.ceil(round / 2));
export const padCountFor = (level: number) => (level >= 10 ? 8 : level >= 6 ? 6 : 4);
/** Pad kümeleri iç içedir: 4'lü ⊂ 6'lı ⊂ 8'li; eski notalar hep geçerli kalır. */
export function activeNotes(level: number): number[] {
  const n = padCountFor(level);
  if (n === 4) return [0, 2, 3, 5];
  if (n === 6) return [0, 1, 2, 3, 4, 5];
  return [0, 1, 2, 3, 4, 5, 6, 7];
}
/** Notalar arası boşluk: 600 ms → 250 ms. */
export const gapMsFor = (level: number) => Math.max(250, 600 - (level - 1) * 40);
export const isSilentRound = (level: number, round: number) => level >= SILENT_FROM && round % 3 === 0;
export const isShuffledRound = (level: number, round: number) => level >= SHUFFLE_FROM && round % 2 === 0;

/** Tur puanı: tur² × 10 + hız bonusu (beklenen süre nota başına 900 ms). */
export function roundPoints(round: number, elapsedMs: number): number {
  const base = round * round * 10;
  const expected = round * 900;
  const bonus = Math.round(Math.max(0, 1 - elapsedMs / expected) * round * 15);
  return base + bonus;
}

/** Yeni nota seçer; üç kez üst üste aynı notayı engeller. */
export function pickNote(seq: readonly number[], active: readonly number[], rng: () => number): number {
  let n = active[Math.floor(rng() * active.length)]!;
  const last = seq[seq.length - 1];
  const prev = seq[seq.length - 2];
  if (n === last && n === prev && active.length > 1) n = active[(active.indexOf(n) + 1) % active.length]!;
  return n;
}

export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Günün dizisi: aynı gün herkese aynı 20 nota (seededRandom + dayIndex). */
export function dailyRng(): () => number {
  return seededRandom((dayIndex() * 7919 + 1013) >>> 0);
}

export const shareTextFor = (notes: number, rank: string) => `Ton Hafızası 🎵 ${notes} nota · ${rank} · aihearX`;
