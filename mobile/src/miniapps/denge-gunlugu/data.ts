export type EpisodeType = 'dönme' | 'sersemlik' | 'dengesizlik' | 'baş boşluğu';
export type DurationPreset = 'saniyeler' | 'dakikalar' | 'saatler' | 'günler';

export const TYPES: { id: EpisodeType; emoji: string; hint: string }[] = [
  { id: 'dönme', emoji: '🌀', hint: 'Etraf ya da sen dönüyorsun' },
  { id: 'sersemlik', emoji: '😵‍💫', hint: 'Bayılacak gibi, göz kararması' },
  { id: 'dengesizlik', emoji: '🚶', hint: 'Yürürken yalpalama' },
  { id: 'baş boşluğu', emoji: '☁️', hint: 'Kafa bulanık, uzak hissi' },
];

export const DURATIONS: { id: DurationPreset; label: string }[] = [
  { id: 'saniyeler', label: 'Saniyeler' },
  { id: 'dakikalar', label: 'Dakikalar' },
  { id: 'saatler', label: 'Saatler' },
  { id: 'günler', label: 'Günler' },
];

export const TRIGGERS = ['baş hareketi', 'yatakta dönme', 'ayağa kalkma', 'stres', 'uykusuzluk', 'tuzlu yemek', 'kafein', 'ekran'] as const;
export const ACCOMPANYING = ['bulantı', 'işitme azalması', 'çınlama', 'kulakta dolgunluk', 'baş ağrısı', 'görme bozukluğu'] as const;

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
export const fmtShort = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}.${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const severityColor = (s: number, c: { mint: string; amber: string; coral: string; red: string }) => (s <= 3 ? c.mint : s <= 6 ? c.amber : s <= 8 ? c.coral : c.red);
