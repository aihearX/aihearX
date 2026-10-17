/** Çalınan frekanslar (Hz), tizden kalına: 17 kHz → 8 kHz, 1 kHz adım. */
export const TEST_FREQS = [17000, 16000, 15000, 14000, 13000, 12000, 11000, 10000, 9000, 8000] as const;
export type TestFreq = (typeof TEST_FREQS)[number];
export const TONE_DURATION = 1.5;
export const TONE_AMPLITUDE = 0.6;
/** Sessiz "tuzak" deneme sayısı (dürüstlük kontrolü). */
export const CATCH_COUNT = 2;
/** Her frekans bir kez tekrar çalınabilir. */
export const REPLAYS_PER_TRIAL = 1;
export const XP_REWARD = 25;

export type Trial = { kind: 'tone'; freq: TestFreq } | { kind: 'catch' };
export type Mark = 'heard' | 'missed' | 'inferred';

/** Ton dizisine 2 rastgele tuzak (sessizlik) ekler; ilk deneme her zaman tondur. */
export function buildTrials(rng: () => number = Math.random): Trial[] {
  const trials: Trial[] = TEST_FREQS.map((freq) => ({ kind: 'tone', freq }));
  const slots = new Set<number>();
  while (slots.size < CATCH_COUNT) slots.add(1 + Math.floor(rng() * 4)); // 1..4 arası, farklı
  [...slots].sort((a, b) => b - a).forEach((pos) => trials.splice(pos, 0, { kind: 'catch' }));
  return trials;
}

export type AgeEstimate = { age: number; range: string; line: string };

/** Duyulan en tiz frekans → yaklaşık "kulak yaşı". */
export function estimateAge(highestHeard: number | null): AgeEstimate {
  if (highestHeard == null) return { age: 65, range: '60+', line: 'Tizler bu cihazda sana ulaşmadı. Kulaklık ve ses düzeyi çok şey değiştirir; bir de öyle dene.' };
  if (highestHeard >= 17000) return { age: 18, range: "20'nin altı", line: 'Yarasa kulağı! Köpek düdüğünü bile duyuyor olabilirsin.' };
  const table: Record<number, AgeEstimate> = {
    16000: { age: 23, range: '20-25', line: 'Taptaze bir kulak. Konser sonrası çınlamaya dikkat.' },
    15000: { age: 28, range: '25-30', line: 'Gayet iyi. Kulaklık sesini biraz kıssan hep böyle kalır.' },
    14000: { age: 33, range: '30-35', line: 'Olgun ama formda. Tizlerin çoğu hâlâ seninle.' },
    13000: { age: 38, range: '35-40', line: 'Gayet normal bir kulak. En tiz uçlar yavaşça veda ediyor.' },
    12000: { age: 43, range: '40-45', line: 'Hâlâ sağlam. Gürültülü ortamlarda kulak tıkacı iyi bir dost.' },
    11000: { age: 48, range: '45-50', line: 'Konuşma frekansları seninle; tizler biraz sessizleşmiş.' },
    10000: { age: 53, range: '50-55', line: 'Gayet beklenen bir profil. Bir kontrol zaman kazandırır.' },
    9000: { age: 58, range: '55-60', line: 'Tecrübeli bir kulak. Tizler biraz uzaklaşmış olabilir; bu çok normal.' },
  };
  return table[highestHeard] ?? { age: 62, range: '60+', line: 'Deneyimli bir kulak. Konuşmayı anlamakta zorlanıyorsan bir odyolog kontrolü iyi gelir.' };
}

export type Badge = { name: string; emoji: string };
export function badgeFor(highestHeard: number | null): Badge {
  if (highestHeard != null && highestHeard >= 16000) return { name: 'Yarasa Kulağı', emoji: '🦇' };
  if (highestHeard != null && highestHeard >= 14000) return { name: 'Genç Kulak', emoji: '🌱' };
  if (highestHeard != null && highestHeard >= 11000) return { name: 'Formda Kulak', emoji: '💪' };
  if (highestHeard != null && highestHeard >= 9000) return { name: 'Deneyimli Kulak', emoji: '🎓' };
  return { name: 'Bilge Kulak', emoji: '🦉' };
}

export const kHz = (f: number) => `${(f / 1000).toFixed(0)} kHz`;

export const shareTextFor = (age: number) => `Kulağım ${age} yaşında 👂 Seninki kaç? aihearX`;

/** Önceki sonuçla kıyas cümlesi. */
export function trendLine(current: number, previous: number | null): string {
  if (previous == null) return 'İlk sonucun bu. Birkaç hafta sonra tekrar dene, değişimi gör.';
  const d = current - previous;
  if (d === 0) return `Geçen seferle aynı: ${previous}. Tutarlı kulak.`;
  if (d < 0) return `Geçen sefer ${previous} idi; bu kez ${Math.abs(d)} yaş daha genç. Ortam ya da kulaklık fark etmiş olabilir.`;
  return `Geçen sefer ${previous} idi; bu kez ${d} yaş daha büyük. Gürültülü ortam ya da düşük ses sonucu etkiler.`;
}
