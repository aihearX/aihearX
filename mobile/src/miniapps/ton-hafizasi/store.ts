import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

export type DailyRecord = { key: string; score: number; round: number; songId?: string };

type State = {
  bestRound: number;
  bestScore: number;
  bestLevel: number;
  games: number;
  /** Tamamlanan toplam şarkı. */
  songsDone: number;
  /** Serbest şarkı modunda sıradaki şarkı indeksi (şarkılar döner). */
  songCursor: number;
  daily: DailyRecord | null;
  record: (r: { round: number; score: number; level: number; songsDone: number; nextCursor: number | null; dailyKey: string | null; songId: string | null }) => void;
};

/** v1 (sürümsüz) kayıtlar: songsDone/songCursor yoktu. */
type Persisted = Partial<Pick<State, 'bestRound' | 'bestScore' | 'bestLevel' | 'games' | 'songsDone' | 'songCursor' | 'daily'>>;

export const useTonStore = create<State>()(
  persist(
    (set, get) => ({
      bestRound: 0,
      bestScore: 0,
      bestLevel: 0,
      games: 0,
      songsDone: 0,
      songCursor: 0,
      daily: null,
      record: ({ round, score, level, songsDone, nextCursor, dailyKey, songId }) => {
        const s = get();
        set({
          bestRound: Math.max(s.bestRound, round),
          bestScore: Math.max(s.bestScore, score),
          bestLevel: Math.max(s.bestLevel, level),
          games: s.games + 1,
          songsDone: s.songsDone + songsDone,
          songCursor: nextCursor ?? s.songCursor,
          daily: dailyKey ? { key: dailyKey, score, round, songId: songId ?? undefined } : s.daily,
        });
      },
    }),
    {
      name: 'aihearx.miniapp.ton-hafizasi',
      storage: jsonStorage(),
      version: 2,
      migrate: (persisted: unknown): State => {
        const p = (persisted ?? {}) as Persisted;
        return {
          bestRound: p.bestRound ?? 0, bestScore: p.bestScore ?? 0, bestLevel: p.bestLevel ?? 0, games: p.games ?? 0,
          songsDone: p.songsDone ?? 0, songCursor: p.songCursor ?? 0, daily: p.daily ?? null,
        } as State;
      },
    },
  ),
);
