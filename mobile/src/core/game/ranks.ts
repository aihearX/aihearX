/** Skor → rütbe. Tüm oyunlar aynı altı rütbeyi kullanır; paylaşım kartında görünür. */
export type Rank = { id: string; name: string; emoji: string; min: number };
export const RANKS: Rank[] = [
  { id: 'cirak', name: 'Çırak Kulak', emoji: '🌱', min: 0 },
  { id: 'dikkatli', name: 'Dikkatli Kulak', emoji: '👂', min: 0.3 },
  { id: 'keskin', name: 'Keskin Kulak', emoji: '🎯', min: 0.5 },
  { id: 'usta', name: 'Usta Kulak', emoji: '🥇', min: 0.7 },
  { id: 'altin', name: 'Altın Kulak', emoji: '🏆', min: 0.85 },
  { id: 'koklea', name: 'Koklea Efsanesi', emoji: '🐚', min: 0.95 },
];
/** ratio: 0-1 (skor / mümkün en yüksek). */
export function rankFor(ratio: number): Rank {
  let r = RANKS[0]!;
  for (const x of RANKS) if (ratio >= x.min) r = x;
  return r;
}
export function nextRank(ratio: number): Rank | null {
  return RANKS.find((x) => x.min > ratio) ?? null;
}
