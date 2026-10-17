import { colors } from '@/core/theme';

/** Kalibre edilmemiş kaba dönüşüm: dBFS (negatif) → yaklaşık dB SPL. */
export const CAL_OFFSET = 90;
export const MIN_DB = 30;
export const MAX_DB = 120;
export const SESSION_SECONDS = 60;

export function meteringToSpl(metering: number | undefined): number | null {
  if (metering == null || !Number.isFinite(metering)) return null;
  // Bazı Android cihazlar pozitif ölçek döndürür; mantıklı aralığa sıkıştır.
  const dbfs = metering > 0 ? -Math.max(0, 90 - metering) : metering;
  return Math.max(MIN_DB, Math.min(MAX_DB, Math.round(dbfs + CAL_OFFSET)));
}

export type Zone = { name: string; color: string; advice: string };
export function zoneFor(db: number): Zone {
  if (db < 70) return { name: 'Güvenli', color: colors.mint, advice: 'Rahat bir ortam. Sohbet, ofis, sakin bir cadde.' };
  if (db < 85) return { name: 'Dikkat', color: colors.amber, advice: 'Trafik, kalabalık restoran. Uzun süre kalmak yorar ama genelde güvenli.' };
  if (db < 100) return { name: 'Riskli', color: '#FF8C42', advice: 'Motosiklet, konser kenarı, matkap. Kulak tıkacı tak, molalar ver.' };
  return { name: 'Tehlikeli', color: colors.red, advice: 'Sahne önü, havai fişek. Birkaç dakika bile zarar verebilir; uzaklaş ya da tıkaç tak.' };
}

/** 85 dB için 8 saat; her +3 dB süreyi yarıya indirir (NIOSH benzeri). */
export function safeExposure(db: number): string {
  if (db < 85) return '8 saat+';
  const hours = 8 * Math.pow(2, (85 - db) / 3);
  if (hours >= 1) return `~${hours % 1 === 0 ? hours : hours.toFixed(1)} saat`;
  const minutes = hours * 60;
  if (minutes >= 1) return `~${Math.round(minutes)} dakika`;
  return `~${Math.max(1, Math.round(minutes * 60))} saniye`;
}

export function placeFor(db: number): string {
  if (db < 40) return 'kütüphane sessizliği';
  if (db < 55) return 'sakin bir ev';
  if (db < 65) return 'normal sohbet';
  if (db < 75) return 'kalabalık bir kafe';
  if (db < 85) return 'yoğun trafik';
  if (db < 95) return 'motosiklet yanı';
  if (db < 105) return 'konser';
  return 'sahne önü / siren';
}
