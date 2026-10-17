/** Yerel gün anahtarı: YYYY-MM-DD */
export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
/** 1970'ten beri gün sayısı (günlük içerik seçimi için deterministik indeks). */
export function dayIndex(d = new Date()): number {
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}
export function isYesterday(key: string, today = new Date()): boolean {
  const y = new Date(today); y.setDate(y.getDate() - 1);
  return dayKey(y) === key;
}
/** Deterministik seçim: aynı gün herkese aynı öğe. */
export function pickDaily<T>(items: readonly T[], offset = 0): T {
  return items[(dayIndex() + offset) % items.length]!;
}
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
