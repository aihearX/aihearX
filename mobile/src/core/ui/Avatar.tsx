import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, colors, type Gradient } from '@/core/theme';
import { AppText } from './AppText';

const palette: Gradient[] = [gradients.brand, gradients.sunset, gradients.ocean, gradients.mint, gradients.rose, gradients.gold, gradients.violet];
export function gradientFor(seed: string): Gradient {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length]!;
}

export function Avatar({ name, size = 40, seed, ring }: { name: string; size?: number; seed?: string; ring?: boolean }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  const g = gradientFor(seed ?? name);
  return (
    <View style={ring ? { padding: 2, borderRadius: size, borderWidth: 2, borderColor: colors.accent2 } : undefined}>
      <LinearGradient colors={[...g]} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="bodyStrong" color={colors.white} style={{ fontSize: size * 0.38 }}>{initials}</AppText>
      </LinearGradient>
    </View>
  );
}
