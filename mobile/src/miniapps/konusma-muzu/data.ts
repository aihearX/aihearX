import { AUDIOGRAM_FREQS } from '@/core/ui';

/** Audiogram bileşeniyle aynı koordinat haritası (width 320, height 260, compact değil). */
export const MAP = { width: 320, height: 260, padL: 36, padR: 10, padT: 24, padB: 26, minDb: -10, maxDb: 120 } as const;
const plotW = MAP.width - MAP.padL - MAP.padR;
const plotH = MAP.height - MAP.padT - MAP.padB;
/** Frekans → x (log, 250..8000 eşit aralıklı) */
export const freqToX = (f: number) => MAP.padL + (plotW * Math.log2(f / 250)) / (AUDIOGRAM_FREQS.length - 1);
export const dbToY = (db: number) => MAP.padT + ((db - MAP.minDb) / (MAP.maxDb - MAP.minDb)) * plotH;

export type Phoneme = {
  id: string;
  label: string;
  letters: string[];
  freq: number;
  db: number;
  what: string;
  lost: string;
};

export const PHONEMES: Phoneme[] = [
  { id: 'mn', label: 'm n', letters: ['m', 'n'], freq: 250, db: 30, what: 'Burundan gelen kalın, yumuşak sesler. Konuşmanın "bas" tarafı.', lost: 'm ve n duyulmazsa "mama" ile "nana", "kim" ile "kin" karışır; konuşma uğultuya döner.' },
  { id: 'uo', label: 'u o', letters: ['u', 'o', 'ü', 'ö'], freq: 500, db: 28, what: 'Yuvarlak dudakla çıkan kalın ünlüler. Konuşmanın gücü buradan gelir.', lost: 'Kalın ünlüler gidince sesin "varlığı" kaybolur; konuşma uzaktan ve boğuk gelir.' },
  { id: 'a', label: 'a', letters: ['a', 'ı'], freq: 700, db: 36, what: 'En açık ünlü. Her cümlede var, en güçlü seslerden biri.', lost: '"a" kaybolursa kelimelerin ritmi bozulur; hecelerin nerede bittiği belli olmaz.' },
  { id: 'rl', label: 'r l', letters: ['r', 'l'], freq: 1000, db: 46, what: 'Dil ucuyla çıkan akıcı sesler. Orta frekanslarda yaşar.', lost: '"kar" ile "kal", "bir" ile "bil" birbirine benzer; kelimeler yuvarlanır.' },
  { id: 'ei', label: 'e i', letters: ['e', 'i'], freq: 1500, db: 34, what: 'İnce ünlüler. Kelimeleri birbirinden ayıran "renk" buradadır.', lost: '"gel" ile "gül", "sen" ile "sin" ayırt edilemez; cümle anlaşılmaz olur.' },
  { id: 'kt', label: 'k t', letters: ['k', 't', 'p'], freq: 2500, db: 44, what: 'Kısa, patlamalı sesler. Hecelerin başlangıcını işaretler.', lost: '"kap" ile "tap", "kat" ile "pat" karışır; kelimelerin başı eksik duyulur.' },
  { id: 's2', label: 'ş ç', letters: ['ş', 'ç'], freq: 3200, db: 38, what: 'Tıslamalı, yüksek frekanslı sesler.', lost: '"şey" ile "çay", "aş" ile "aç" karışır; konuşma "peltek" gelir.' },
  { id: 's', label: 's', letters: ['s', 'z'], freq: 4500, db: 30, what: 'En tiz ve en sessiz seslerden biri. Çoğul ekleri ve "sen/siz" burada.', lost: '"sel" ile "el", "sal" ile "al" karışır; çoğul ekleri ve "-sin/-siz" kaybolur.' },
  { id: 'f', label: 'f', letters: ['f', 'v'], freq: 6000, db: 26, what: 'Diş ve dudak arasından sızan, çok tiz ve zayıf bir ses.', lost: '"fil" ile "il", "sel" ile "fel" karışır; "f" yok olunca kelimelerin başı boşalır.' },
  { id: 'h', label: 'h', letters: ['h'], freq: 7500, db: 22, what: 'Nefes gibi çıkan, en tiz ve en zayıf ses.', lost: '"hal" ile "al", "hiç" ile "iç" karışır; sessiz fısıltılar tamamen kaybolur.' },
];

export type ProfileId = 'none' | 'hafif' | 'orta' | 'ileri';
export type LossProfile = { id: ProfileId; name: string; short: string; thresholds: number[] | null; explain: string };

/** AUDIOGRAM_FREQS sırasıyla (250..8000) sol kulak eşikleri. */
export const PROFILES: LossProfile[] = [
  { id: 'none', name: 'Normal işitme', short: 'Yok', thresholds: null, explain: 'Tüm konuşma sesleri rahatça duyulur.' },
  { id: 'hafif', name: 'Hafif yüksek frekans kaybı', short: 'Hafif', thresholds: [10, 10, 15, 30, 45, 55], explain: 'Gürültülü ortamda "duyuyorum ama anlamıyorum" tablosunun en sık nedeni. Tiz ve sessiz harfler ilk kaybolanlar.' },
  { id: 'orta', name: 'Orta eğimli kayıp', short: 'Orta', thresholds: [25, 30, 40, 50, 60, 70], explain: 'Ünlüler duyulur ama ünsüzlerin çoğu kaybolur. Konuşma var gibi görünür, anlam kopar.' },
  { id: 'ileri', name: 'İleri kayıp', short: 'İleri', thresholds: [55, 60, 70, 75, 85, 90], explain: 'Konuşma muzunun büyük kısmı eşiğin altında kalır. Cihazsız konuşmayı takip etmek çok zordur.' },
];

/** Verilen frekanstaki eşiği log eksende doğrusal olarak hesaplar. */
export function thresholdAt(thresholds: number[], freq: number): number {
  const freqs = AUDIOGRAM_FREQS;
  if (freq <= freqs[0]) return thresholds[0] ?? 0;
  const lastF = freqs[freqs.length - 1]!;
  if (freq >= lastF) return thresholds[thresholds.length - 1] ?? 0;
  for (let i = 0; i < freqs.length - 1; i++) {
    const f0 = freqs[i]!, f1 = freqs[i + 1]!;
    if (freq >= f0 && freq <= f1) {
      const t = Math.log2(freq / f0) / Math.log2(f1 / f0);
      return (thresholds[i] ?? 0) + t * ((thresholds[i + 1] ?? 0) - (thresholds[i] ?? 0));
    }
  }
  return 0;
}

export const lostPhonemes = (profile: LossProfile): Phoneme[] =>
  profile.thresholds ? PHONEMES.filter((p) => p.db < thresholdAt(profile.thresholds!, p.freq)) : [];

export const SENTENCES = [
  'Sabah fırından ekmek aldım',
  'Hafta sonu sahile gidelim mi',
  'Çocuklar şekerleri saklamış',
  'Kahve fincanını masaya koydum',
];

/** Kaybolan harfleri "·" ile değiştirir. */
export function degrade(sentence: string, lost: Phoneme[]): string {
  const letters = new Set(lost.flatMap((p) => p.letters));
  return Array.from(sentence).map((ch) => (letters.has(ch.toLocaleLowerCase('tr')) ? '·' : ch)).join('');
}
