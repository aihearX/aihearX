import { dayIndex, pickDaily } from '@/core/util/day';
import { AUDIOGRAM_FREQS } from '@/core/ui';
import { CASES, type Case } from './cases';
import { dxByKey, type Laterality } from './diagnoses';

export const MAX_GUESSES = 6;
export type Mark = 'green' | 'orange' | 'yellow' | 'gray';
export type Guess = { dx: string; lat: Laterality; mark: Mark };

export const HINT_TITLES = ['Akustik refleksler', 'Konuşma testleri', 'Otoakustik emisyonlar', 'ABR / vestibüler', 'Görüntüleme'] as const;

/** Yeşil: tanı + taraf doğru. Turuncu: tanı doğru taraf yanlış ya da aynı kategori + aynı taraf. Sarı: aynı kategori. Gri: diğer. */
export function evaluate(c: Case, dx: string, lat: Laterality): Mark {
  const guessCat = dxByKey(dx)?.category;
  if (dx === c.answer && lat === c.laterality) return 'green';
  if (dx === c.answer) return 'orange';
  if (guessCat === c.category && lat === c.laterality) return 'orange';
  if (guessCat === c.category) return 'yellow';
  return 'gray';
}

export const MARK_EMOJI: Record<Mark, string> = { green: '🟩', orange: '🟧', yellow: '🟨', gray: '⬛' };
export const MARK_HINT: Record<Mark, string> = {
  green: 'Tam isabet!',
  orange: 'Çok yakın: tanı ya da kategori+taraf tuttu',
  yellow: 'Kategori doğru, tanı ve taraf değil',
  gray: 'Uzak: kategori farklı',
};

const EPOCH = dayIndex(new Date(2026, 9, 17));
export const puzzleNumber = (): number => Math.max(1, dayIndex() - EPOCH + 1);
export const dailyCase = (): Case => pickDaily(CASES, 3);

/** Emoji odyogram: her kulak için 6 frekans; kaybın ağırlık merkezi 🟩, diğerleri ⬛. Etkilenmeyen kulak tamamen ⬛. */
export function emojiAudiogram(c: Case): string {
  const row = (affected: boolean) => AUDIOGRAM_FREQS.map((f) => (affected && c.keyFreqs.includes(f) ? '🟩' : '⬛')).join('');
  const r = c.laterality === 'right' || c.laterality === 'bilateral';
  const l = c.laterality === 'left' || c.laterality === 'bilateral';
  return `🔴 ${row(r)}\n🔵 ${row(l)}`;
}

export function shareText(c: Case, guesses: Guess[], solved: boolean, daily: boolean): string {
  const head = daily ? `Odyogramle #${puzzleNumber()}` : `Odyogramle Arşiv #${c.id}`;
  const score = solved ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return `${head} 🎯 ${score}\n${emojiAudiogram(c)}\n${guesses.map((g) => MARK_EMOJI[g.mark]).join('')}\naihearX`;
}
