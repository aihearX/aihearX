// aihearX tasarım dili: "Kâğıt & Koklea" (açık tema)
// Beyaz zemin, çok hafif gri yüzeyler, tek marka vurgusu (mor), ikincil vurgu (deniz yeşili).
// Odyoloji geleneği korunur: sağ kulak kırmızı, sol kulak mavi.
export const colors = {
  bg: '#FFFFFF',
  bg2: '#F7F8FB',
  bg3: '#EEF0F6',
  surface: '#F7F8FB',
  surfaceStrong: '#EEF0F6',
  border: '#E6E8F0',
  borderStrong: '#D4D8E4',
  text: '#13162A',
  textMuted: '#5D6378',
  textFaint: '#8C92A8',
  accent: '#6C4CF1',
  accentSoft: '#EFEBFE',
  accent2: '#0E9C98',
  accent2Soft: '#E2F5F3',
  coral: '#F0567A',
  amber: '#D98B00',
  mint: '#16A34A',
  red: '#E5484D',
  blue: '#2F7CF6',
  earRight: '#E5484D',
  earLeft: '#2F7CF6',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export type Gradient = readonly [string, string];
export const gradients = {
  brand: ['#6C4CF1', '#14A39E'] as Gradient,
  violet: ['#7C5CFF', '#5B3DF5'] as Gradient,
  sunset: ['#F0567A', '#F59E0B'] as Gradient,
  ocean: ['#2F7CF6', '#14A39E'] as Gradient,
  mint: ['#16A34A', '#14A39E'] as Gradient,
  ember: ['#E5484D', '#F97316'] as Gradient,
  night: ['#2B3150', '#1B2040'] as Gradient,
  rose: ['#EC4899', '#7C5CFF'] as Gradient,
  gold: ['#F59E0B', '#F97316'] as Gradient,
} as const;

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8, lineHeight: 38 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '700' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.6, lineHeight: 14, textTransform: 'uppercase' as const },
  mono: { fontSize: 13, fontWeight: '600' as const, fontVariant: ['tabular-nums'] as const },
} as const;

export const shadow = {
  glow: (color: string) => ({
    shadowColor: color,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  }),
  card: {
    shadowColor: '#13162A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
} as const;
