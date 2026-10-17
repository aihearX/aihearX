import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  bestScore: number;
  /** Güvenilir şekilde ayırt edilen en küçük fark (%); null = henüz yok */
  bestMinP: number | null;
  games: number;
  duels: number;
  recordSolo: (r: { score: number; minP: number | null }) => void;
  recordDuel: () => void;
};

export const usePerdeStore = create<State>()(
  persist(
    (set, get) => ({
      bestScore: 0,
      bestMinP: null,
      games: 0,
      duels: 0,
      recordSolo: ({ score, minP }) => {
        const s = get();
        set({
          bestScore: Math.max(s.bestScore, score),
          bestMinP: minP === null ? s.bestMinP : s.bestMinP === null ? minP : Math.min(s.bestMinP, minP),
          games: s.games + 1,
        });
      },
      recordDuel: () => set({ duels: get().duels + 1 }),
    }),
    { name: 'aihearx.miniapp.perde-duellosu', storage: jsonStorage() },
  ),
);
