/**
 * Ton Hafızası — saf oyun kuralları (React'siz, test edilebilir).
 * Gizli Ezgi: pad'ler şarkının seslerine göre kurulur; Rastgele: pentatonik sabit pad'ler.
 */
import { colors, gradients } from '@/core/theme';
import { dayIndex, pickDaily, seededRandom } from '@/core/util/day';
import { SONGS, type Song } from './songs';

export type Mode = 'song' | 'daily' | 'random';
export type RoundInfo = { silent: boolean; shuffled: boolean };
export type Pad = { id: number; name: string; freq: number; color: string; pitch: string };

// ---------- Nota tablosu (C4 = 261.63 … C6) ----------
const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const SOLFEGE = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'] as const;

/** 'C4' → 261.63 (A4 = 440 Hz eşit tamperaman). */
export function noteFreq(pitch: string): number {
  const m = /^([A-G]#?)(\d)$/.exec(pitch);
  if (!m) throw new Error(`Geçersiz nota: ${pitch}`);
  const semis = PITCH_NAMES.indexOf(m[1] as (typeof PITCH_NAMES)[number]);
  const midi = (Number(m[2]) + 1) * 12 + semis;
  return Math.round(440 * Math.pow(2, (midi - 69) / 12) * 100) / 100;
}
/** 'C4' → "Do", 'C5' → "Do'", 'C6' → "Do''". */
export function solfege(pitch: string): string {
  const m = /^([A-G]#?)(\d)$/.exec(pitch);
  if (!m) return pitch;
  const name = SOLFEGE[PITCH_NAMES.indexOf(m[1] as (typeof PITCH_NAMES)[number])] ?? pitch;
  const oct = Number(m[2]);
  return name + (oct >= 5 ? "'".repeat(oct - 4) : '');
}
/** Doğal (diyez'siz) notalar C4…C6 sırayla; pad doldurma için. */
export const NATURALS: readonly string[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];

export type ParsedNote = { pitch: string | null; beats: number };
/** 'E4:0.5' → { pitch: 'E4', beats: 0.5 }; 'R:1' → es. */
export function parseNote(s: string): ParsedNote {
  const [p, b] = s.split(':');
  const beats = b ? Number(b) : 1;
  return { pitch: p === 'R' ? null : p!, beats: Number.isFinite(beats) && beats > 0 ? beats : 1 };
}

// ---------- Pad'ler ----------
export const PAD_COLORS: readonly string[] = [colors.accent, gradients.rose[0], colors.mint, colors.amber, colors.blue, colors.accent2, colors.red, gradients.ember[1]];
export const MAX_PADS = 8;

/** Rastgele mod: pentatonik sabit pad'ler (Do Re Mi Sol La Do' Re' Mi'). */
export const RANDOM_PADS: readonly Pad[] = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'].map((p, i) => ({ id: i, pitch: p, name: solfege(p), freq: noteFreq(p), color: PAD_COLORS[i]! }));
/** Eski ad (uyumluluk): Rastgele modun sabit notaları. */
export const NOTES = RANDOM_PADS;
export type Note = Pad;

/**
 * Şarkının farklı sesleri (en çok 8) pes'ten tize sıralanır; 4/6/8'e tamamlamak için önce aralıktaki,
 * sonra üstteki/alttaki doğal notalar eklenir. Her pad solfej adı ve tema rengi taşır.
 */
export function padsFor(song: Song): Pad[] {
  const set = new Set<string>();
  for (const n of song.notes) { const p = parseNote(n).pitch; if (p) set.add(p); }
  let pitches = [...set].sort((a, b) => noteFreq(a) - noteFreq(b)).slice(0, MAX_PADS);
  const target = pitches.length <= 4 ? 4 : pitches.length <= 6 ? 6 : 8;
  const lo = noteFreq(pitches[0]!), hi = noteFreq(pitches[pitches.length - 1]!);
  const inside = NATURALS.filter((p) => !set.has(p) && noteFreq(p) > lo && noteFreq(p) < hi);
  const above = NATURALS.filter((p) => noteFreq(p) > hi);
  const below = NATURALS.filter((p) => noteFreq(p) < lo).reverse();
  const extra: string[] = [...inside];
  for (let i = 0; extra.length + pitches.length < target && (above[i] || below[i]); i++) {
    if (above[i]) extra.push(above[i]!);
    if (extra.length + pitches.length < target && below[i]) extra.push(below[i]!);
  }
  pitches = [...pitches, ...extra.slice(0, target - pitches.length)].sort((a, b) => noteFreq(a) - noteFreq(b));
  return pitches.map((p, i) => ({ id: i, pitch: p, name: solfege(p), freq: noteFreq(p), color: PAD_COLORS[i]! }));
}

/** Şarkının çalınan (es olmayan) notaları pad id dizisi olarak. */
export function padSeqFor(song: Song, pads: readonly Pad[]): number[] {
  const byPitch = new Map(pads.map((p) => [p.pitch, p.id]));
  const out: number[] = [];
  for (const n of song.notes) { const p = parseNote(n).pitch; if (p) { const id = byPitch.get(p); if (id !== undefined) out.push(id); } }
  return out;
}

export type Span = { start: number; end: number };
/** Cümleler, çalınan nota indeksi uzayında [start, end). */
export function phraseSpans(song: Song): Span[] {
  const spans: Span[] = [];
  let sounding = 0, start = 0, phraseIdx = 0;
  song.notes.forEach((n, i) => {
    if (parseNote(n).pitch) sounding += 1;
    if (song.phrases[phraseIdx] === i) { if (sounding > start) spans.push({ start, end: sounding }); start = sounding; phraseIdx += 1; }
  });
  if (sounding > start) spans.push({ start, end: sounding });
  return spans;
}

export type RhythmEvent = { pad: number | null; ms: number };
/** Ritimli çalım: çeyrek = 60000/bpm ms. phrase verilirse yalnız o cümle, yoksa tüm şarkı. */
export function rhythmEvents(song: Song, pads: readonly Pad[], phrase?: number): RhythmEvent[] {
  const byPitch = new Map(pads.map((p) => [p.pitch, p.id]));
  const q = 60000 / song.bpm;
  const from = phrase === undefined ? 0 : phrase === 0 ? 0 : (song.phrases[phrase - 1] ?? -1) + 1;
  const to = phrase === undefined ? song.notes.length - 1 : (song.phrases[phrase] ?? song.notes.length - 1);
  const out: RhythmEvent[] = [];
  for (let i = from; i <= to; i++) {
    const { pitch, beats } = parseNote(song.notes[i]!);
    out.push({ pad: pitch ? (byPitch.get(pitch) ?? null) : null, ms: Math.round(beats * q) });
  }
  return out;
}

// ---------- Şarkı seçimi ----------
export const dailySong = (): Song => pickDaily(SONGS, 3);
export const songAt = (i: number): Song => SONGS[((i % SONGS.length) + SONGS.length) % SONGS.length]!;
export const soundingCount = (song: Song) => song.notes.filter((n) => parseNote(n).pitch).length;

// ---------- Zorluk ----------
export const DAILY_CAP = 20;
export const TONE_SEC = 0.35;
export const MAX_LIVES = 3;
export const SILENT_FROM = 4;
export const SHUFFLE_FROM = 7;
/** Serbest şarkı modunda rütbe için hedef nota sayısı. */
export const SONG_TARGET = 40;

/** Her 2 turda bir seviye. */
export const levelFor = (round: number) => Math.max(1, Math.ceil(round / 2));
export const padCountFor = (level: number) => (level >= 10 ? 8 : level >= 6 ? 6 : 4);
/** Rastgele mod pad kümeleri iç içedir: 4'lü ⊂ 6'lı ⊂ 8'li. */
export function activeNotes(level: number): number[] {
  const n = padCountFor(level);
  if (n === 4) return [0, 2, 3, 5];
  if (n === 6) return [0, 1, 2, 3, 4, 5];
  return [0, 1, 2, 3, 4, 5, 6, 7];
}
/** Notalar arası boşluk: 600 ms → 250 ms. */
export const gapMsFor = (level: number) => Math.max(250, 600 - (level - 1) * 40);
export const isSilentRound = (level: number, round: number) => level >= SILENT_FROM && round % 3 === 0;
export const isShuffledRound = (level: number, round: number) => level >= SHUFFLE_FROM && round % 2 === 0;

/** Tur puanı: tur² × 10 + hız bonusu (beklenen süre nota başına 900 ms). */
export function roundPoints(round: number, elapsedMs: number): number {
  const base = round * round * 10;
  const expected = round * 900;
  const bonus = Math.round(Math.max(0, 1 - elapsedMs / expected) * round * 15);
  return base + bonus;
}
export const phraseBonus = (notes: number) => 50 + notes * 10;
export const songBonus = (song: Song) => 300 + soundingCount(song) * 15;

/** Yeni rastgele nota seçer; üç kez üst üste aynı notayı engeller. */
export function pickNote(seq: readonly number[], active: readonly number[], rng: () => number): number {
  let n = active[Math.floor(rng() * active.length)]!;
  const last = seq[seq.length - 1];
  const prev = seq[seq.length - 2];
  if (n === last && n === prev && active.length > 1) n = active[(active.indexOf(n) + 1) % active.length]!;
  return n;
}

export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Günün karışık sırası için deterministik rng. */
export function dailyRng(): () => number {
  return seededRandom((dayIndex() * 7919 + 1013) >>> 0);
}

// ---------- Mizah ----------
export const WRONG_QUIPS: readonly string[] = [
  'Kulak misafiri olmuş gibisin.',
  'Nota kaçtı, üzengi kemiği titredi.',
  'O nota komşu dairedeydi.',
  'Koklea bir an gözünü kırptı.',
  'Yakındı; yarım ton kadar.',
  'Çekiç, örs, üzengi: üçü de şaşırdı.',
  "Kulak zarı: 'Ben duydum, parmak duymadı.'",
  'Ezgi sola döndü, sen sağa.',
  'Bu nota listede yoktu ama cesaretin vardı.',
];
export const REVEAL_QUIPS: readonly string[] = [
  'Bak sen, farkında olmadan şarkı çalıyormuşsun.',
  'Parmakların kulaklarından önce tanıdı.',
  "Koklea not aldı: 'Bu ezgiyi biliyoruz.'",
  'Sessizce nota biriktirdin; şarkı oldu.',
  'Bir cümle daha, ezgi senden kaçamayacak.',
];
export const SONG_QUIPS: readonly string[] = [
  'Koklea ayakta alkışlıyor.',
  'Üzengi kemiği sevinçten zıpladı.',
  'Bu şarkı artık parmaklarında.',
  'Kulak hafızası: tam not.',
];
/** Listeden bir satır seçer; bir öncekini tekrar etmez. */
export function pickQuip(list: readonly string[], prev: string, rng: () => number = Math.random): string {
  if (list.length < 2) return list[0] ?? '';
  let q = list[Math.floor(rng() * list.length)]!;
  if (q === prev) q = list[(list.indexOf(q) + 1) % list.length]!;
  return q;
}

// ---------- Paylaşım ----------
export type ShareInfo = { mode: Mode; notes: number; rank: string; song: Song | null; songNotes: number; songsDone: number };
export function shareTextFor(s: ShareInfo): string {
  if (s.mode === 'random' || !s.song) return `Ton Hafızası 🎵 ${s.notes} nota · ${s.rank} · aihearX`;
  const done = s.songsDone > 0 ? `${s.songsDone} şarkı tamamladım, ` : '';
  return `Ton Hafızası 🎵 ${done}${s.song.titleAcc} ${s.songNotes} notaya kadar çaldım · aihearX`;
}
