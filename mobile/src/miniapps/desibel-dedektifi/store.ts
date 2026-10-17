import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  highScore: number;
  bestHits: number;
  games: number;
  record: (score: number, hits: number) => boolean;
};

export const useDesibelStore = create<State>()(
  persist(
    (set, get) => ({
      highScore: 0,
      bestHits: 0,
      games: 0,
      record: (score, hits) => {
        const s = get();
        const high = score > s.highScore;
        set({ highScore: Math.max(s.highScore, score), bestHits: Math.max(s.bestHits, hits), games: s.games + 1 });
        return high;
      },
    }),
    { name: 'aihearx.miniapp.desibel-dedektifi', storage: jsonStorage() },
  ),
);
