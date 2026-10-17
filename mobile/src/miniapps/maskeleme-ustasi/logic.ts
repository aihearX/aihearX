export type Transducer = 'supra' | 'insert';
export type TestType = 'AC' | 'BC';
export const FREQS = [250, 500, 1000, 2000, 4000, 8000] as const;
export type Freq = (typeof FREQS)[number];

export type Inputs = {
  freq: Freq;
  transducer: Transducer;
  test: TestType;
  acTest: number;
  bcTest: number;
  acNon: number;
  bcNon: number;
};

export type Result = {
  ia: number;
  oe: number;
  oeApplied: boolean;
  needed: boolean;
  reason: string;
  initial: number;
  max: number;
  dilemma: boolean;
  overmaskRisk: boolean;
  abgTest: number;
  abgNon: number;
  steps: string[];
};

/** Basitleştirilmiş IA varsayımı: supra-aural 40 dB, insert 55 dB (tüm frekanslarda sabit). */
export const IA: Record<Transducer, number> = { supra: 40, insert: 55 };

/** Oklüzyon etkisi (dB), kemik yolu maskelemesinde test dışı kulak kapatıldığı için eklenir. */
export function occlusionEffect(freq: Freq, t: Transducer): number {
  if (t === 'supra') return freq === 250 ? 30 : freq === 500 ? 20 : freq === 1000 ? 10 : 0;
  return freq === 250 ? 10 : freq === 500 ? 10 : 0;
}

export function compute(i: Inputs): Result {
  const ia = IA[i.transducer];
  const abgTest = i.acTest - i.bcTest;
  const abgNon = i.acNon - i.bcNon;
  const steps: string[] = [];
  let needed: boolean;
  let reason: string;
  let initial: number;
  let oe = 0;
  let oeApplied = false;

  if (i.test === 'AC') {
    needed = i.acTest - ia >= i.bcNon;
    steps.push(`Gereklilik: AC_test − IA ≥ BC_test dışı → ${i.acTest} − ${ia} = ${i.acTest - ia} ${needed ? '≥' : '<'} ${i.bcNon}`);
    reason = needed
      ? `Test kulağına verilen ${i.acTest} dB, kafatasından ${ia} dB kaybederek karşı kokleaya ${i.acTest - ia} dB ulaşır; bu değer karşı kemik yolu eşiğine (${i.bcNon}) ulaştığı için karşı kulak duyabilir.`
      : `Karşı kokleaya ulaşan ses (${i.acTest - ia} dB) karşı kemik yolu eşiğinin (${i.bcNon}) altında kalır; çapraz işitme beklenmez.`;
    initial = i.acNon + 10;
    steps.push(`Başlangıç maskesi (Hood): AC_test dışı + 10 güvenlik = ${i.acNon} + 10 = ${initial} dB EM`);
  } else {
    needed = abgTest >= 10;
    steps.push(`Gereklilik: hava-kemik aralığı (test kulağı) ≥ 10 → ${i.acTest} − ${i.bcTest} = ${abgTest} ${needed ? '≥' : '<'} 10`);
    reason = needed
      ? `Kemik yolu IA'sı ≈ 0 dB olduğundan hangi kokleanın yanıt verdiği belirsizdir; ${abgTest} dB hava-kemik aralığı maskeleme ister.`
      : `Hava-kemik aralığı ${abgTest} dB (<10); kemik yolu eşiği hava yoluyla uyumlu, maskeleme gerekmez.`;
    oe = occlusionEffect(i.freq, i.transducer);
    oeApplied = oe > 0 && abgNon < 20;
    initial = i.acNon + 10 + (oeApplied ? oe : 0);
    steps.push(`Oklüzyon etkisi (${i.freq} Hz, ${i.transducer === 'supra' ? 'supra-aural' : 'insert'}): ${oe} dB${oe > 0 && !oeApplied ? ' → test dışı kulakta ≥20 dB hava-kemik aralığı var, eklenmedi' : ''}`);
    steps.push(`Başlangıç maskesi: AC_test dışı + 10 + OE = ${i.acNon} + 10 + ${oeApplied ? oe : 0} = ${initial} dB EM`);
  }
  const max = i.bcTest + ia - 5;
  steps.push(`Maksimum maske: BC_test + IA − 5 = ${i.bcTest} + ${ia} − 5 = ${max} dB EM`);
  const dilemma = needed && initial >= max;
  const overmaskRisk = needed && initial + 15 > max;
  if (dilemma) steps.push('Başlangıç ≥ maksimum → maskeleme ikilemi: gürültü test kulağını da maskeler.');
  return { ia, oe, oeApplied, needed, reason, initial, max, dilemma, overmaskRisk, abgTest, abgNon, steps };
}

const r5 = (v: number) => Math.round(v / 5) * 5;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

/** Pratik için rastgele fakat klinik olarak tutarlı senaryo üretir. */
export function randomScenario(): Inputs {
  const transducer = pick(['supra', 'insert'] as const);
  const test = pick(['AC', 'BC'] as const);
  const freq = pick([500, 1000, 2000, 4000] as const);
  const kind = pick(['snhl', 'chl', 'mixed', 'normal'] as const);
  const bcNon = r5(rnd(0, 40));
  const acNon = bcNon + (Math.random() < 0.35 ? r5(rnd(15, 35)) : r5(rnd(0, 5)));
  let bcTest: number; let acTest: number;
  switch (kind) {
    case 'normal': bcTest = r5(rnd(0, 15)); acTest = bcTest + r5(rnd(0, 5)); break;
    case 'snhl': bcTest = r5(rnd(35, 70)); acTest = bcTest + r5(rnd(0, 5)); break;
    case 'chl': bcTest = r5(rnd(0, 15)); acTest = bcTest + r5(rnd(25, 50)); break;
    case 'mixed': bcTest = r5(rnd(30, 50)); acTest = bcTest + r5(rnd(20, 35)); break;
  }
  return { freq, transducer, test, acTest: Math.min(acTest, 110), bcTest: Math.min(bcTest, 70), acNon: Math.min(acNon, 110), bcNon };
}

export const TRANSDUCER_LABEL: Record<Transducer, string> = { supra: 'Supra-aural', insert: 'Insert' };
