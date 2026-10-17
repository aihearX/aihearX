import { renderNoise, SAMPLE_RATE } from '@/core/audio';
import { NOISE_SECONDS } from './logic';

let cache: Float32Array[] | null = null;

/**
 * Konuşma biçimli gürültü yaklaşımı: pembe gürültü + tek kutuplu alçak geçiren filtre (~1.2 kHz).
 * Pembe gürültü oktav başına 3 dB düşer; filtre üst bölgeyi 6 dB/oktav daha bastırır; uzun dönem
 * konuşma spektrumuna kabaca benzer. Tepe 0.9'a normalize edilir; gürültü düzeyi oynatıcı sesiyle ayarlanır.
 */
export function speechShapedNoise(): Float32Array[] {
  if (cache) return cache;
  const pink = renderNoise({ duration: NOISE_SECONDS, amplitude: 1, color: 'pink' });
  const alpha = 1 - Math.exp((-2 * Math.PI * 1200) / SAMPLE_RATE);
  const filtered = pink.map((ch) => {
    const y = new Float32Array(ch.length);
    let acc = 0;
    for (let i = 0; i < ch.length; i++) {
      acc += alpha * ((ch[i] ?? 0) - acc);
      y[i] = acc;
    }
    return y;
  });
  let peak = 0;
  for (const ch of filtered) for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i] ?? 0));
  const g = peak > 0 ? 0.9 / peak : 1;
  for (const ch of filtered) for (let i = 0; i < ch.length; i++) ch[i] = (ch[i] ?? 0) * g;
  cache = filtered;
  return filtered;
}
