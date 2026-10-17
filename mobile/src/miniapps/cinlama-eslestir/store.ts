import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from '@/core/store/storage';

export type Ears = 'left' | 'right' | 'both';
export type TinnitusType = 'ton' | 'ıslık' | 'uğultu' | 'cırcır';

export type TinnitusProfile = {
  id: string;
  at: string;
  ears: Ears;
  freq: number;
  level: number;
  type: TinnitusType;
};

type State = {
  profiles: TinnitusProfile[];
  add: (p: Omit<TinnitusProfile, 'id' | 'at'>) => TinnitusProfile;
  remove: (id: string) => void;
};

export const useTinnitusStore = create<State>()(
  persist(
    (set, get) => ({
      profiles: [],
      add: (p) => {
        const entry: TinnitusProfile = { ...p, id: `${Date.now()}`, at: new Date().toISOString() };
        set({ profiles: [entry, ...get().profiles].slice(0, 50) });
        return entry;
      },
      remove: (id) => set({ profiles: get().profiles.filter((x) => x.id !== id) }),
    }),
    { name: 'aihearx.miniapp.cinlama-eslestir', storage: jsonStorage() },
  ),
);

export const fmtFreq = (f: number) => (f >= 1000 ? `${(f / 1000).toFixed(1)} kHz` : `${Math.round(f)} Hz`);
export const EAR_LABEL: Record<Ears, string> = { left: 'Sol kulak', right: 'Sağ kulak', both: 'İki kulak' };
