import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';
import type { QId } from './questionnaires';

export type SavedResult = { score: number; grade: string; date: string; answers: number[] };

type State = {
  results: Record<string, SavedResult[]>;
  save: (id: QId, r: SavedResult) => void;
  clear: (id: QId) => void;
};

export const useSurveyStore = create<State>()(
  persist(
    (set) => ({
      results: {},
      save: (id, r) => set((s) => ({ results: { ...s.results, [id]: [r, ...(s.results[id] ?? [])].slice(0, 12) } })),
      clear: (id) => set((s) => ({ results: { ...s.results, [id]: [] } })),
    }),
    { name: 'aihearx.miniapp.anket-merkezi', storage: jsonStorage() },
  ),
);
