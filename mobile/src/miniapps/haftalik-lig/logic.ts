import { dayKey, seededRandom } from '@/core/util/day';
import { UNIVERSITIES } from '@/core/data/universities';

/** Pazartesi başlangıçlı hafta. */
export function weekStart(d = new Date()): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const dow = (x.getDay() + 6) % 7; // Pzt=0
  x.setDate(x.getDate() - dow);
  return x;
}
export function weekDays(d = new Date()): string[] {
  const s = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(s); x.setDate(s.getDate() + i); return dayKey(x); });
}
export function weekNumber(d = new Date()): number {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dow = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - dow);
  const y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x.getTime() - y0.getTime()) / 86400000 + 1) / 7);
}
export function weekSeed(d = new Date()): number { return weekStart(d).getFullYear() * 100 + weekNumber(d); }
export function daysToReset(d = new Date()): number {
  const s = weekStart(d); const next = new Date(s); next.setDate(s.getDate() + 7);
  return Math.max(1, Math.ceil((next.getTime() - d.getTime()) / 86400000));
}
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export function weekLabel(d = new Date()): string {
  const s = weekStart(d); const e = new Date(s); e.setDate(s.getDate() + 6);
  return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]}`;
}

export const POINTS_PER_APP = 50;
export const STREAK_BONUS = 20;

/** Haftalık puan: bu hafta tamamlanan mini uygulama sayısı × 50 + seri bonusu. */
export function weeklyPoints(daily: Record<string, string[]>, streak: number): { points: number; completions: number; streakBonus: number } {
  const completions = weekDays().reduce((a, k) => a + (daily[k]?.length ?? 0), 0);
  const streakBonus = Math.min(7, streak) * STREAK_BONUS;
  return { points: completions * POINTS_PER_APP + streakBonus, completions, streakBonus };
}

export type UniRow = { name: string; points: number; members: number; you: boolean; rank: number };
export function universityTable(userUni: string | undefined, userPoints: number, seed = weekSeed()): UniRow[] {
  const rng = seededRandom(seed);
  const rows = UNIVERSITIES.filter((u) => u !== 'Diğer').map((name) => {
    const members = 8 + Math.floor(rng() * 40);
    const base = 1500 + Math.floor(rng() * 7500);
    const you = !!userUni && userUni === name;
    return { name, points: you ? base + userPoints : base, members: you ? members + 1 : members, you, rank: 0 };
  });
  if (userUni && !rows.some((r) => r.you)) rows.push({ name: userUni, points: userPoints, members: 1, you: true, rank: 0 });
  return rows.sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }));
}

const FIRST = ['Elif', 'Zeynep', 'Yusuf', 'Ahmet', 'Defne', 'Mert', 'Ece', 'Can', 'Beren', 'Emre', 'Selin', 'Kerem', 'Nehir', 'Arda', 'İrem', 'Burak', 'Derya', 'Oğuz', 'Melis', 'Tuna', 'Ayşe', 'Barış', 'Ceren', 'Deniz', 'Gizem', 'Hakan', 'Lale', 'Onur', 'Pelin', 'Serkan'];
const LAST = ['Y.', 'K.', 'A.', 'D.', 'Ö.', 'Ç.', 'Ş.', 'E.', 'T.', 'B.', 'S.', 'G.'];

export type PlayerRow = { name: string; university: string; points: number; you: boolean; rank: number };
export function playerBoard(userName: string, userUni: string | undefined, userPoints: number, seed = weekSeed()): { top: PlayerRow[]; you: PlayerRow } {
  const rng = seededRandom(seed * 7 + 1);
  const unis = UNIVERSITIES.filter((u) => u !== 'Diğer');
  const used = new Set<string>();
  const rows: PlayerRow[] = [];
  while (rows.length < 40) {
    const name = `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
    if (used.has(name)) continue;
    used.add(name);
    rows.push({ name, university: unis[Math.floor(rng() * unis.length)]!, points: 100 + Math.floor(rng() * 1400), you: false, rank: 0 });
  }
  rows.push({ name: userName, university: userUni ?? 'Üniversite seçilmedi', points: userPoints, you: true, rank: 0 });
  const sorted = rows.sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }));
  const you = sorted.find((r) => r.you)!;
  return { top: sorted.slice(0, 20), you };
}

export const fmtNum = (n: number): string => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
