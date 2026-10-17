import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

export type DailyRecord = { key: string; score: number; round: number };

type State = {
  bestRound: number;
  bestScore: number;
  bestLevel: number;
  games: number;
  daily: DailyRecord | null;
  record: (r: { round: number; score: number; level: number; dailyKey: string | null }) => void;
};

export const useTonStore = create<State>()(
  persist(
    (set, get) => ({
      bestRound: 0,
      bestScore: 0,
      bestLevel: 0,
      games: 0,
      daily: null,
      record: ({ round, score, level, dailyKey }) => {
        const s = get();
        set({
          bestRound: Math.max(s.bestRound, round),
          bestScore: Math.max(s.bestScore, score),
          bestLevel: Math.max(s.bestLevel, level),
          games: s.games + 1,
          daily: dailyKey ? { key: dailyKey, score, round } : s.daily,
        });
      },
    }),
    { name: 'aihearx.miniapp.ton-hafizasi', storage: jsonStorage() },
  ),
);
