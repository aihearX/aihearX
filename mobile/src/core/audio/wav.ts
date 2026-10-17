/**
 * Saf JS ile WAV üretimi. Ton, gürültü ve kısa diziler için.
 * 16-bit PCM, mono, 44.1 kHz. Dosyaya yazılıp expo-audio ile çalınır.
 */
export const SAMPLE_RATE = 44100;

export type ToneSpec = {
  freq: number;
  /** saniye */
  duration: number;
  /** 0-1 */
  amplitude?: number;
  /** 'sine' | 'warble' (odyometre uyarı tonu gibi) */
  kind?: 'sine' | 'warble';
  /** 'both' | 'left' | 'right' — stereo yönlendirme */
  ear?: 'both' | 'left' | 'right';
  /** yumuşak giriş/çıkış, saniye */
  ramp?: number;
};

export type NoiseSpec = { duration: number; amplitude?: number; color: 'white' | 'pink' | 'brown'; ear?: 'both' | 'left' | 'right' };

function envelope(i: number, n: number, rampSamples: number): number {
  if (i < rampSamples) return i / rampSamples;
  if (i > n - rampSamples) return Math.max(0, (n - i) / rampSamples);
  return 1;
}

export function renderTone(spec: ToneSpec): Float32Array[] {
  const n = Math.floor(spec.duration * SAMPLE_RATE);
  const amp = spec.amplitude ?? 0.5;
  const ramp = Math.floor((spec.ramp ?? 0.02) * SAMPLE_RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let f = spec.freq;
    if (spec.kind === 'warble') f = spec.freq * (1 + 0.05 * Math.sin(2 * Math.PI * 5 * t));
    out[i] = amp * Math.sin(2 * Math.PI * f * t) * envelope(i, n, ramp);
  }
  return toStereo(out, spec.ear ?? 'both');
}

export function renderNoise(spec: NoiseSpec): Float32Array[] {
  const n = Math.floor(spec.duration * SAMPLE_RATE);
  const amp = spec.amplitude ?? 0.3;
  const out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    let v = w;
    if (spec.color === 'pink') {
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      v = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    } else if (spec.color === 'brown') {
      last = (last + 0.02 * w) / 1.02; v = last * 3.5;
    }
    out[i] = amp * Math.max(-1, Math.min(1, v)) * envelope(i, n, Math.floor(0.05 * SAMPLE_RATE));
  }
  return toStereo(out, spec.ear ?? 'both');
}

/** Birden fazla parçayı art arda ekler (stereo kanal çiftleri). */
export function concat(parts: Float32Array[][]): Float32Array[] {
  const len = parts.reduce((a, p) => a + p[0]!.length, 0);
  const L = new Float32Array(len), R = new Float32Array(len);
  let off = 0;
  for (const p of parts) { L.set(p[0]!, off); R.set(p[1]!, off); off += p[0]!.length; }
  return [L, R];
}

export function silence(duration: number): Float32Array[] {
  const n = Math.floor(duration * SAMPLE_RATE);
  return [new Float32Array(n), new Float32Array(n)];
}

/** İki stereo sinyali karıştırır (aynı uzunlukta olmalı; kısa olan sıfırla doldurulur). */
export function mix(a: Float32Array[], b: Float32Array[], gainB = 1): Float32Array[] {
  const len = Math.max(a[0]!.length, b[0]!.length);
  const L = new Float32Array(len), R = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    L[i] = Math.max(-1, Math.min(1, (a[0]![i] ?? 0) + gainB * (b[0]![i] ?? 0)));
    R[i] = Math.max(-1, Math.min(1, (a[1]![i] ?? 0) + gainB * (b[1]![i] ?? 0)));
  }
  return [L, R];
}

function toStereo(mono: Float32Array, ear: 'both' | 'left' | 'right'): Float32Array[] {
  const L = ear === 'right' ? new Float32Array(mono.length) : mono;
  const R = ear === 'left' ? new Float32Array(mono.length) : mono;
  return [L, R];
}

/** Stereo float örnekleri 16-bit PCM WAV baytlarına çevirir. */
export function encodeWav(channels: Float32Array[], sampleRate = SAMPLE_RATE): Uint8Array {
  const numCh = channels.length;
  const n = channels[0]!.length;
  const dataBytes = n * numCh * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + dataBytes, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, numCh, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * numCh * 2, true);
  v.setUint16(32, numCh * 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, dataBytes, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < numCh; c++) {
    const s = Math.max(-1, Math.min(1, channels[c]![i] ?? 0));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
  }
  return new Uint8Array(buf);
}
