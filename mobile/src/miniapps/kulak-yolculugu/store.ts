import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  best: number;
  games: number;
  /** Açık bölüm sayısı (1-4). Bir bölümü bitirince sonraki açılır. */
  unlocked: number;
  record: (score: number, stats: Record<string, number | string>) => void;
};

export const useKulakYolculuguStore = create<State>()(
  persist(
    (set, get) => ({
      best: 0,
      games: 0,
      unlocked: 1,
      record: (score, stats) => {
        const s = get();
        const reached = Number(stats['Bölüm'] ?? 1);
        // "Bölüm" = ulaşılan en yüksek bölüm; o bölüme ulaşmak onu açar.
        const unlocked = Math.min(4, Math.max(s.unlocked, Number.isFinite(reached) ? reached : 1));
        set({ best: Math.max(s.best, score), games: s.games + 1, unlocked });
      },
    }),
    { name: 'aihearx.miniapp.kulak-yolculugu', storage: jsonStorage() },
  ),
);
