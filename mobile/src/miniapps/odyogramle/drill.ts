import { pta, degreeLabel, type AudiogramData } from '@/core/ui';

/**
 * Antrenman: prosedürel odyogram üreteci.
 * Beş soru türü: tip, derece, konfigürasyon, hangi kulak daha kötü, PTA tahmini (±5 dB).
 */
export type DrillKind = 'tip' | 'derece' | 'konfig' | 'kulak' | 'pta';
export type DrillQuestion = {
  kind: DrillKind;
  prompt: string;
  data: AudiogramData;
  options: string[];
  answer: string;
  explain: string;
  highlightFreqs?: number[];
};

export const TOTAL_ROUNDS = 15;
export const LIVES = 3;
/** Tur ilerledikçe süre kısalır (zorluk). */
export const secondsForRound = (round: number): number => (round <= 5 ? 30 : round <= 10 ? 25 : 20);
export const levelForRound = (round: number): number => (round <= 5 ? 1 : round <= 10 ? 2 : 3);

export const KIND_META: Record<DrillKind, { title: string; icon: 'git-branch' | 'stats-chart' | 'analytics' | 'swap-horizontal' | 'calculator' }> = {
  tip: { title: 'Tip', icon: 'git-branch' },
  derece: { title: 'Derece', icon: 'stats-chart' },
  konfig: { title: 'Konfigürasyon', icon: 'analytics' },
  kulak: { title: 'Hangi kulak', icon: 'swap-horizontal' },
  pta: { title: 'PTA tahmini', icon: 'calculator' },
};

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const step5 = (v: number) => Math.round(v / 5) * 5;
const clampDb = (v: number) => Math.max(-10, Math.min(110, step5(v)));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Temel şekiller (dB ofsetleri); 999 = ölçülmedi. */
const SHAPES = {
  flat: [0, 0, 0, 0, 0, 0],
  slope: [-10, -5, 0, 10, 20, 25],
  gentle: [-5, -5, 0, 5, 10, 10],
  rise: [15, 10, 5, 0, -5, -10],
  notch: [-10, -10, -5, 0, 35, 5],
  corner: [0, 15, 30, 999, 999, 999],
} as const;

const build = (base: number, shape: readonly number[], jitter = 5): (number | null)[] =>
  shape.map((s) => (s > 500 ? null : clampDb(base + s + rnd(-jitter, jitter))));

export const TYPES = ['Normal', 'İletim tipi', 'Sensörinöral', 'Mikst'] as const;
export const DEGREES = ['Normal işitme', 'Hafif kayıp', 'Orta kayıp', 'Orta-ileri kayıp', 'İleri kayıp', 'Çok ileri kayıp'] as const;
export const CONFIGS = ['Eğimli', 'Yükselen', 'Düz', 'Çentikli (4k)', 'Köşe'] as const;

type Ear = { ac: (number | null)[]; bc: (number | null)[] };

function earForType(t: (typeof TYPES)[number]): Ear {
  switch (t) {
    case 'Normal': {
      const ac = build(rnd(0, 15), pick([SHAPES.flat, SHAPES.gentle]));
      return { ac, bc: ac.map((v) => (v == null ? null : clampDb(v - rnd(0, 5)))) };
    }
    case 'İletim tipi': {
      const bc = build(rnd(0, 12), SHAPES.flat, 3);
      const gap = rnd(25, 45);
      return { ac: bc.map((v) => (v == null ? null : clampDb(v + gap + rnd(-5, 5)))), bc };
    }
    case 'Sensörinöral': {
      const ac = build(rnd(35, 65), pick([SHAPES.slope, SHAPES.gentle, SHAPES.flat]));
      return { ac, bc: ac.map((v) => (v == null ? null : clampDb(v - rnd(0, 5)))) };
    }
    case 'Mikst': {
      const bc = build(rnd(30, 50), pick([SHAPES.gentle, SHAPES.slope]), 4);
      const gap = rnd(20, 35);
      return { ac: bc.map((v) => (v == null ? null : clampDb(v + gap + rnd(-3, 3)))), bc };
    }
  }
}

const TYPE_EXPLAIN: Record<(typeof TYPES)[number], string> = {
  'Normal': 'Hava ve kemik yolu eşikleri 20 dB HL ve altında; aralarında anlamlı fark yok.',
  'İletim tipi': 'Kemik yolu normal sınırlarda, hava yolu düşmüş: ≥15 dB hava-kemik aralığı iletim tipi kaybı gösterir.',
  'Sensörinöral': 'Hava ve kemik yolu birlikte düşmüş, aralarında ≤10 dB fark var: koklea/sinir kaynaklı kayıp.',
  'Mikst': 'Kemik yolu düşmüş VE üstüne hava-kemik aralığı var: hem sensörinöral hem iletim bileşeni.',
};

function qType(): DrillQuestion {
  const t = pick(TYPES);
  return { kind: 'tip', prompt: 'Bu odyogramdaki kaybın tipi nedir?', data: { right: earForType(t), left: earForType(t) }, options: [...TYPES], answer: t, explain: TYPE_EXPLAIN[t] };
}

const DEGREE_RANGES: Record<(typeof DEGREES)[number], [number, number]> = {
  'Normal işitme': [0, 22], 'Hafif kayıp': [28, 38], 'Orta kayıp': [43, 53], 'Orta-ileri kayıp': [58, 68], 'İleri kayıp': [73, 88], 'Çok ileri kayıp': [93, 105],
};

function acForDegree(target: (typeof DEGREES)[number]): (number | null)[] {
  const [lo, hi] = DEGREE_RANGES[target];
  let ac: (number | null)[] = [];
  for (let i = 0; i < 30; i++) {
    ac = build(rnd(lo, hi), pick([SHAPES.flat, SHAPES.gentle, SHAPES.slope]), 4);
    const p = pta(ac);
    if (p != null && degreeLabel(p) === target) break;
  }
  return ac;
}

function qDegree(): DrillQuestion {
  const target = pick(DEGREES);
  const ac = acForDegree(target);
  const p = pta(ac) ?? 0;
  const label = degreeLabel(p);
  const ear = pick(['Sağ', 'Sol'] as const);
  return {
    kind: 'derece',
    prompt: `${ear} kulak için kayıp derecesi nedir? (PTA: 500-1k-2k)`,
    data: ear === 'Sağ' ? { right: { ac } } : { left: { ac } },
    options: [...DEGREES],
    answer: label,
    explain: `PTA = (${ac[1]} + ${ac[2]} + ${ac[3]}) / 3 ≈ ${p} dB HL → ${label}.`,
    highlightFreqs: [500, 1000, 2000],
  };
}

const CONFIG_EXPLAIN: Record<(typeof CONFIGS)[number], string> = {
  'Eğimli': 'Yüksek frekanslara doğru eşikler kötüleşiyor: en sık görülen (presbiakuzi/gürültü) konfigürasyon.',
  'Yükselen': 'Alçak frekanslar kötü, yükseklere doğru düzeliyor: Ménière ve bazı iletim tipi kayıplarda görülür.',
  'Düz': 'Tüm frekanslarda eşikler birbirine yakın (±10 dB içinde).',
  'Çentikli (4k)': '3-6 kHz bölgesinde belirgin çentik, 8 kHz\'de toparlanma: gürültüye bağlı kaybın klasik izi.',
  'Köşe': 'Yalnız alçak frekanslarda ölçülebilir yanıt, yükseklerde odyometre sınırında yanıt yok: çok ileri kayıp.',
};

function qConfig(): DrillQuestion {
  const c = pick(CONFIGS);
  let ac: (number | null)[];
  switch (c) {
    case 'Eğimli': ac = build(rnd(20, 40), [-10, 0, 10, 25, 40, 50], 4); break;
    case 'Yükselen': ac = build(rnd(35, 50), [20, 15, 5, -5, -15, -20], 4); break;
    case 'Düz': ac = build(rnd(30, 60), SHAPES.flat, 4); break;
    case 'Çentikli (4k)': ac = build(rnd(10, 20), [0, 0, 0, 5, 40, 5], 3); break;
    case 'Köşe': ac = build(rnd(75, 90), [0, 10, 20, 999, 999, 999], 4); break;
  }
  const ear = pick(['Sağ', 'Sol'] as const);
  return { kind: 'konfig', prompt: `${ear} kulak odyogramının konfigürasyonu nedir?`, data: ear === 'Sağ' ? { right: { ac } } : { left: { ac } }, options: [...CONFIGS], answer: c, explain: CONFIG_EXPLAIN[c] };
}

const EAR_OPTIONS = ['Sağ kulak', 'Sol kulak', 'Eşit (fark ≤ 5 dB)'] as const;

function qEar(): DrillQuestion {
  const want = pick(EAR_OPTIONS);
  let right: (number | null)[] = [];
  let left: (number | null)[] = [];
  let pr = 0; let pl = 0;
  for (let i = 0; i < 40; i++) {
    const a = pick(DEGREES); const b = want === 'Eşit (fark ≤ 5 dB)' ? a : pick(DEGREES);
    right = acForDegree(a); left = acForDegree(b);
    pr = pta(right) ?? 0; pl = pta(left) ?? 0;
    const diff = pr - pl;
    const got = Math.abs(diff) <= 5 ? EAR_OPTIONS[2] : diff > 0 ? EAR_OPTIONS[0] : EAR_OPTIONS[1];
    if (got === want) break;
  }
  const diff = pr - pl;
  const answer = Math.abs(diff) <= 5 ? EAR_OPTIONS[2] : diff > 0 ? EAR_OPTIONS[0] : EAR_OPTIONS[1];
  return {
    kind: 'kulak',
    prompt: 'Hangi kulak daha kötü duyuyor? (PTA ile karşılaştır)',
    data: { right: { ac: right }, left: { ac: left } },
    options: [...EAR_OPTIONS],
    answer,
    explain: `PTA sağ ≈ ${pr} dB HL, sol ≈ ${pl} dB HL → ${answer === EAR_OPTIONS[2] ? 'fark 5 dB içinde, pratikte eşit' : `${answer.toLocaleLowerCase('tr-TR')} daha kötü (${Math.abs(diff)} dB fark)`}.`,
    highlightFreqs: [500, 1000, 2000],
  };
}

const dbLabel = (v: number) => `${v} dB HL`;

function qPta(): DrillQuestion {
  const ac = acForDegree(pick(DEGREES));
  const p = pta(ac) ?? 0;
  const nearest = Math.max(0, Math.min(110, step5(p)));
  const offsets = shuffle([-30, -20, -10, 10, 20, 30]).filter((o) => nearest + o >= 0 && nearest + o <= 110).slice(0, 3);
  const options = [nearest, ...offsets.map((o) => nearest + o)].map(dbLabel);
  const ear = pick(['Sağ', 'Sol'] as const);
  return {
    kind: 'pta',
    prompt: `${ear} kulak PTA tahminin? (±5 dB tolerans)`,
    data: ear === 'Sağ' ? { right: { ac } } : { left: { ac } },
    options,
    answer: dbLabel(nearest),
    explain: `PTA = (${ac[1]} + ${ac[2]} + ${ac[3]}) / 3 ≈ ${p} dB HL → en yakın seçenek ${nearest} dB HL (${degreeLabel(p)}).`,
    highlightFreqs: [500, 1000, 2000],
  };
}

const GENS: Record<DrillKind, () => DrillQuestion> = { tip: qType, derece: qDegree, konfig: qConfig, kulak: qEar, pta: qPta };
const KINDS_BY_LEVEL: Record<number, DrillKind[]> = {
  1: ['tip', 'kulak', 'konfig'],
  2: ['tip', 'derece', 'konfig', 'kulak'],
  3: ['tip', 'derece', 'konfig', 'kulak', 'pta'],
};

/** Tur numarasına göre (1-tabanlı) soru üretir; seviye yükseldikçe PTA ve derece soruları eklenir. */
export function makeQuestion(round: number): DrillQuestion {
  const kinds = KINDS_BY_LEVEL[levelForRound(round)] ?? KINDS_BY_LEVEL[3]!;
  const q = GENS[pick(kinds)]();
  return { ...q, options: shuffle(q.options) };
}

/** Doğru cevap puanı: taban 100 + kalan saniye bonusu, kombo çarpanı (en çok x2). */
export function scoreFor(secondsLeft: number, combo: number): number {
  const mult = 1 + Math.min(combo - 1, 4) * 0.25;
  return Math.round((100 + Math.round(secondsLeft) * 5) * mult);
}
