/**
 * Ses Dedektifi için küçük DSP araç kutusu.
 * Tüm işlemler mono Float32Array üzerinde çalışır; en sonda `stereo()` ile [L, R] çiftine dönüşür.
 * 44.1 kHz, örnekler -1..1 aralığında.
 */
import { SAMPLE_RATE } from '@/core/audio';

export const SR = SAMPLE_RATE;
export const TAU = Math.PI * 2;
export type Mono = Float32Array;
export type Wave = 'sine' | 'saw' | 'square' | 'tri';
/** Zamana bağlı değer: sabit sayı ya da t (saniye) → değer fonksiyonu. */
export type Curve = number | ((t: number) => number);

export const samples = (d: number): number => Math.max(1, Math.floor(d * SR));
const at = (c: Curve, t: number): number => (typeof c === 'number' ? c : c(t));

function wave(phase: number, kind: Wave): number {
  const p = phase - Math.floor(phase);
  if (kind === 'sine') return Math.sin(TAU * p);
  if (kind === 'saw') return 2 * p - 1;
  if (kind === 'square') return p < 0.5 ? 1 : -1;
  return 4 * Math.abs(p - 0.5) - 1;
}

/** Frekansı zamanla değişebilen osilatör. Faz biriktirir; süpürmelerde tıklama olmaz. */
export function osc(duration: number, freq: Curve, kind: Wave = 'sine', amp = 0.5): Mono {
  const n = samples(duration);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    ph += at(freq, i / SR) / SR;
    out[i] = amp * wave(ph, kind);
  }
  return out;
}

/** Harmonik dizisi: amps[k] → (k+1)·f0 sinüs. ratios verilirse inharmonik (çan gibi) kısmi tonlar. */
export function harmonics(duration: number, f0: Curve, amps: number[], amp = 0.5, ratios?: number[]): Mono {
  const n = samples(duration);
  const out = new Float32Array(n);
  const phases = new Float64Array(amps.length);
  for (let i = 0; i < n; i++) {
    const f = at(f0, i / SR);
    let v = 0;
    for (let k = 0; k < amps.length; k++) {
      const r = ratios ? (ratios[k] ?? k + 1) : k + 1;
      phases[k] = (phases[k] ?? 0) + (f * r) / SR;
      v += (amps[k] ?? 0) * Math.sin(TAU * (phases[k] ?? 0));
    }
    out[i] = amp * v;
  }
  return out;
}

/** Beyaz gürültü. */
export function noise(duration: number, amp = 1): Mono {
  const n = samples(duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = amp * (Math.random() * 2 - 1);
  return out;
}

/** Tek kutuplu alçak geçiren filtre; kesim frekansı zamanla değişebilir. */
export function lowpass(buf: Mono, cutoff: Curve): Mono {
  const out = new Float32Array(buf.length);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    const fc = Math.max(10, at(cutoff, i / SR));
    const a = 1 - Math.exp((-TAU * fc) / SR);
    y += a * ((buf[i] ?? 0) - y);
    out[i] = y;
  }
  return out;
}

/** Tek kutuplu yüksek geçiren filtre (giriş − alçak geçiren). */
export function highpass(buf: Mono, cutoff: Curve): Mono {
  const lp = lowpass(buf, cutoff);
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = (buf[i] ?? 0) - (lp[i] ?? 0);
  return out;
}

/** Kaba bant geçiren: iki kademe alçak + yüksek geçiren. */
export function bandpass(buf: Mono, low: Curve, high: Curve): Mono {
  return lowpass(lowpass(highpass(highpass(buf, low), low), high), high);
}

/** Genliği zaman fonksiyonuyla şekillendirir: fn(t, u) — u = 0..1 normalize zaman. */
export function shape(buf: Mono, fn: (t: number, u: number) => number): Mono {
  const out = new Float32Array(buf.length);
  const n = buf.length;
  for (let i = 0; i < n; i++) out[i] = (buf[i] ?? 0) * fn(i / SR, i / n);
  return out;
}

/** Doğrusal giriş/çıkış zarfı (saniye). */
export function env(buf: Mono, attack: number, release: number): Mono {
  const a = samples(attack), r = samples(release), n = buf.length;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let g = 1;
    if (i < a) g = i / a;
    if (i > n - r) g = Math.min(g, Math.max(0, (n - i) / r));
    out[i] = (buf[i] ?? 0) * g;
  }
  return out;
}

/** Üstel sönüm: e^(−t/tau). Vuruşlar, çanlar, damlalar. */
export const decay = (buf: Mono, tau: number): Mono => shape(buf, (t) => Math.exp(-t / tau));

export function gain(buf: Mono, g: number): Mono {
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = (buf[i] ?? 0) * g;
  return out;
}

/** Parçaları toplar (en uzun kadar). */
export function add(...bufs: Mono[]): Mono {
  const n = Math.max(0, ...bufs.map((b) => b.length));
  const out = new Float32Array(n);
  for (const b of bufs) for (let i = 0; i < b.length; i++) out[i] = (out[i] ?? 0) + (b[i] ?? 0);
  return out;
}

/** Parçayı belirtilen zamana (saniye) yerleştirip toplar. */
export function place(base: Mono, part: Mono, atSec: number): Mono {
  const off = samples(atSec);
  const n = Math.max(base.length, off + part.length);
  const out = new Float32Array(n);
  out.set(base);
  for (let i = 0; i < part.length; i++) out[off + i] = (out[off + i] ?? 0) + (part[i] ?? 0);
  return out;
}

export function cat(...bufs: Mono[]): Mono {
  const n = bufs.reduce((a, b) => a + b.length, 0);
  const out = new Float32Array(n);
  let off = 0;
  for (const b of bufs) { out.set(b, off); off += b.length; }
  return out;
}

export const sil = (d: number): Mono => new Float32Array(samples(d));

/** Deseni istenen süreye kadar tekrarlar. */
export function repeat(pattern: Mono, duration: number): Mono {
  const n = samples(duration);
  const out = new Float32Array(n);
  if (!pattern.length) return out;
  for (let i = 0; i < n; i++) out[i] = pattern[i % pattern.length] ?? 0;
  return out;
}

/** Süreye sığdırır (keser ya da sıfırla doldurur) ve sonuna yumuşak çıkış koyar. */
export function fit(buf: Mono, duration: number, fade = 0.03): Mono {
  const n = samples(duration);
  const out = new Float32Array(n);
  out.set(buf.subarray(0, Math.min(n, buf.length)));
  const f = Math.min(n, samples(fade));
  for (let i = 0; i < f; i++) out[n - 1 - i] = (out[n - 1 - i] ?? 0) * (i / f);
  return out;
}

/** Genlik modülasyonu (tremolo). depth 0..1. */
export const tremolo = (buf: Mono, rate: number, depth = 0.5): Mono =>
  shape(buf, (t) => 1 - depth * 0.5 * (1 - Math.sin(TAU * rate * t)));

/** Yumuşak kırpma (tanh); motor/buzz karakteri için. */
export function softclip(buf: Mono, drive = 2): Mono {
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = Math.tanh((buf[i] ?? 0) * drive) / Math.tanh(drive);
  return out;
}

/** Tepe değeri hedefe normalize eder. */
export function normalize(buf: Mono, peak = 0.8): Mono {
  let m = 0;
  for (let i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i] ?? 0));
  return m > 0 ? gain(buf, peak / m) : buf;
}

/** Zaman noktalarına kısa parçalar yerleştirir (vuruş dizileri). */
export function sequence(duration: number, times: number[], make: (i: number, t: number) => Mono): Mono {
  let out: Mono = sil(duration);
  times.forEach((t, i) => { if (t < duration) out = place(out, make(i, t), t); });
  return fit(out, duration, 0.005);
}

/** Karplus-Strong tel sesi (gitar/arp). */
export function pluck(duration: number, freq: number, amp = 0.6, damp = 0.996): Mono {
  const n = samples(duration);
  const period = Math.max(2, Math.round(SR / freq));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  const out = new Float32Array(n);
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const next = (idx + 1) % period;
    const v = damp * 0.5 * ((ring[idx] ?? 0) + (ring[next] ?? 0));
    out[i] = amp * (ring[idx] ?? 0);
    ring[idx] = v;
    idx = next;
  }
  return out;
}

/** Mono sinyali stereo çifte dönüştürür. */
export const stereo = (buf: Mono): Float32Array[] => [buf, new Float32Array(buf)];
