import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, space, type Gradient } from '@/core/theme';

type Props = { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; gradient?: Gradient; glow?: string; padded?: boolean };

/** Camsı kart. gradient verilirse dolu renkli kart olur. */
export function Card({ children, style, onPress, gradient, glow, padded = true }: Props) {
  const inner = gradient ? (
    <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, padded && styles.padded, { borderWidth: 0 }, style]}>
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
  );
  const glowStyle = glow ? { shadowColor: glow, shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 } : undefined;
  if (!onPress) return <View style={glowStyle}>{inner}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [glowStyle, { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.92 : 1 }]}>
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  padded: { padding: space.lg },
});
