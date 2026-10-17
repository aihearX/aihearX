import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from './storage';
import type { Role } from '@/core/registry/types';

export type Profile = {
  id: string;
  name: string;
  role: Role;
  university?: string;
  city?: string;
  title?: string;
  bio?: string;
  handle: string;
  verified?: boolean;
  /** Odyolog kodu: paylaşım linklerinde taşınır */
  code: string;
};

type State = {
  hydrated: boolean;
  authMode: 'none' | 'guest' | 'apple' | 'email' | 'supabase';
  profile: Profile | null;
  onboarded: boolean;
  setProfile: (p: Profile) => void;
  updateProfile: (p: Partial<Profile>) => void;
  signInGuest: (name?: string) => void;
  signInWith: (mode: State['authMode'], p: Partial<Profile> & { id: string }) => void;
  completeOnboarding: (p: Partial<Profile>) => void;
  signOut: () => void;
  setHydrated: () => void;
};

const genCode = (name: string) => {
  const base = name.split(' ')[0]?.toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, '').slice(0, 5) || 'AHX';
  return `${base}-${Math.floor(10 + Math.random() * 89)}`;
};
const genHandle = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) + Math.floor(Math.random() * 90 + 10);

export const useUser = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      authMode: 'none',
      profile: null,
      onboarded: false,
      setProfile: (profile) => set({ profile }),
      updateProfile: (p) => set({ profile: { ...(get().profile as Profile), ...p } }),
      signInGuest: (name = 'Misafir') =>
        set({ authMode: 'guest', profile: { id: `guest-${Date.now()}`, name, role: 'diger', handle: genHandle(name), code: genCode(name) }, onboarded: false }),
      signInWith: (mode, p) =>
        set({ authMode: mode, profile: { ...p, id: p.id, name: p.name ?? 'aihearX kullanıcısı', role: p.role ?? 'diger', handle: p.handle ?? genHandle(p.name ?? 'kullanici'), code: p.code ?? genCode(p.name ?? 'AHX') }, onboarded: false }),
      completeOnboarding: (p) => set({ profile: { ...(get().profile as Profile), ...p, code: genCode(p.name ?? get().profile?.name ?? 'AHX') }, onboarded: true }),
      signOut: () => set({ authMode: 'none', profile: null, onboarded: false }),
      setHydrated: () => set({ hydrated: true }),
    }),
    { name: 'aihearx.user', storage: jsonStorage(), onRehydrateStorage: () => (s) => s?.setHydrated() },
  ),
);
