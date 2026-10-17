import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

type State = {
  best: number;
  games: number;
  /** En uzun mesafe (m) */
  bestMeters: number;
  /** Ulaşılan en yüksek seviye */
  bestLevel: number;
  record: (score: number, stats: Record<string, number | string>) => void;
};

export const useKokleaStore = create<State>()(
  persist(
    (set, get) => ({
      best: 0,
      games: 0,
      bestMeters: 0,
      bestLevel: 1,
      record: (score, stats) => {
        const s = get();
        set({
          best: Math.max(s.best, score),
          games: s.games + 1,
          bestMeters: Math.max(s.bestMeters, Number(stats.Mesafe ?? 0)),
          bestLevel: Math.max(s.bestLevel, Number(stats.Seviye ?? 1)),
        });
      },
    }),
    { name: 'aihearx.miniapp.koklea-kosusu', storage: jsonStorage() },
  ),
);

/** Skora göre rütbe (paylaşım metni için). */
export const rankOf = (score: number) => (score >= 3000 ? 'Apeks Kaşifi' : score >= 2000 ? 'Altın Kulak' : score >= 1000 ? 'Hızlı Koşucu' : score >= 400 ? 'Membran Yolcusu' : 'Çaylak');
