import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';
import { isYesterday } from '@/core/util/day';
import type { Row } from './logic';

export type DailyEntry = { rows: Row[]; done: boolean; won: boolean };
type Stats = { played: number; won: number; streak: number; maxStreak: number; dist: number[] };

type State = {
  /** dayKey → günün oyunu */
  daily: Record<string, DailyEntry>;
  lastDay: string | null;
  stats: Stats;
  saveDaily: (day: string, entry: DailyEntry) => void;
  finishDaily: (day: string, won: boolean, tries: number) => void;
};

const empty: Stats = { played: 0, won: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0] };

export const useKelimeStore = create<State>()(
  persist(
    (set, get) => ({
      daily: {},
      lastDay: null,
      stats: empty,
      saveDaily: (day, entry) => set({ daily: { ...get().daily, [day]: entry } }),
      finishDaily: (day, won, tries) => {
        const s = get().stats;
        const prev = get().lastDay;
        const streak = won ? (prev && isYesterday(prev) ? s.streak + 1 : 1) : 0;
        const dist = [...s.dist];
        if (won) dist[tries - 1] = (dist[tries - 1] ?? 0) + 1;
        set({ lastDay: day, stats: { played: s.played + 1, won: s.won + (won ? 1 : 0), streak, maxStreak: Math.max(s.maxStreak, streak), dist } });
      },
    }),
    { name: 'aihearx.miniapp.odyo-kelime', storage: jsonStorage() },
  ),
);
