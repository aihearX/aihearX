import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, type Gradient } from '@/core/theme';

export function IconBadge({ icon, gradient, size = 48 }: { icon: keyof typeof Ionicons.glyphMap; gradient: Gradient; size?: number }) {
  return (
    <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color={colors.white} />
    </LinearGradient>
  );
}
