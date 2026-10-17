import { AUDIOGRAM_FREQS } from '@/core/ui';

export type Formula = 'half' | 'pogo' | 'third' | 'nalr';
export type Ear = 'right' | 'left';
export type Thresholds = number[]; // AUDIOGRAM_FREQS sırasıyla, dB HL

export const FORMULAS: { id: Formula; name: string; desc: string }[] = [
  { id: 'half', name: 'Yarım kazanç', desc: 'IG = 0,5 × eşik (Lybarger). En basit kural.' },
  { id: 'pogo', name: 'POGO', desc: 'Yarım kazanç − 10 dB (250 Hz) − 5 dB (500 Hz): alçak frekans düzeltmeli.' },
  { id: 'third', name: 'Üçte bir', desc: 'IG = eşik / 3. Hafif kayıplarda ve ilk uyum için daha ılımlı.' },
  { id: 'nalr', name: 'NAL-R', desc: 'IG = 0,05 × (E500+E1k+E2k) + 0,31 × eşik + k(f). Konuşma frekanslarını dengeler.' },
];

const NALR_K: Record<number, number> = { 250: -17, 500: -8, 1000: 1, 2000: -1, 4000: -2, 8000: -2 };
const POGO_C: Record<number, number> = { 250: -10, 500: -5 };

export function targetGain(th: Thresholds, f: Formula): number[] {
  const x = 0.05 * ((th[1] ?? 0) + (th[2] ?? 0) + (th[3] ?? 0));
  return AUDIOGRAM_FREQS.map((freq, i) => {
    const t = th[i] ?? 0;
    let g: number;
    switch (f) {
      case 'half': g = 0.5 * t; break;
      case 'pogo': g = 0.5 * t + (POGO_C[freq] ?? 0); break;
      case 'third': g = t / 3; break;
      case 'nalr': g = x + 0.31 * t + (NALR_K[freq] ?? 0); break;
    }
    return Math.max(0, Math.round(g));
  });
}

export const PRESETS: { id: string; name: string; right: Thresholds; left: Thresholds }[] = [
  { id: 'normal', name: 'Normal', right: [10, 10, 10, 15, 15, 20], left: [10, 10, 10, 10, 15, 20] },
  { id: 'presbi', name: 'Presbiakuzi', right: [20, 25, 35, 50, 65, 75], left: [20, 25, 30, 45, 60, 70] },
  { id: 'gurultu', name: 'Gürültü (4k çentik)', right: [15, 15, 20, 30, 60, 35], left: [15, 15, 20, 35, 65, 40] },
  { id: 'duz', name: 'Düz orta', right: [45, 45, 50, 50, 50, 55], left: [45, 50, 50, 50, 55, 55] },
];

/** Hastaya yönelik iki cümlelik açıklama. */
export function patientText(ptaR: number | null, ptaL: number | null, gainR: number[], gainL: number[]): string {
  const maxR = Math.max(...gainR), maxL = Math.max(...gainL);
  const worst = Math.max(ptaR ?? 0, ptaL ?? 0);
  const highR = (gainR[4] ?? 0) > (gainR[1] ?? 0) + 5, highL = (gainL[4] ?? 0) > (gainL[1] ?? 0) + 5;
  const s1 = worst <= 25
    ? 'Ortalama eşikleriniz normal sınırlarda; cihaz hedefi çok düşük çıkıyor, yani güçlendirme ihtiyacı belirgin değil.'
    : `İşitme cihazı sesleri her frekansta eşit değil, en çok ihtiyaç duyduğunuz bölgelerde (sağ en fazla ${maxR} dB, sol ${maxL} dB) güçlendirir.`;
  const s2 = highR || highL
    ? 'Sizde ince (tiz) sesler daha zor duyulduğundan cihaz özellikle "s, ş, f" gibi sessiz harfleri öne çıkarır; ilk haftalarda sesler biraz tiz gelebilir, bu alışma sürecinin parçasıdır.'
    : 'Kazanç frekanslar arasında dengeli; ilk uyumda seslerin biraz yüksek gelmesi normaldir ve kontrol seansında ince ayar yapılır.';
  return `${s1} ${s2}`;
}
