/** Çalınan frekanslar (Hz), tizden kalına. */
export const TEST_FREQS = [16000, 15000, 14000, 13000, 12000, 11000, 10000, 9000, 8000] as const;
export const TONE_DURATION = 1.2;
export const TONE_AMPLITUDE = 0.6;

export type AgeEstimate = { age: number; range: string; line: string };

/** Duyulan en tiz frekansı yaklaşık "kulak yaşı"na çevirir. */
export function estimateAge(highestHeard: number | null): AgeEstimate {
  if (highestHeard == null || highestHeard <= 8000) return { age: 58, range: '55+', line: 'Tecrübeli bir kulak. Tizler biraz uzaklaşmış olabilir; bu çok normal.' };
  if (highestHeard >= 16000) return { age: 18, range: "20'nin altı", line: 'Yarasa kulağı! Köpek düdüğünü bile duyuyor olabilirsin.' };
  const table: Record<number, AgeEstimate> = {
    15000: { age: 23, range: '20-25', line: 'Taptaze bir kulak. Konser sonrası çınlamaya dikkat.' },
    14000: { age: 28, range: '25-30', line: 'Gayet iyi. Kulaklık sesini biraz kıssan hep böyle kalır.' },
    13000: { age: 33, range: '30-35', line: 'Olgun ama formda. Tizlerin çoğu hâlâ seninle.' },
    12000: { age: 38, range: '35-40', line: 'Gayet normal bir kulak. En tiz uçlar yavaşça veda ediyor.' },
    11000: { age: 43, range: '40-45', line: 'Hâlâ sağlam. Gürültülü ortamlarda kulak tıkacı iyi bir dost.' },
    10000: { age: 48, range: '45-50', line: 'Konuşma frekansları seninle; tizler biraz sessizleşmiş.' },
    9000: { age: 53, range: '50-55', line: 'Gayet beklenen bir profil. Bir kontrol zaman kazandırır.' },
  };
  return table[highestHeard] ?? { age: 58, range: '55+', line: 'Tecrübeli bir kulak.' };
}

export const kHz = (f: number) => `${(f / 1000).toFixed(0)} kHz`;
