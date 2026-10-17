import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  highScore: number;
  bestCorrect: number;
  games: number;
  /** Yeni rekor ise true döner. */
  record: (score: number, correct: number) => boolean;
};

export const useFrekansStore = create<State>()(
  persist(
    (set, get) => ({
      highScore: 0,
      bestCorrect: 0,
      games: 0,
      record: (score, correct) => {
        const s = get();
        const isHigh = score > s.highScore;
        set({ highScore: Math.max(s.highScore, score), bestCorrect: Math.max(s.bestCorrect, correct), games: s.games + 1 });
        return isHigh;
      },
    }),
    { name: 'aihearx.miniapp.frekans-avi', storage: jsonStorage() },
  ),
);
