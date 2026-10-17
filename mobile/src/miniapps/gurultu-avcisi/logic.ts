import { dayIndex, pickDaily, seededRandom } from '@/core/util/day';

/** Bir oyunda okunan üçlü sayısı. */
export const TOTAL_ROUNDS = 20;
/** Zorluk basamağı: 0 (en kolay, +20 dB) → MAX_STEP (en zor, −10 dB). */
export const MAX_STEP = 12;
export const MAX_LIVES = 3;
/** Gürültü süresi (sn); konuşma bu pencerenin içinde biter. */
export const NOISE_SECONDS = 3.2;
export const XP_REWARD = 45;

export const DIGIT_WORDS = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'] as const;

export type Levels = { speechVol: number; noiseAmp: number; snrDb: number };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Göreli SNR: 20·log10(konuşma ses düzeyi / gürültü genliği). Kalibre değildir. */
export const snrOf = (speechVol: number, noiseAmp: number) => 20 * Math.log10(speechVol / noiseAmp);

/**
 * Basamağa göre konuşma sesi (TTS volume 0.05–1) ve gürültü genliği.
 * Hedef SNR +20 dB'den −10 dB'ye 2.5 dB adımlarla iner; gürültü de 0.1'den 0.5'e yükselir.
 */
export function levelsFor(step: number): Levels {
  const s = clamp(step, 0, MAX_STEP);
  const target = 20 - s * 2.5;
  const noiseAmp = 0.1 + 0.4 * (s / MAX_STEP);
  const speechVol = clamp(noiseAmp * Math.pow(10, target / 20), 0.05, 1);
  return { speechVol, noiseAmp, snrDb: snrOf(speechVol, noiseAmp) };
}

/** "+12 dB", "0 dB", "−6 dB" */
export function fmtSnr(db: number): string {
  const r = Math.round(db);
  const sign = r > 0 ? '+' : r < 0 ? '−' : '';
  return `${sign}${Math.abs(r)} dB`;
}

/** Rastgele, tekrarsız rakam üçlüleri; ardışık iki üçlü aynı olmaz. */
export function makeTriplets(rng: () => number, count = TOTAL_ROUNDS): number[][] {
  const out: number[][] = [];
  let prev = '';
  while (out.length < count) {
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const t: number[] = [];
    for (let i = 0; i < 3; i++) {
      const k = Math.floor(rng() * pool.length);
      t.push(pool.splice(k, 1)[0]!);
    }
    const key = t.join('');
    if (key === prev) continue;
    prev = key;
    out.push(t);
  }
  return out;
}

const DAILY_SEEDS = [1103, 2237, 3391, 4493, 5557, 6689, 7723, 8861, 9973] as const;

/** Günün avı: aynı gün herkese aynı dizi. */
export function dailyRng(): () => number {
  return seededRandom(pickDaily(DAILY_SEEDS) * 100003 + dayIndex());
}
export function freeRng(): () => number {
  return seededRandom(Math.floor(Math.random() * 0x7fffffff));
}

/** Doğru cevapta puan: (basamak + 1) × 100 × kombo (en çok 5x). */
export function gainFor(step: number, combo: number): number {
  return (step + 1) * 100 * Math.min(5, Math.max(1, combo));
}

export function sameTriplet(a: number[], b: number[]): boolean {
  return a.length === 3 && b.length === 3 && a.every((d, i) => d === b[i]);
}

/** Sonuç cümlesi; en zor doğru bilinen SNR'a göre. Dürüst ve ölçülü. */
export function skillSentence(bestSnrDb: number | null): string {
  if (bestSnrDb == null) return 'Gürültüde konuşmayı anlama becerin: bu turda ölçülemedi. Sessiz bir yerde, kulaklıkla tekrar dene.';
  if (bestSnrDb <= -7.5) return 'Gürültüde konuşmayı anlama becerin: çok iyi görünüyor. Gürültü konuşmadan çok daha yüksekken bile rakamları yakaladın.';
  if (bestSnrDb <= -2.5) return 'Gürültüde konuşmayı anlama becerin: iyi görünüyor. Konuşma gürültünün altındayken bile çoğu rakamı yakaladın.';
  if (bestSnrDb <= 5) return 'Gürültüde konuşmayı anlama becerin: ortalama görünüyor. Gürültü ile konuşma başa baş olunca zorlanmaya başladın.';
  return 'Gürültüde konuşmayı anlama becerin: bu turda zorlandı. Konuşma gürültüden belirgin yüksekken bile hatalar oldu.';
}

export const SKILL_CAVEAT = 'Bu bir oyun, tarama testi değil; cihaz, kulaklık ve ortam fark yaratır. Ses düzeyleri göreli, kalibre değil. Gürültüde anlamakta zorlanıyorsan bir odyoloğa git.';

export function shareTextFor(score: number, bestSnrDb: number | null): string {
  const snr = bestSnrDb == null ? 'ilk adım' : `${fmtSnr(bestSnrDb)}'ye kadar`;
  return `Gürültü Avcısı 🎯 ${score.toLocaleString('tr-TR')} puan · ${snr} · aihearX`;
}
