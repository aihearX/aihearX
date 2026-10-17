/**
 * Koklea Koşusu — önceden tasarlanmış engel parçaları (chunk) ve tohumlu RNG.
 * x: parça başlangıcına göre piksel; h: zeminden yükseklik (jeton/güç için).
 */
export type ItemKind = 'spike' | 'serumen' | 'cloud' | 'drop' | 'coin' | 'shield' | 'magnet' | 'life';
export type ChunkItem = { k: ItemKind; x: number; h?: number };
export type Chunk = { name: string; diff: 0 | 1 | 2 | 3; len: number; items: ChunkItem[] };

/** mulberry32: aynı tohum → aynı koşu. */
export function makeRng(seed: number) {
  let a = (seed >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const line = (x0: number, n: number, h: number, dx = 34): ChunkItem[] => Array.from({ length: n }, (_, i) => ({ k: 'coin', x: x0 + i * dx, h }));
/** Parabolik jeton yayı: n jeton, tepe yüksekliği peak, taban yüksekliği base. */
const arc = (x0: number, n: number, peak: number, base = 20, dx = 34): ChunkItem[] =>
  Array.from({ length: n }, (_, i) => { const u = (i / (n - 1)) * 2 - 1; return { k: 'coin', x: x0 + i * dx, h: Math.round(base + (peak - base) * (1 - u * u)) }; });
const zig = (x0: number, n: number, lo: number, hi: number, dx = 34): ChunkItem[] => Array.from({ length: n }, (_, i) => ({ k: 'coin', x: x0 + i * dx, h: i % 2 ? hi : lo }));
const spikes = (x0: number, n: number, dx = 38): ChunkItem[] => Array.from({ length: n }, (_, i) => ({ k: 'spike', x: x0 + i * dx }));

export const CHUNKS: Chunk[] = [
  // ---- diff 0: nefes alanı
  { name: 'nefes', diff: 0, len: 420, items: [...arc(60, 7, 90)] },
  { name: 'nefes-yüksek', diff: 0, len: 480, items: [...line(60, 5, 20), ...arc(250, 5, 150, 60)] },
  // ---- diff 1
  { name: 'ısınma', diff: 1, len: 620, items: [...line(40, 5, 20), ...spikes(380, 1), ...arc(330, 5, 110)] },
  { name: 'tek-diken', diff: 1, len: 760, items: [...spikes(200, 1), ...arc(130, 6, 120), ...spikes(560, 1)] },
  { name: 'serumen-yolu', diff: 1, len: 700, items: [{ k: 'serumen', x: 150 }, ...line(220, 4, 24), { k: 'serumen', x: 420 }, ...line(500, 4, 20)] },
  { name: 'alçak-bulut', diff: 1, len: 660, items: [{ k: 'cloud', x: 300 }, ...line(250, 5, 8), ...arc(480, 4, 70)] },
  { name: 'tek-damla', diff: 1, len: 640, items: [{ k: 'drop', x: 260 }, ...line(60, 4, 20), ...line(380, 5, 20)] },
  // ---- diff 2
  { name: 'çift-diken', diff: 2, len: 820, items: [...spikes(220, 2), ...arc(130, 7, 140), ...spikes(640, 1), { k: 'shield', x: 460, h: 110 }] },
  { name: 'damla-yağmuru', diff: 2, len: 820, items: [{ k: 'drop', x: 160 }, { k: 'drop', x: 460 }, ...line(240, 5, 30), ...line(560, 5, 30)] },
  { name: 'bulut-diken', diff: 2, len: 840, items: [{ k: 'cloud', x: 200 }, ...line(160, 4, 8), ...spikes(460, 1), ...arc(400, 5, 110), { k: 'serumen', x: 700 }] },
  { name: 'zigzag', diff: 2, len: 800, items: [...zig(40, 8, 20, 90), ...spikes(360, 1), { k: 'serumen', x: 560 }, ...line(620, 4, 20)] },
  { name: 'yüksek-yay', diff: 2, len: 820, items: [...spikes(330, 2), ...arc(180, 9, 230, 40), { k: 'magnet', x: 316, h: 250 }] },
  { name: 'bulut-damla', diff: 2, len: 780, items: [{ k: 'cloud', x: 180 }, ...line(140, 4, 8), { k: 'drop', x: 480 }, ...arc(540, 5, 100)] },
  // ---- diff 3
  { name: 'bulut-koridoru', diff: 3, len: 980, items: [{ k: 'cloud', x: 160 }, { k: 'cloud', x: 360 }, ...line(120, 9, 8), { k: 'drop', x: 560 }, ...spikes(760, 1), ...arc(700, 5, 120)] },
  { name: 'diken-tarlası', diff: 3, len: 1040, items: [...spikes(130, 1), ...arc(80, 5, 120), ...spikes(380, 2), ...arc(330, 6, 150), ...spikes(720, 3), ...arc(660, 7, 180, 30)] },
  { name: 'kaos', diff: 3, len: 1080, items: [{ k: 'serumen', x: 110 }, { k: 'cloud', x: 280 }, ...line(240, 4, 8), ...spikes(470, 2), ...arc(420, 6, 140), { k: 'drop', x: 720 }, { k: 'shield', x: 900, h: 110 }, ...line(820, 4, 20)] },
  { name: 'üçlü-zıplama', diff: 3, len: 1060, items: [...spikes(150, 1), ...arc(100, 5, 110), ...spikes(380, 2), ...arc(330, 6, 150), ...spikes(680, 3), ...arc(620, 7, 190, 40), { k: 'life', x: 950, h: 60 }] },
  { name: 'damla-bulut-diken', diff: 3, len: 1000, items: [{ k: 'drop', x: 140 }, ...line(60, 4, 20), { k: 'cloud', x: 420 }, ...line(380, 4, 8), ...spikes(660, 2), ...arc(600, 6, 150), { k: 'magnet', x: 900, h: 90 }] },
];

/** Seviyeye göre uygun parçayı seç (tohumlu). */
export function pickChunk(rng: () => number, level: number, lastName: string): Chunk {
  const maxDiff = level <= 2 ? 1 : level <= 4 ? 2 : 3;
  const weights: number[] = CHUNKS.map((c) => {
    if (c.diff > maxDiff) return 0;
    if (c.name === lastName) return 0.1;
    if (c.diff === 0) return level <= 2 ? 1.2 : 0.6;
    // en yüksek uygun zorluk daha olası, bir alt zorluk da sıkça gelir
    return c.diff === maxDiff ? 2 : c.diff === maxDiff - 1 ? 1.1 : 0.5;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < CHUNKS.length; i++) { r -= weights[i]; if (r <= 0) return CHUNKS[i]; }
  return CHUNKS[0];
}
