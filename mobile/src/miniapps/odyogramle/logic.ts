import type { Ionicons } from '@expo/vector-icons';
import { dayIndex, pickDaily } from '@/core/util/day';
import { AUDIOGRAM_FREQS } from '@/core/ui';
import { CASES, type Case } from './cases';
import { LATERALITY_NAME, dxByKey, type Laterality } from './diagnoses';

export const MAX_GUESSES = 6;
export type Mark = 'green' | 'orange' | 'yellow' | 'gray';
export type Guess = { dx: string; lat: Laterality; mark: Mark };

export type HintMeta = { title: string; icon: keyof typeof Ionicons.glyphMap; why: string };

/** Beş ipucu kanalı; her birinin "neden önemli" dipnotu öğreticidir ve vakadan bağımsızdır. */
export const HINT_META: readonly HintMeta[] = [
  { title: 'Akustik refleksler', icon: 'pulse', why: 'İletim kaybında kaybolur, koklear kayıpta eşik yükselir, retrokoklearde çürür; üçüncü pencerede "iletim kaybına rağmen" mevcuttur.' },
  { title: 'Konuşma testleri', icon: 'chatbubble-ellipses', why: 'SRT-PTA uyumsuzluğu nonorganik kaybı, eşiklere göre orantısız düşük WRS ve rollover retrokoklear patolojiyi yakalar.' },
  { title: 'Otoakustik emisyonlar', icon: 'radio', why: 'Dış tüylü hücrelerin aynası: iletim kaybında ve >30-40 dB koklear kayıpta kaybolur; ANSD\'de kayba rağmen mevcuttur.' },
  { title: 'ABR / vestibüler', icon: 'analytics', why: 'Dalga V latans gecikmesi ve interaural fark retrokokleari; VEMP, vHIT ve kalorik test labirenti ve üçüncü pencereyi gösterir.' },
  { title: 'Görüntüleme / muayene', icon: 'scan', why: 'Asimetrik SNİK\'te MRG, iletim kaybında BT ve otoskopi yapısal nedeni doğrular; son ipucu çoğu zaman tanıyı verir.' },
] as const;

export const HINT_TITLES = HINT_META.map((h) => h.title);

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

export const marksLine = (guesses: Guess[]): string => guesses.map((g) => MARK_EMOJI[g.mark]).join('');

export function shareText(c: Case, guesses: Guess[], solved: boolean, daily: boolean): string {
  const head = daily ? `Odyogramle #${puzzleNumber()}` : `Odyogramle Arşiv #${c.id}`;
  const score = solved ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return `${head} 🎯 ${score}\n${emojiAudiogram(c)}\n${marksLine(guesses)}\naihearX`;
}

/** "Bu vakayı tartış": Ağ'a yapıştırılacak kısa, spoiler vermeyen metin. */
export function discussText(c: Case, guesses: Guess[], solved: boolean, daily: boolean): string {
  const head = daily ? `Odyogramle #${puzzleNumber()}` : `Odyogramle Arşiv #${c.id}`;
  const score = solved ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const sideName = LATERALITY_NAME[c.laterality].toLocaleLowerCase('tr-TR');
  return `${head} · ${score} ${marksLine(guesses)}\nİpucu olmadan ${sideName} ${c.keyFreqs.length ? 'kayıpta' : 'odyogramda'} ilk aklınıza gelen tanı neydi? Tartışalım. #odyogramle`;
}

/** Puan: 1. tahminde 600, 6. tahminde 100; çözülemediyse 0. */
export const pointsFor = (guesses: number, solved: boolean): number => (solved ? (MAX_GUESSES + 1 - guesses) * 100 : 0);
