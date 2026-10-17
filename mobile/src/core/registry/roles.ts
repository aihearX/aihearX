import type { Role } from './types';

export const ROLES: { id: Role; name: string; emoji: string; hint: string }[] = [
  { id: 'odyolog', name: 'Odyolog', emoji: '🩺', hint: 'Klinik araçlar ve ağ öne çıkar' },
  { id: 'ogrenci', name: 'Odyoloji Öğrencisi', emoji: '🎓', hint: 'Öğrenme ve yarışmalar öne çıkar' },
  { id: 'odyometrist', name: 'Odyometrist', emoji: '🎧', hint: 'Klinik araçlar ve öğrenme' },
  { id: 'kbb', name: 'KBB Hekimi', emoji: '🏥', hint: 'Vakalar ve klinik araçlar' },
  { id: 'hasta', name: 'İşitme kaybı yaşıyorum', emoji: '👂', hint: 'İşitme ve çınlama araçları' },
  { id: 'denge', name: 'Denge sorunu yaşıyorum', emoji: '🌀', hint: 'Denge günlüğü ve anketler' },
  { id: 'aile', name: 'Yakınım için buradayım', emoji: '👨‍👩‍👧', hint: 'Anlamak ve desteklemek için' },
  { id: 'diger', name: 'Merak ettim', emoji: '✨', hint: 'Oyunlar ve testler' },
];

export const roleName = (r: Role) => ROLES.find((x) => x.id === r)?.name ?? r;
export const isClinician = (r: Role) => r === 'odyolog' || r === 'odyometrist' || r === 'kbb';
