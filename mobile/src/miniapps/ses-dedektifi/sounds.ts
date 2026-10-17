/**
 * Ses Dedektifi ses kütüphanesi: her ses tamamen JS'de sentezlenir, varlık dosyası yok.
 * Her tanım `build(d)` ile d saniyelik mono sinyal üretir; `render()` süreye sığdırıp stereo döner.
 */
import { mix, renderNoise } from '@/core/audio';
import {
  TAU, type Mono, osc, harmonics, noise, lowpass, highpass, bandpass, shape, env, decay, gain, add, place, cat, sil,
  repeat, fit, tremolo, softclip, normalize, sequence, pluck, stereo,
} from './dsp';

export type SoundCategory = 'ev' | 'sokak' | 'doğa' | 'hayvan' | 'müzik' | 'teknoloji' | 'vücut';
export type Difficulty = 1 | 2 | 3;

export type SoundDef = {
  id: string;
  name: string;
  emoji: string;
  category: SoundCategory;
  difficulty: Difficulty;
  /** d saniyelik stereo sinyal [L, R]. Her klip ≤ 2.5 s. */
  render: (duration: number) => Float32Array[];
};

export const CATEGORY_LABEL: Record<SoundCategory, string> = {
  ev: 'Ev', sokak: 'Sokak', doğa: 'Doğa', hayvan: 'Hayvan', müzik: 'Müzik', teknoloji: 'Teknoloji', vücut: 'Vücut',
};

export const MAX_CLIP = 2.5;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
/** Seyrek rastgele darbeler (yağmur damlası, çıtırtı). */
function crackle(d: number, perSec: number, len: number, cutoff: number, amp: number): Mono {
  const times: number[] = [];
  let t = rnd(0, 1 / perSec);
  while (t < d) { times.push(t); t += rnd(0.3, 1.7) / perSec; }
  return sequence(d, times, () => decay(lowpass(noise(len, amp * rnd(0.4, 1)), cutoff), len / 3));
}
const vib = (f: number, rate: number, depth: number) => (t: number) => f * (1 + depth * Math.sin(TAU * rate * t));
const beeps = (d: number, freq: number, on: number, off: number, kind: 'sine' | 'square' = 'sine', amp = 0.4): Mono =>
  repeat(cat(env(osc(on, freq, kind, amp), 0.005, 0.01), sil(off)), d);

function def(id: string, name: string, emoji: string, category: SoundCategory, difficulty: Difficulty, build: (d: number) => Mono): SoundDef {
  return { id, name, emoji, category, difficulty, render: (duration) => stereo(normalize(fit(build(Math.min(duration, MAX_CLIP)), Math.min(duration, MAX_CLIP)), 0.8)) };
}

export const SOUNDS: SoundDef[] = [
  // ---------- EV ----------
  def('telefon', 'Telefon zili', '☎️', 'ev', 1, (d) =>
    repeat(cat(env(tremolo(harmonics(0.9, 1100, [1, 0.5, 0.25], 0.5), 25, 0.9), 0.01, 0.03), sil(0.4)), d)),
  def('kapi-zili', 'Kapı zili', '🔔', 'ev', 1, (d) => {
    const ding = decay(harmonics(1.0, 660, [1, 0.3, 0.12], 0.6), 0.35);
    const dong = decay(harmonics(1.4, 523, [1, 0.3, 0.12], 0.6), 0.5);
    return place(place(sil(d), ding, 0), dong, 0.5);
  }),
  def('calar-saat', 'Çalar saat', '⏰', 'ev', 1, (d) => {
    const group = cat(repeat(cat(env(osc(0.05, 2400, 'square', 0.4), 0.003, 0.005), sil(0.05)), 0.4), sil(0.3));
    return repeat(group, d);
  }),
  def('mikrodalga', 'Mikrodalga bitti', '🍲', 'ev', 2, (d) => repeat(cat(beeps(0.9, 1900, 0.18, 0.12), sil(0.5)), d)),
  def('tik-tak', 'Saat tik-tak', '🕰️', 'ev', 1, (d) =>
    sequence(d, [0, 0.5, 1, 1.5, 2], (i) => add(decay(lowpass(noise(0.05, 0.8), 3500), 0.012), decay(osc(0.05, i % 2 ? 1900 : 2600, 'sine', 0.3), 0.01)))),
  def('fermuar', 'Fermuar', '🧥', 'ev', 3, (d) => {
    const zip = shape(highpass(noise(0.55, 0.7), 1800), (t, u) => (Math.sin(TAU * (40 + 110 * u) * t) > 0.3 ? 1 : 0.15) * (0.6 + 0.4 * u));
    return repeat(cat(env(zip, 0.02, 0.05), sil(0.5)), d);
  }),
  def('su-damlasi', 'Su damlası', '💧', 'ev', 1, (d) =>
    sequence(d, [0.05, 0.75, 1.5, 2.2], (i) => decay(osc(0.25, (t) => (i % 2 ? 2000 : 2400) * Math.exp(-t * 9) + 500, 'sine', 0.6), 0.07))),
  def('elektrik-supurge', 'Elektrikli süpürge', '🧹', 'ev', 2, (d) =>
    env(add(lowpass(noise(d, 0.5), 1400), softclip(harmonics(d, 120, [1, 0.6, 0.4, 0.3, 0.2], 0.35), 2), osc(d, 2900, 'sine', 0.05)), 0.25, 0.2)),
  def('kapi-calma', 'Kapı çalma', '🚪', 'ev', 1, (d) =>
    sequence(d, [0, 0.22, 0.44, 1.1, 1.32, 1.54], () => add(decay(osc(0.12, (t) => 110 * Math.exp(-t * 20) + 70, 'sine', 0.8), 0.04), decay(lowpass(noise(0.05, 0.5), 1500), 0.01)))),

  // ---------- SOKAK ----------
  def('ambulans', 'Ambulans sireni', '🚑', 'sokak', 1, (d) =>
    env(lowpass(harmonics(d, (t) => (Math.floor(t / 0.55) % 2 === 0 ? 720 : 960), [1, 0.5, 0.3, 0.2], 0.5), 3000), 0.02, 0.05)),
  def('polis', 'Polis sireni', '🚓', 'sokak', 1, (d) =>
    env(lowpass(harmonics(d, (t) => 650 + 550 * (0.5 - 0.5 * Math.cos((TAU * t) / 1.5)), [1, 0.5, 0.3, 0.2], 0.5), 3200), 0.02, 0.05)),
  def('helikopter', 'Helikopter', '🚁', 'sokak', 2, (d) =>
    env(add(shape(lowpass(noise(d, 0.9), 800), (t) => 0.25 + 0.75 * Math.pow(Math.max(0, Math.sin(TAU * 17 * t)), 2)), tremolo(osc(d, 34, 'saw', 0.25), 17, 0.8)), 0.1, 0.1)),
  def('motosiklet', 'Motosiklet', '🏍️', 'sokak', 2, (d) =>
    env(lowpass(softclip(osc(d, (t) => 55 + 190 * Math.min(1, t / 1.4) + 8 * Math.sin(TAU * 7 * t), 'saw', 0.9), 3), (t) => 600 + 1200 * Math.min(1, t / 1.4)), 0.05, 0.15)),
  def('tren', 'Tren kornası', '🚂', 'sokak', 2, (d) =>
    env(lowpass(add(harmonics(d, vib(311, 5, 0.004), [1, 0.6, 0.4, 0.25], 0.3), harmonics(d, vib(370, 5, 0.004), [1, 0.6, 0.4, 0.25], 0.3), harmonics(d, vib(466, 5, 0.004), [1, 0.5, 0.3], 0.25)), 2200), 0.08, 0.3)),
  def('gemi', 'Gemi düdüğü', '🚢', 'sokak', 2, (d) =>
    env(lowpass(add(harmonics(d, 92, [1, 0.8, 0.6, 0.4, 0.3, 0.2], 0.4), harmonics(d, 138, [1, 0.7, 0.5, 0.3], 0.3)), 700), 0.25, 0.4)),
  def('geri-vites', 'Geri vites uyarısı', '🚛', 'sokak', 2, (d) => beeps(d, 1000, 0.3, 0.3, 'sine', 0.5)),
  def('korna', 'Araba kornası', '🚗', 'sokak', 1, (d) =>
    repeat(cat(env(lowpass(add(harmonics(0.45, 420, [1, 0.6, 0.4, 0.3, 0.2], 0.35), harmonics(0.45, 520, [1, 0.6, 0.4, 0.3], 0.35)), 2500), 0.01, 0.04), sil(0.15)), d)),

  // ---------- DOĞA ----------
  def('yagmur', 'Yağmur', '🌧️', 'doğa', 2, (d) => env(add(bandpass(noise(d, 0.6), 600, 5000), crackle(d, 24, 0.02, 6000, 0.9)), 0.3, 0.2)),
  def('dalga', 'Deniz dalgası', '🌊', 'doğa', 2, (d) =>
    shape(lowpass(noise(d, 1), (t) => 500 + 1300 * Math.pow(Math.sin((TAU * t) / 3.2), 2)), (t) => 0.15 + 0.85 * Math.pow(Math.sin((TAU * t) / 3.2), 2))),
  def('ruzgar', 'Rüzgâr', '🌬️', 'doğa', 2, (d) =>
    env(add(shape(lowpass(noise(d, 0.9), (t) => 350 + 350 * Math.sin((TAU * t) / 2.3)), (t) => 0.5 + 0.5 * Math.sin((TAU * t) / 2.3 + 1)), bandpass(noise(d, 0.6), (t) => 900 + 400 * Math.sin((TAU * t) / 2.3), 1500)), 0.4, 0.4)),
  def('gok-gurultusu', 'Gök gürültüsü', '⛈️', 'doğa', 2, (d) =>
    add(shape(lowpass(noise(d, 1), (t) => 180 + 250 * Math.exp(-t)), (t) => (1 - Math.exp(-t * 12)) * Math.exp(-t * 0.9)), crackle(0.4, 30, 0.015, 3000, 0.6)),
  ),

  // ---------- HAYVAN ----------
  def('kus', 'Kuş cıvıltısı', '🐦', 'hayvan', 1, (d) => {
    const times: number[] = [];
    let t = 0.05;
    while (t < d) { times.push(t); t += rnd(0.1, 0.32); }
    return sequence(d, times, (i) => decay(osc(0.09, (tt) => 2800 + rnd(0, 900) + 1500 * Math.sin(TAU * (i % 2 ? 7 : 11) * tt), 'sine', 0.5), 0.05));
  }),
  def('circir', 'Cırcır böceği', '🦗', 'hayvan', 2, (d) =>
    repeat(cat(shape(osc(0.35, 4400, 'sine', 0.45), (t) => (Math.sin(TAU * 42 * t) > 0 ? 1 : 0.05)), sil(0.18)), d)),
  def('ari', 'Arı vızıltısı', '🐝', 'hayvan', 1, (d) =>
    env(lowpass(tremolo(harmonics(d, (t) => 230 * (1 + 0.05 * Math.sin(TAU * 5.5 * t) + 0.02 * Math.sin(TAU * 0.7 * t)), [1, 0.7, 0.5, 0.45, 0.3, 0.2, 0.15], 0.4), 90, 0.3), 2600), 0.05, 0.1)),
  def('kedi', 'Kedi miyavı', '🐱', 'hayvan', 2, (d) => {
    const meow = env(lowpass(harmonics(0.7, (t) => (t < 0.25 ? 600 + 1200 * t : 900 - 500 * (t - 0.25)) * (1 + 0.03 * Math.sin(TAU * 8 * t)), [1, 0.7, 0.45, 0.3, 0.2], 0.4), (t) => 1800 + 1500 * Math.sin(Math.PI * t / 0.7)), 0.06, 0.15);
    return repeat(cat(meow, sil(0.6)), d);
  }),
  def('kopek', 'Köpek havlaması', '🐶', 'hayvan', 1, (d) => {
    const bark = env(add(lowpass(harmonics(0.18, (t) => 380 - 300 * t, [1, 0.8, 0.6, 0.5, 0.4, 0.3], 0.5), (t) => 2000 - 7000 * t), lowpass(noise(0.18, 0.25), 1200)), 0.01, 0.08);
    return sequence(d, [0, 0.38, 1.2, 1.58], () => bark);
  }),
  def('inek', 'İnek', '🐄', 'hayvan', 2, (d) => {
    const moo = env(lowpass(harmonics(1.2, (t) => (t < 0.3 ? 150 + 60 * t : 168 - 20 * t) * (1 + 0.025 * Math.sin(TAU * 6 * t)), [1, 0.9, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2], 0.4), (t) => 500 + 900 * Math.sin(Math.PI * t / 1.2)), 0.12, 0.3);
    return repeat(cat(moo, sil(0.6)), d);
  }),
  def('kurbaga', 'Kurbağa', '🐸', 'hayvan', 2, (d) =>
    repeat(cat(env(shape(lowpass(osc(0.32, (t) => 260 - 60 * t, 'saw', 0.6), 900), (t) => 0.55 + 0.45 * Math.sin(TAU * 24 * t)), 0.03, 0.08), sil(0.45)), d)),

  // ---------- MÜZİK ----------
  def('davul', 'Davul', '🥁', 'müzik', 1, (d) => {
    const kick = decay(osc(0.35, (t) => 60 + 110 * Math.exp(-t * 25), 'sine', 0.9), 0.14);
    const snare = add(decay(highpass(noise(0.25, 0.6), 1500), 0.07), decay(osc(0.2, 190, 'tri', 0.4), 0.05));
    return sequence(d, [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25], (i) => (i % 2 ? snare : kick));
  }),
  def('flut', 'Flüt', '🎶', 'müzik', 1, () => {
    const note = (f: number, len: number) => env(add(osc(len, vib(f, 5.5, 0.012), 'sine', 0.5), osc(len, vib(f * 2, 5.5, 0.012), 'sine', 0.08), bandpass(noise(len, 0.12), 1500, 4000)), 0.06, 0.08);
    return cat(note(784, 0.45), note(880, 0.45), note(988, 0.6), note(1175, 1.0));
  }),
  def('piyano', 'Piyano', '🎹', 'müzik', 1, (d) => {
    const note = (f: number) => shape(harmonics(1.6, f, [1, 0.5, 0.3, 0.2, 0.12, 0.08], 0.45), (t) => Math.exp(-t * 2.2) * (1 - Math.exp(-t * 300)));
    return sequence(d, [0, 0.3, 0.6, 0.9], (i) => note([262, 330, 392, 523][i] ?? 262));
  }),
  def('can', 'Çan', '🔔', 'müzik', 2, (d) =>
    sequence(d, [0, 1.1], () => shape(harmonics(2.4, 330, [1, 0.6, 0.45, 0.3, 0.2], 0.4, [0.5, 1, 1.19, 1.56, 2.0, 2.5]), (t) => Math.exp(-t * 1.6)))),
  def('trompet', 'Trompet', '🎺', 'müzik', 2, () => {
    const note = (f: number, len: number) => env(lowpass(softclip(harmonics(len, vib(f, 6, 0.006), [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3], 0.35), 1.6), (t) => 1200 + 2500 * Math.min(1, t * 8)), 0.08, 0.1);
    return cat(note(392, 0.35), note(523, 0.35), note(659, 1.4));
  }),
  def('gitar', 'Gitar', '🎸', 'müzik', 2, (d) =>
    sequence(d, [0, 0.04, 0.08, 0.12, 1.0, 1.04, 1.08, 1.12], (i) => pluck(1.3, [165, 220, 277, 330][i % 4] ?? 165, 0.4))),

  // ---------- TEKNOLOJİ ----------
  def('mors', 'Mors kodu (SOS)', '📡', 'teknoloji', 2, (d) => {
    const dit = cat(env(osc(0.08, 800, 'sine', 0.5), 0.004, 0.004), sil(0.08));
    const dah = cat(env(osc(0.24, 800, 'sine', 0.5), 0.004, 0.004), sil(0.08));
    const gap = sil(0.16);
    return repeat(cat(dit, dit, dit, gap, dah, dah, dah, gap, dit, dit, dit, sil(0.5)), d);
  }),
  def('lazer', 'Lazer', '🔫', 'teknoloji', 1, (d) =>
    sequence(d, [0, 0.35, 0.7, 1.4, 1.75], () => env(add(osc(0.28, (t) => 2600 * Math.exp(-t * 12) + 180, 'sine', 0.5), osc(0.28, (t) => 2 * (2600 * Math.exp(-t * 12) + 180), 'square', 0.1)), 0.003, 0.05))),
  def('patlama', 'Patlama', '💥', 'teknoloji', 2, (d) =>
    add(shape(lowpass(noise(1.8, 1), (t) => 150 + 5000 * Math.exp(-t * 6)), (t) => Math.exp(-t * 2.2)), decay(osc(0.6, (t) => 45 + 80 * Math.exp(-t * 10), 'sine', 0.8), 0.25))),
  def('mesgul', 'Meşgul tonu', '📵', 'teknoloji', 2, (d) =>
    repeat(cat(env(add(osc(0.5, 480, 'sine', 0.3), osc(0.5, 620, 'sine', 0.3)), 0.01, 0.01), sil(0.5)), d)),
  def('cevir-sesi', 'Çevir sesi', '📞', 'teknoloji', 3, (d) => env(add(osc(d, 350, 'sine', 0.3), osc(d, 440, 'sine', 0.3)), 0.02, 0.02)),
  def('metal-dedektor', 'Metal dedektörü', '🧲', 'teknoloji', 2, (d) => {
    const times: number[] = [];
    let t = 0;
    while (t < d) { times.push(t); t += 1 / (3 + 13 * Math.min(1, t / 1.8)); }
    return sequence(d, times, () => env(osc(0.04, 1600, 'square', 0.4), 0.003, 0.01));
  }),
  def('uzay-gemisi', 'Uzay gemisi', '🛸', 'teknoloji', 2, (d) =>
    env(add(lowpass(osc(d, (t) => 110 + 40 * Math.sin(TAU * 0.6 * t), 'saw', 0.5), 500), osc(d, (t) => 900 * (1 + 0.35 * Math.sin(TAU * 3 * t)), 'sine', 0.18), osc(d, (t) => 1800 * (1 + 0.2 * Math.sin(TAU * 11 * t)), 'tri', 0.06)), 0.1, 0.15)),
  def('klavye', 'Klavye tıkırtısı', '⌨️', 'teknoloji', 2, (d) => {
    const times: number[] = [];
    let t = 0.03;
    while (t < d) { times.push(t); t += rnd(0.07, 0.22); }
    return sequence(d, times, () => add(decay(lowpass(noise(0.03, 0.9), rnd(2500, 5000)), 0.006), decay(osc(0.03, rnd(900, 1400), 'tri', 0.25), 0.005)));
  }),
  def('robot', 'Robot konuşması', '🤖', 'teknoloji', 3, (d) =>
    env(shape(lowpass(osc(d, (t) => 95 + 30 * Math.floor((t * 7) % 3), 'square', 0.45), (t) => 500 + 1200 * Math.abs(Math.sin(TAU * 2.7 * t))), (t) => (Math.sin(TAU * 5 * t) > -0.4 ? 1 : 0.05)), 0.02, 0.05)),

  // ---------- VÜCUT ----------
  def('kalp', 'Kalp atışı', '❤️', 'vücut', 1, (d) => {
    const thump = (a: number) => decay(lowpass(osc(0.25, (t) => 55 + 40 * Math.exp(-t * 30), 'sine', a), 180), 0.09);
    return sequence(d, [0, 0.18, 0.9, 1.08, 1.8, 1.98], (i) => thump(i % 2 ? 0.7 : 1));
  }),
  def('nefes', 'Nefes alıp verme', '😮‍💨', 'vücut', 3, (d) =>
    shape(lowpass(noise(d, 0.9), (t) => (Math.sin((TAU * t) / 2.4) > 0 ? 1800 : 900)), (t) => 0.1 + 0.9 * Math.pow(Math.sin((TAU * t) / 2.4), 2))),
  def('horlama', 'Horlama', '😴', 'vücut', 2, (d) => {
    const snore = env(shape(lowpass(add(osc(0.9, (t) => 70 + 15 * t, 'saw', 0.6), noise(0.9, 0.3)), 650), (t) => 0.5 + 0.5 * Math.sin(TAU * 27 * t)), 0.2, 0.25);
    return repeat(cat(snore, gain(lowpass(noise(0.45, 0.25), 700), 0.6), sil(0.3)), d);
  }),
  def('bebek', 'Bebek ağlaması', '👶', 'vücut', 3, (d) => {
    const cry = env(lowpass(harmonics(0.8, (t) => (480 - 120 * t) * (1 + 0.035 * Math.sin(TAU * 6.5 * t)), [1, 0.8, 0.6, 0.5, 0.35, 0.25], 0.4), (t) => 2600 - 1200 * t), 0.08, 0.2);
    return repeat(cat(cry, sil(0.3)), d);
  }),
  def('oksuruk', 'Öksürük', '🤧', 'vücut', 2, (d) =>
    sequence(d, [0, 0.28, 1.2, 1.48], () => env(add(shape(lowpass(noise(0.22, 1), (t) => 1400 * Math.exp(-t * 8) + 250), (t) => Math.exp(-t * 9)), decay(osc(0.1, 130, 'saw', 0.3), 0.03)), 0.004, 0.08))),
];

export const SOUND_BY_ID: Record<string, SoundDef> = Object.fromEntries(SOUNDS.map((s) => [s.id, s]));

/** Tembel önbellek (küçük LRU): aynı ses + süre + gürültü ikinci kez istenirse yeniden hesaplanmaz. */
const cache = new Map<string, Float32Array[]>();
const CACHE_MAX = 8;

/** Sesi üretir; noise > 0 ise düşük genlikte pembe gürültü bindirir (üst seviyelerde). */
export function renderSound(sound: SoundDef, duration: number, noiseAmp = 0): Float32Array[] {
  const dur = Math.min(duration, MAX_CLIP);
  const key = `${sound.id}|${dur.toFixed(2)}|${noiseAmp.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit) { cache.delete(key); cache.set(key, hit); return hit; }
  let sig = sound.render(dur);
  if (noiseAmp > 0) sig = mix(sig, renderNoise({ duration: dur, amplitude: noiseAmp, color: 'pink' }));
  cache.set(key, sig);
  if (cache.size > CACHE_MAX) { const first = cache.keys().next().value; if (first) cache.delete(first); }
  return sig;
}
