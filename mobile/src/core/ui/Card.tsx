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
  const glowStyle = glow ? { shadowColor: glow, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 } : undefined;
  if (!onPress) return <View style={glowStyle}>{inner}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [glowStyle, { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.92 : 1 }]}>
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  padded: { padding: space.lg },
});
