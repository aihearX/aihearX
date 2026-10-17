import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

export type EarAgeEntry = {
  id: string;
  /** ISO tarih */
  at: string;
  age: number;
  /** Duyulan en tiz frekans (Hz) ya da null */
  highest: number | null;
  /** Tuzak denemede "Duydum" dendi → düşük güven */
  lowConfidence: boolean;
  /** Duyulan frekanslar (Hz) — mini merdiven için */
  heard: number[];
};

type State = {
  history: EarAgeEntry[];
  warble: boolean;
  add: (e: Omit<EarAgeEntry, 'id' | 'at'>) => EarAgeEntry;
  clear: () => void;
  setWarble: (v: boolean) => void;
};

export const useEarAgeStore = create<State>()(
  persist(
    (set, get) => ({
      history: [],
      warble: false,
      add: (e) => {
        const entry: EarAgeEntry = { ...e, id: `${Date.now()}`, at: new Date().toISOString() };
        set({ history: [entry, ...get().history].slice(0, 30) });
        return entry;
      },
      clear: () => set({ history: [] }),
      setWarble: (v) => set({ warble: v }),
    }),
    { name: 'aihearx.miniapp.kulagin-kac-yasinda', storage: jsonStorage() },
  ),
);

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};
