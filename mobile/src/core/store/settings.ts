import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from './storage';

/**
 * Dopamin dengesi ayarları.
 * Uygulama dikkat çeker ama kullanıcıyı tüketmez: akış sonlu, seri baskısı kapatılabilir, sessiz saatler var.
 */
type State = {
  calmMode: boolean;           // seri ve XP animasyonlarını sakinleştirir
  feedScope: 'friends' | 'all';
  feedLimit: number;           // bir oturumda gösterilecek en fazla gönderi
  quietHours: { from: number; to: number } | null;
  haptics: boolean;
  set: (p: Partial<State>) => void;
};

export const useSettings = create<State>()(
  persist(
    (set) => ({ calmMode: false, feedScope: 'all', feedLimit: 30, quietHours: { from: 23, to: 7 }, haptics: true, set: (p) => set(p) }),
    { name: 'aihearx.settings', storage: jsonStorage() },
  ),
);
