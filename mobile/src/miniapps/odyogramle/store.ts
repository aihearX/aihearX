import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';
import type { Guess } from './logic';

export type Play = { caseId: number; guesses: Guess[]; done: boolean; solved: boolean };

type State = {
  /** dayKey → günlük oyun */
  daily: Record<string, Play>;
  /** caseId → arşiv oyunu */
  archive: Record<number, Play>;
  played: number;
  solved: number;
  saveDaily: (day: string, p: Play) => void;
  saveArchive: (p: Play) => void;
  bump: (solved: boolean) => void;
};

export const useOdyogramleStore = create<State>()(
  persist(
    (set, get) => ({
      daily: {},
      archive: {},
      played: 0,
      solved: 0,
      saveDaily: (day, p) => set({ daily: { ...get().daily, [day]: p } }),
      saveArchive: (p) => set({ archive: { ...get().archive, [p.caseId]: p } }),
      bump: (s) => set({ played: get().played + 1, solved: get().solved + (s ? 1 : 0) }),
    }),
    { name: 'aihearx.miniapp.odyogramle', storage: jsonStorage() },
  ),
);
