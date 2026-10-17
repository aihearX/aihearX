// aihearX tasarım dili: "Obsidian & Koklea"
// Koyu, derin, camsı yüzeyler; tek bir parlak marka gradyanı; sağ kulak kırmızı, sol kulak mavi (odyoloji geleneği).
export const colors = {
  bg: '#070A12',
  bg2: '#0C1120',
  bg3: '#121A2E',
  surface: 'rgba(255,255,255,0.055)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',
  text: '#F4F6FB',
  textMuted: 'rgba(244,246,251,0.64)',
  textFaint: 'rgba(244,246,251,0.40)',
  accent: '#7C5CFF',
  accentSoft: 'rgba(124,92,255,0.18)',
  accent2: '#2EE6D6',
  accent2Soft: 'rgba(46,230,214,0.16)',
  coral: '#FF6B8B',
  amber: '#FFC25C',
  mint: '#4ADE80',
  red: '#FF5C5C',
  blue: '#4C9BFF',
  earRight: '#FF5C5C',
  earLeft: '#4C9BFF',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export type Gradient = readonly [string, string];
export const gradients = {
  brand: ['#7C5CFF', '#2EE6D6'] as Gradient,
  violet: ['#8B5CF6', '#5B3DF5'] as Gradient,
  sunset: ['#FF6B8B', '#FFC25C'] as Gradient,
  ocean: ['#4C9BFF', '#2EE6D6'] as Gradient,
  mint: ['#4ADE80', '#2EE6D6'] as Gradient,
  ember: ['#FF5C5C', '#FF8C42'] as Gradient,
  night: ['#1B2440', '#0C1120'] as Gradient,
  rose: ['#F472B6', '#7C5CFF'] as Gradient,
  gold: ['#FFC25C', '#FF8C42'] as Gradient,
} as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8, lineHeight: 40 },
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
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  }),
} as const;
