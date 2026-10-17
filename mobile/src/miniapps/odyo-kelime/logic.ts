import { dayIndex, pickDaily } from '@/core/util/day';
import { TARGET_WORDS } from './words';

export const WORD_LEN = 5;
export const MAX_TRIES = 6;
export type Mark = 'green' | 'yellow' | 'gray';
export type Row = { word: string; marks: Mark[] };

export const KEY_ROWS: readonly string[][] = [
  [...'ERTYUIOPĞÜ'],
  [...'ASDFGHJKLŞİ'],
  [...'ZCVBNMÖÇ'],
];

/** Türkçe büyük harf: i→İ, ı→I; JS toUpperCase bunu yanlış yapar. */
export function toUpperTr(s: string): string {
  return s.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

/** Standart Wordle değerlendirmesi: tekrar eden harfler sayılarak işaretlenir. */
export function evaluate(guess: string, target: string): Mark[] {
  const g = [...guess], t = [...target];
  const marks: Mark[] = Array.from({ length: WORD_LEN }, () => 'gray');
  const remaining = new Map<string, number>();
  for (let i = 0; i < WORD_LEN; i++) {
    if (g[i] === t[i]) marks[i] = 'green';
    else remaining.set(t[i]!, (remaining.get(t[i]!) ?? 0) + 1);
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (marks[i] === 'green') continue;
    const c = g[i]!;
    const n = remaining.get(c) ?? 0;
    if (n > 0) { marks[i] = 'yellow'; remaining.set(c, n - 1); }
  }
  return marks;
}

/** Klavye tuş renkleri: yeşil > sarı > gri önceliği. */
export function keyStates(rows: Row[]): Record<string, Mark> {
  const rank: Record<Mark, number> = { gray: 0, yellow: 1, green: 2 };
  const out: Record<string, Mark> = {};
  for (const r of rows) {
    [...r.word].forEach((ch, i) => {
      const m = r.marks[i]!;
      const prev = out[ch];
      if (!prev || rank[m] > rank[prev]) out[ch] = m;
    });
  }
  return out;
}

/** Lansman günü = #1 */
const EPOCH = dayIndex(new Date(2026, 9, 17));
export const puzzleNumber = (): number => Math.max(1, dayIndex() - EPOCH + 1);
export const dailyWord = (): string => pickDaily(TARGET_WORDS, 7);
export const randomWord = (): string => TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)]!;

const EMOJI: Record<Mark, string> = { green: '🟩', yellow: '🟨', gray: '⬛' };
export function shareGrid(rows: Row[]): string {
  return rows.map((r) => r.marks.map((m) => EMOJI[m]).join('')).join('\n');
}
export function shareText(rows: Row[], won: boolean, daily: boolean): string {
  const head = daily ? `OdyoKelime #${puzzleNumber()}` : 'OdyoKelime Pratik';
  return `${head} ${won ? rows.length : 'X'}/${MAX_TRIES}\n${shareGrid(rows)}\naihearX`;
}
