import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';
import { dayKey } from '@/core/util/day';

export type CardProgress = { box: number; due: string; seen: number };
type SessionLog = { done: number; known: number };

type State = {
  progress: Record<string, CardProgress>;
  sessions: Record<string, SessionLog>;
  mark: (id: string, known: boolean, today?: string) => void;
  logSession: (today: string, done: number, known: number) => void;
  reset: () => void;
};

/** Leitner aralıkları (gün): kutu 1 → 1, 2 → 2, 3 → 4, 4 → 7, 5 → 14 */
export const INTERVALS = [1, 2, 4, 7, 14] as const;
export const MAX_BOX = 5;

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + n);
  return dayKey(dt);
}

export const useCardStore = create<State>()(
  persist(
    (set) => ({
      progress: {},
      sessions: {},
      mark: (id, known, today = dayKey()) =>
        set((s) => {
          const prev = s.progress[id];
          const box = known ? Math.min(MAX_BOX, (prev?.box ?? 0) + 1) : 1;
          const due = addDays(today, INTERVALS[box - 1] ?? 1);
          return { progress: { ...s.progress, [id]: { box, due, seen: (prev?.seen ?? 0) + 1 } } };
        }),
      logSession: (today, done, known) => set((s) => ({ sessions: { ...s.sessions, [today]: { done, known } } })),
      reset: () => set({ progress: {}, sessions: {} }),
    }),
    { name: 'aihearx.miniapp.odyo-kartlar', storage: jsonStorage() },
  ),
);
