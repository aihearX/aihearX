import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

export type DailyEntry = { score: number; rank: string; correct: number; level: number };

type State = {
  best: number;
  highLevel: number;
  gamesPlayed: number;
  /** dayKey → günün serisi sonucu (günde bir kez). */
  daily: Record<string, DailyEntry>;
  record: (r: { score: number; level: number; correct: number; rank: string; dayKey?: string }) => void;
};

export const useDedektifStore = create<State>()(
  persist(
    (set, get) => ({
      best: 0,
      highLevel: 0,
      gamesPlayed: 0,
      daily: {},
      record: ({ score, level, correct, rank, dayKey }) => {
        const s = get();
        const daily = { ...s.daily };
        if (dayKey) {
          daily[dayKey] = { score, rank, correct, level };
          // son 30 gün kalsın
          for (const k of Object.keys(daily).sort().slice(0, -30)) delete daily[k];
        }
        set({ best: Math.max(s.best, score), highLevel: Math.max(s.highLevel, level), gamesPlayed: s.gamesPlayed + 1, daily });
      },
    }),
    { name: 'aihearx.miniapp.ses-dedektifi', storage: jsonStorage() },
  ),
);
