import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from './storage';
import { dayKey, isYesterday } from '@/core/util/day';
import type { MiniAppResult } from '@/core/registry/types';

export type Badge = { id: string; name: string; icon: string; earnedAt: string };

type State = {
  xp: number;
  level: number;
  streak: number;
  lastActiveDay: string | null;
  /** app id → son 30 sonuç */
  results: Record<string, MiniAppResult[]>;
  /** app id → en iyi puan */
  bests: Record<string, number>;
  /** app id → kaç kez tamamlandı */
  plays: Record<string, number>;
  /** günlük tamamlananlar: dayKey → app id listesi */
  daily: Record<string, string[]>;
  badges: Badge[];
  /** Dopamin dengesi: günlük hedef (mini uygulama sayısı). Küçük tutulur. */
  dailyGoal: number;
  complete: (r: MiniAppResult) => { xpGained: number; leveledUp: boolean; streak: number; newBadges: Badge[] };
  touchStreak: () => void;
  award: (b: Omit<Badge, 'earnedAt'>) => boolean;
  reset: () => void;
};

export const xpForLevel = (lvl: number) => Math.round(120 * Math.pow(lvl, 1.35));
export const levelFromXp = (xp: number) => { let l = 1; while (xp >= xpForLevel(l + 1)) l++; return l; };

export const useProgress = create<State>()(
  persist(
    (set, get) => ({
      xp: 0, level: 1, streak: 0, lastActiveDay: null, results: {}, bests: {}, plays: {}, daily: {}, badges: [], dailyGoal: 2,
      touchStreak: () => {
        const today = dayKey();
        const { lastActiveDay, streak } = get();
        if (lastActiveDay === today) return;
        const next = lastActiveDay && isYesterday(lastActiveDay) ? streak + 1 : 1;
        set({ streak: next, lastActiveDay: today });
      },
      award: (b) => {
        if (get().badges.some((x) => x.id === b.id)) return false;
        set({ badges: [...get().badges, { ...b, earnedAt: new Date().toISOString() }] });
        return true;
      },
      complete: (r) => {
        get().touchStreak();
        const s = get();
        const xpGained = r.xp ?? 20;
        const xp = s.xp + xpGained;
        const level = levelFromXp(xp);
        const leveledUp = level > s.level;
        const today = dayKey();
        const list = [r, ...(s.results[r.appId] ?? [])].slice(0, 30);
        const best = Math.max(s.bests[r.appId] ?? -Infinity, r.points ?? r.score ?? 0);
        const dailyList = Array.from(new Set([...(s.daily[today] ?? []), r.appId]));
        set({
          xp, level,
          results: { ...s.results, [r.appId]: list },
          bests: { ...s.bests, [r.appId]: best },
          plays: { ...s.plays, [r.appId]: (s.plays[r.appId] ?? 0) + 1 },
          daily: { ...s.daily, [today]: dailyList },
        });
        const newBadges: Badge[] = [];
        const tryBadge = (b: Omit<Badge, 'earnedAt'>) => { if (get().award(b)) newBadges.push({ ...b, earnedAt: new Date().toISOString() }); };
        if (Object.keys(get().plays).length === 1 && (get().plays[r.appId] ?? 0) === 1) tryBadge({ id: 'ilk-adim', name: 'İlk Adım', icon: '🚀' });
        if (get().streak >= 7) tryBadge({ id: 'seri-7', name: '7 Gün Seri', icon: '🔥' });
        if (get().streak >= 30) tryBadge({ id: 'seri-30', name: '30 Gün Seri', icon: '🏆' });
        if (Object.keys(get().plays).length >= 10) tryBadge({ id: 'kasif', name: 'Kâşif', icon: '🧭' });
        if (leveledUp && level >= 5) tryBadge({ id: 'seviye-5', name: 'Seviye 5', icon: '⭐' });
        return { xpGained, leveledUp, streak: get().streak, newBadges };
      },
      reset: () => set({ xp: 0, level: 1, streak: 0, lastActiveDay: null, results: {}, bests: {}, plays: {}, daily: {}, badges: [] }),
    }),
    { name: 'aihearx.progress', storage: jsonStorage() },
  ),
);
