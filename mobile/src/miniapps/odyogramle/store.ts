import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';
import { dayKey, isYesterday } from '@/core/util/day';
import type { Guess } from './logic';

export type Play = { caseId: number; guesses: Guess[]; done: boolean; solved: boolean };

export type DrillRecord = { best: number; games: number; bestCombo: number; lastScore: number };

type State = {
  /** dayKey → günlük oyun */
  daily: Record<string, Play>;
  /** caseId → arşiv oyunu */
  archive: Record<number, Play>;
  played: number;
  solved: number;
  /** Çözülen vakalarda tahmin sayısı dağılımı: index 0 → 1 tahmin ... index 5 → 6 tahmin */
  dist: number[];
  /** Günlük vaka serisi (ardışık gün) */
  streak: number;
  bestStreak: number;
  /** Günün vakasının son çözüldüğü gün (dayKey) */
  lastDailyDay: string | null;
  drill: DrillRecord;
  saveDaily: (day: string, p: Play) => void;
  saveArchive: (p: Play) => void;
  /** Oyun bitince bir kez: istatistik, dağılım ve (günlükse) seri güncellenir. */
  finish: (p: Play, daily: boolean, day: string) => void;
  recordDrill: (score: number, combo: number) => void;
};

const EMPTY_DIST = [0, 0, 0, 0, 0, 0];

export const useOdyogramleStore = create<State>()(
  persist(
    (set, get) => ({
      daily: {},
      archive: {},
      played: 0,
      solved: 0,
      dist: [...EMPTY_DIST],
      streak: 0,
      bestStreak: 0,
      lastDailyDay: null,
      drill: { best: 0, games: 0, bestCombo: 0, lastScore: 0 },
      saveDaily: (day, p) => set({ daily: { ...get().daily, [day]: p } }),
      saveArchive: (p) => set({ archive: { ...get().archive, [p.caseId]: p } }),
      finish: (p, daily, day) => {
        const s = get();
        const dist = [...(s.dist.length === 6 ? s.dist : EMPTY_DIST)];
        if (p.solved) dist[Math.min(5, Math.max(0, p.guesses.length - 1))]! += 1;
        let streak = s.streak;
        let lastDailyDay = s.lastDailyDay;
        if (daily) {
          if (p.solved) {
            if (s.lastDailyDay === day) streak = Math.max(1, streak);
            else if (s.lastDailyDay && isYesterday(s.lastDailyDay)) streak += 1;
            else streak = 1;
            lastDailyDay = day;
          } else {
            streak = 0;
          }
        }
        set({ played: s.played + 1, solved: s.solved + (p.solved ? 1 : 0), dist, streak, bestStreak: Math.max(s.bestStreak, streak), lastDailyDay });
      },
      recordDrill: (score, combo) => {
        const d = get().drill;
        set({ drill: { best: Math.max(d.best, score), games: d.games + 1, bestCombo: Math.max(d.bestCombo, combo), lastScore: score } });
      },
    }),
    { name: 'aihearx.miniapp.odyogramle', storage: jsonStorage(), version: 2, migrate: (persisted) => persisted as State },
  ),
);

/** Seri bugüne ya da düne dayanmıyorsa kopmuştur; ekranda 0 gösterilir. */
export function liveStreak(s: Pick<State, 'streak' | 'lastDailyDay'>): number {
  if (!s.lastDailyDay) return 0;
  if (s.lastDailyDay === dayKey() || isYesterday(s.lastDailyDay)) return s.streak;
  return 0;
}

/** Çözülen vakalarda ortalama tahmin sayısı (1 ondalık), hiç yoksa null. */
export function averageGuesses(dist: number[]): number | null {
  const n = dist.reduce((a, b) => a + b, 0);
  if (!n) return null;
  const sum = dist.reduce((a, b, i) => a + b * (i + 1), 0);
  return Math.round((sum / n) * 10) / 10;
}
