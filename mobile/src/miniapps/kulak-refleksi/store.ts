import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  /** En iyi ortalama tepki süresi (ms); yalnızca ≥%80 doğrulukla elde edilen oyunlar sayılır. */
  bestMeanRt: number | null;
  bestAccuracy: number;
  games: number;
  record: (meanRt: number | null, accuracy: number) => boolean;
};

export const useRefleksStore = create<State>()(
  persist(
    (set, get) => ({
      bestMeanRt: null,
      bestAccuracy: 0,
      games: 0,
      record: (meanRt, accuracy) => {
        const s = get();
        const eligible = meanRt != null && accuracy >= 0.8;
        const isBest = eligible && (s.bestMeanRt == null || meanRt < s.bestMeanRt);
        set({ bestMeanRt: isBest ? meanRt : s.bestMeanRt, bestAccuracy: Math.max(s.bestAccuracy, accuracy), games: s.games + 1 });
        return isBest;
      },
    }),
    { name: 'aihearx.miniapp.kulak-refleksi', storage: jsonStorage() },
  ),
);
