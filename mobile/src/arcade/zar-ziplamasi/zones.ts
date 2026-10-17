/** Zar Zıplaması — bölge tanımları ve sabitler. Yükseklik (metre) = piksel / METER_PX. */
export const METER_PX = 3;

export type ZoneId = 'kanal' | 'orta' | 'koklea' | 'sinir';

export type Zone = {
  id: ZoneId;
  name: string;
  sub: string;
  /** Bölgenin başladığı yükseklik (m) */
  from: number;
  /** Arka plan taban rengi */
  base: number;
  /** Normal platform rengi */
  platTint: number;
  /** Banner / vurgu rengi */
  accent: number;
  /** Paylaşım rütbesi */
  label: string;
};

export const ZONES: Zone[] = [
  { id: 'kanal', name: 'Kulak Kanalı', sub: 'Dış kulak · Yolculuk başlıyor', from: 0, base: 0xffe4d0, platTint: 0xf6b48c, accent: 0xd97a3e, label: 'Kanal Kaşifi' },
  { id: 'orta', name: 'Orta Kulak', sub: 'Kulak zarı ve kemikçikler', from: 500, base: 0xfde1e8, platTint: 0xf29fb6, accent: 0xd0476b, label: 'Orta Kulak Ustası' },
  { id: 'koklea', name: 'Koklea', sub: 'Tonotopi: inceden kalına', from: 1500, base: 0xece6ff, platTint: 0xc6b6ff, accent: 0x6c4cf1, label: 'Koklea Efsanesi' },
  { id: 'sinir', name: 'İşitme Siniri', sub: 'Beyne doğru son sıçrayış', from: 3500, base: 0x12245c, platTint: 0x7dd3fc, accent: 0x22d3ee, label: 'Sinir Yıldızı' },
];

export function zoneAt(m: number): number {
  let i = 0;
  for (let k = 0; k < ZONES.length; k++) if (m >= ZONES[k].from) i = k;
  return i;
}

export function rankLabel(m: number): string { return ZONES[zoneAt(m)].label; }

/** Koklea içindeki tonotopi ilerlemesi 0..1 */
export function cochleaT(m: number): number { return Math.max(0, Math.min(1, (m - 1500) / 2000)); }
