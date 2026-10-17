/**
 * Ses Dedektifi oyun kuralları: seviye parametreleri, seçenek üretimi, puanlama, günlük plan.
 * Saf fonksiyonlar; React'ten bağımsız.
 */
import { dayIndex, seededRandom } from '@/core/util/day';
import { SOUNDS, type SoundDef } from './sounds';

export type Mode = 'daily' | 'free';
export type LevelParams = { seconds: number; clip: number; sameCategory: boolean; noise: number; maxDifficulty: 1 | 2 | 3 };
export type RoundPlan = { sound: SoundDef; options: SoundDef[] };

export const LIVES = 3;
export const DAILY_ROUNDS = 10;
export const MAX_LEVEL = 5;
export const MAX_COMBO = 5;
export const REPLAY_COST = 10;
/** Tur başına "mümkün" puan; rütbe oranı için payda. */
export const ROUND_MAX = 500;
export const OPTION_COUNT = 4;
export const XP = 40;

const LEVELS: LevelParams[] = [
  { seconds: 10, clip: 2.4, sameCategory: false, noise: 0, maxDifficulty: 1 },
  { seconds: 9, clip: 2.0, sameCategory: false, noise: 0, maxDifficulty: 2 },
  { seconds: 8, clip: 1.6, sameCategory: true, noise: 0, maxDifficulty: 3 },
  { seconds: 6.5, clip: 1.35, sameCategory: true, noise: 0.05, maxDifficulty: 3 },
  { seconds: 5, clip: 1.2, sameCategory: true, noise: 0.09, maxDifficulty: 3 },
];

/** Serbest: her 5 turda bir seviye. Günlük: 10 turda 5 seviyeyi dolaşır (her 2 turda bir). */
export function levelFor(round: number, mode: Mode): number {
  const lv = mode === 'daily' ? Math.ceil(round / 2) : Math.floor((round - 1) / 5) + 1;
  return Math.max(1, Math.min(MAX_LEVEL, lv));
}

export const paramsFor = (level: number): LevelParams => LEVELS[Math.max(1, Math.min(MAX_LEVEL, level)) - 1] ?? LEVELS[0]!;

export const LEVEL_HINT: Record<number, string> = {
  2: 'Daha kısa klipler',
  3: 'Benzer sesler bir arada',
  4: 'Gürültü bindi, süre kısaldı',
  5: 'Son hız: 5 saniye',
};

export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Seviyeye göre hedef ses + 4 seçenek. recent: son turlarda çalınan id'ler (tekrar etmesin). */
export function planRound(level: number, rng: () => number, recent: readonly string[], pool: readonly SoundDef[] = SOUNDS): RoundPlan {
  const p = paramsFor(level);
  const eligible = pool.filter((s) => s.difficulty <= p.maxDifficulty && !recent.includes(s.id));
  const base = eligible.length >= OPTION_COUNT ? eligible : pool.filter((s) => !recent.includes(s.id));
  const sound = shuffle(base.length ? base : pool, rng)[0]!;
  const others = pool.filter((s) => s.id !== sound.id);
  const same = shuffle(others.filter((s) => s.category === sound.category), rng);
  const diff = shuffle(others.filter((s) => s.category !== sound.category), rng);
  // Üst seviyelerde aynı kategori öncelikli; alt seviyelerde 1 benzer + 2 farklı (hafif ipucu).
  const picks = p.sameCategory ? [...same, ...diff] : [...same.slice(0, 1), ...diff, ...same.slice(1)];
  const options = shuffle([sound, ...picks.slice(0, OPTION_COUNT - 1)], rng);
  return { sound, options };
}

/** Günün Serisi: aynı gün herkese aynı 10 tur (tohum = gün indeksi). */
export function planDaily(): RoundPlan[] {
  const rng = seededRandom(dayIndex() * 7919 + 17);
  const recent: string[] = [];
  const rounds: RoundPlan[] = [];
  for (let r = 1; r <= DAILY_ROUNDS; r++) {
    const plan = planRound(levelFor(r, 'daily'), rng, recent);
    rounds.push(plan);
    recent.push(plan.sound.id);
  }
  return rounds;
}

/** Doğru cevap puanı: 100 × kombo + kalan saniye × 10. */
export const roundPoints = (combo: number, secondsLeft: number): number => 100 * Math.min(MAX_COMBO, Math.max(1, combo)) + Math.round(secondsLeft) * 10;

export const ratioFor = (score: number, rounds: number): number => Math.max(0, Math.min(1, score / (Math.max(1, rounds) * ROUND_MAX)));

export const shareTextFor = (score: number, rankName: string): string => `Ses Dedektifi 🔍 ${score.toLocaleString('tr-TR')} puan · ${rankName} · aihearX`;
