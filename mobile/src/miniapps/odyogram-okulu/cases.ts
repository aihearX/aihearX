import { pta, degreeLabel, type AudiogramData } from '@/core/ui';

export type Level = 'tip' | 'derece' | 'konfig' | 'karisik';
export type Question = {
  level: Exclude<Level, 'karisik'>;
  prompt: string;
  data: AudiogramData;
  options: string[];
  answer: string;
  explain: string;
  highlightFreqs?: number[];
};

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const step5 = (v: number) => Math.round(v / 5) * 5;
const clampDb = (v: number) => Math.max(-10, Math.min(110, step5(v)));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Hafif eğimli temel şekil (dB cinsinden ofsetler) */
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

function earForType(t: (typeof TYPES)[number]): { ac: (number | null)[]; bc: (number | null)[] } {
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

function qType(): Question {
  const t = pick(TYPES);
  const right = earForType(t);
  const left = earForType(t);
  return {
    level: 'tip',
    prompt: 'Bu odyogramdaki işitme kaybının tipi nedir?',
    data: { right, left },
    options: [...TYPES],
    answer: t,
    explain: TYPE_EXPLAIN[t],
  };
}

function qDegree(): Question {
  const target = pick(DEGREES);
  const ranges: Record<(typeof DEGREES)[number], [number, number]> = {
    'Normal işitme': [0, 22], 'Hafif kayıp': [28, 38], 'Orta kayıp': [43, 53], 'Orta-ileri kayıp': [58, 68], 'İleri kayıp': [73, 88], 'Çok ileri kayıp': [93, 105],
  };
  const [lo, hi] = ranges[target];
  let ac: (number | null)[] = [];
  // PTA'sı hedef aralığa düşene kadar üret
  for (let i = 0; i < 30; i++) {
    ac = build(rnd(lo, hi), pick([SHAPES.flat, SHAPES.gentle, SHAPES.slope]), 4);
    const p = pta(ac);
    if (p != null && degreeLabel(p) === target) break;
  }
  const p = pta(ac) ?? 0;
  const label = degreeLabel(p);
  const ear = pick(['Sağ', 'Sol'] as const);
  const data: AudiogramData = ear === 'Sağ' ? { right: { ac } } : { left: { ac } };
  return {
    level: 'derece',
    prompt: `${ear} kulak için kayıp derecesi nedir? (PTA: 500-1k-2k)`,
    data,
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

function qConfig(): Question {
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
  return {
    level: 'konfig',
    prompt: `${ear} kulak odyogramının konfigürasyonu nedir?`,
    data: ear === 'Sağ' ? { right: { ac } } : { left: { ac } },
    options: [...CONFIGS],
    answer: c,
    explain: CONFIG_EXPLAIN[c],
  };
}

export function makeRound(level: Level, count = 10): Question[] {
  const gens: Record<Exclude<Level, 'karisik'>, () => Question> = { tip: qType, derece: qDegree, konfig: qConfig };
  const qs: Question[] = [];
  for (let i = 0; i < count; i++) {
    const l = level === 'karisik' ? pick(['tip', 'derece', 'konfig'] as const) : level;
    const q = gens[l]();
    qs.push({ ...q, options: shuffle(q.options) });
  }
  return qs;
}

export const LEVEL_META: Record<Level, { title: string; desc: string; icon: 'git-branch' | 'stats-chart' | 'analytics' | 'shuffle' }> = {
  tip: { title: 'Tip', desc: 'Normal · İletim · Sensörinöral · Mikst', icon: 'git-branch' },
  derece: { title: 'Derece', desc: 'PTA hesapla, dereceyi söyle', icon: 'stats-chart' },
  konfig: { title: 'Konfigürasyon', desc: 'Eğimli, yükselen, düz, çentikli, köşe', icon: 'analytics' },
  karisik: { title: 'Karışık', desc: 'Hepsi bir arada, gerçek sınav gibi', icon: 'shuffle' },
};
