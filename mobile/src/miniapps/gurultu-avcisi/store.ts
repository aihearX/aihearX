import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  best: number;
  games: number;
  /** En zor doğru bilinen basamak (0..MAX_STEP) */
  bestStep: number;
  /** En zor doğru bilinen SNR (dB, göreli) */
  bestSnrDb: number | null;
  /** Günün avı: dayKey → skor */
  daily: Record<string, number>;
  record: (r: { score: number; step: number; snrDb: number | null; day?: string }) => void;
};

export const useGurultuStore = create<State>()(
  persist(
    (set, get) => ({
      best: 0,
      games: 0,
      bestStep: 0,
      bestSnrDb: null,
      daily: {},
      record: ({ score, step, snrDb, day }) => {
        const s = get();
        const bestSnrDb = snrDb == null ? s.bestSnrDb : s.bestSnrDb == null ? snrDb : Math.min(s.bestSnrDb, snrDb);
        set({
          best: Math.max(s.best, score),
          games: s.games + 1,
          bestStep: Math.max(s.bestStep, step),
          bestSnrDb,
          daily: day ? { ...s.daily, [day]: score } : s.daily,
        });
      },
    }),
    { name: 'aihearx.miniapp.gurultu-avcisi', storage: jsonStorage() },
  ),
);
