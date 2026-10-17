/** Günlük seslerin yaklaşık dB SPL değerleri (öğretici, kaynak: NIOSH / CDC / WHO yaklaşık tabloları). */
export type SoundItem = { name: string; emoji: string; db: number; note?: string };

export const SOUNDS: SoundItem[] = [
  { name: 'İşitme eşiği', emoji: '🤫', db: 0, note: 'Sağlıklı genç kulağın duyabildiği en zayıf ses.' },
  { name: 'Nefes alma', emoji: '😮‍💨', db: 10 },
  { name: 'Yaprak hışırtısı', emoji: '🍃', db: 20 },
  { name: 'Fısıltı', emoji: '🤫', db: 30 },
  { name: 'Sessiz kırsal gece', emoji: '🌙', db: 30 },
  { name: 'Kütüphane', emoji: '📚', db: 40 },
  { name: 'Buzdolabı uğultusu', emoji: '🧊', db: 40 },
  { name: 'Sakin ofis', emoji: '🏢', db: 50 },
  { name: 'Hafif yağmur', emoji: '🌧️', db: 50 },
  { name: 'Bulaşık makinesi', emoji: '🍽️', db: 55 },
  { name: 'Normal konuşma', emoji: '🗣️', db: 60 },
  { name: 'Klima', emoji: '❄️', db: 60 },
  { name: 'Çamaşır makinesi', emoji: '🧺', db: 65 },
  { name: 'Elektrik süpürgesi', emoji: '🧹', db: 70 },
  { name: 'Kalabalık restoran', emoji: '🍝', db: 75 },
  { name: 'Çalar saat', emoji: '⏰', db: 80 },
  { name: 'Yoğun şehir trafiği', emoji: '🚗', db: 85, note: 'NIOSH sınırı: 85 dB(A) için günde 8 saat.' },
  { name: 'Saç kurutma makinesi', emoji: '💇', db: 90 },
  { name: 'Çim biçme makinesi', emoji: '🌱', db: 90 },
  { name: 'Metro geçişi', emoji: '🚇', db: 95 },
  { name: 'Motosiklet', emoji: '🏍️', db: 95 },
  { name: 'Elektrikli matkap', emoji: '🔩', db: 100 },
  { name: 'Kulaklıkta tam ses', emoji: '🎧', db: 105, note: 'Çoğu akıllı telefonda en yüksek seviye 100-110 dB arasındadır.' },
  { name: 'Zincirli testere', emoji: '🪚', db: 110 },
  { name: 'Rock konseri', emoji: '🎸', db: 110 },
  { name: 'Düğün salonu hoparlörü', emoji: '💃', db: 110 },
  { name: 'Stadyum tezahüratı', emoji: '🏟️', db: 115 },
  { name: 'Ambulans sireni', emoji: '🚑', db: 120, note: 'Rahatsızlık eşiği civarı; birkaç dakika bile riskli.' },
  { name: 'Gök gürültüsü (yakın)', emoji: '⛈️', db: 120 },
  { name: 'Havai fişek (yakın)', emoji: '🎆', db: 140 },
  { name: 'Jet kalkışı (25 m)', emoji: '✈️', db: 140, note: 'Ağrı eşiği. Anlık akustik travma riski.' },
  { name: 'Tüfek atışı', emoji: '🔫', db: 150 },
  { name: 'Davul-zurna (yanında)', emoji: '🥁', db: 110 },
  { name: 'Bebek ağlaması (yakın)', emoji: '👶', db: 110 },
  { name: 'Araba kornası (1 m)', emoji: '📯', db: 110 },
  { name: 'Köpek havlaması', emoji: '🐕', db: 90 },
  { name: 'Mikser / blender', emoji: '🥤', db: 88 },
  { name: 'Piyano forte', emoji: '🎹', db: 85 },
  { name: 'Sınıf gürültüsü', emoji: '🏫', db: 70 },
  { name: 'Okyanus dalgası', emoji: '🌊', db: 60 },
];

export const ROUNDS = 10;
export const MIN_DB = 0;
export const MAX_DB = 150;
export const STEP = 5;

/** Yakınlık puanı: ±5 tam puan, uzaklaştıkça azalır. */
export function scoreFor(diff: number): number {
  if (diff <= 5) return 100;
  if (diff <= 10) return 70;
  if (diff <= 15) return 45;
  if (diff <= 20) return 25;
  if (diff <= 30) return 10;
  return 0;
}

/** NIOSH kuralı: 85 dB(A) = 8 saat; her +3 dB süreyi yarıya indirir. */
export function safeExposure(db: number): string {
  if (db < 85) return 'Güvenli: günlük sınır yok';
  const hours = 8 / Math.pow(2, (db - 85) / 3);
  if (hours >= 1) return `${hours % 1 === 0 ? hours : hours.toFixed(1).replace('.', ',')} saat`;
  const minutes = hours * 60;
  if (minutes >= 1) return `${minutes < 10 ? minutes.toFixed(1).replace('.', ',') : Math.round(minutes)} dakika`;
  const seconds = minutes * 60;
  if (seconds >= 1) return `${seconds < 10 ? seconds.toFixed(1).replace('.', ',') : Math.round(seconds)} saniye`;
  return 'anında risk';
}

export function fmtNum(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function pickRounds(rng: () => number = Math.random): SoundItem[] {
  const a = [...SOUNDS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i]!; a[i] = a[j]!; a[j] = t;
  }
  return a.slice(0, ROUNDS);
}
