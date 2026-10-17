import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  /** En yüksek skor (yükseklik + jeton × 5) */
  best: number;
  games: number;
  /** En yüksek tırmanılan metre */
  bestMeters: number;
  /** Ulaşılan en ileri bölge adı */
  bestZone: string;
  record: (r: { score: number; meters: number; zone: string }) => void;
};

export const useZarStore = create<State>()(
  persist(
    (set, get) => ({
      best: 0,
      games: 0,
      bestMeters: 0,
      bestZone: '',
      record: ({ score, meters, zone }) => {
        const s = get();
        set({
          best: Math.max(s.best, score),
          games: s.games + 1,
          bestMeters: Math.max(s.bestMeters, meters),
          bestZone: meters >= s.bestMeters ? zone : s.bestZone,
        });
      },
    }),
    { name: 'aihearx.miniapp.zar-ziplamasi', storage: jsonStorage() },
  ),
);
