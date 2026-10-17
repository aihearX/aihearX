import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';

type Props = { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; color?: string; unit?: string };

/** +/- adımlı sayı girişi (dB için 5'er adım). */
export function Stepper({ label, value, onChange, min = -10, max = 120, step = 5, color = colors.accent2, unit = 'dB' }: Props) {
  const set = (v: number) => {
    const n = Math.max(min, Math.min(max, v));
    if (n !== value) { Haptics.selectionAsync().catch(() => {}); onChange(n); }
  };
  return (
    <View style={styles.row}>
      <AppText variant="small" muted style={{ flex: 1 }}>{label}</AppText>
      <Pressable onPress={() => set(value - step)} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}><Ionicons name="remove" size={18} color={colors.text} /></Pressable>
      <View style={styles.valueBox}>
        <AppText variant="h3" color={color}>{value}</AppText>
        <AppText variant="tiny" faint>{unit}</AppText>
      </View>
      <Pressable onPress={() => set(value + step)} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}><Ionicons name="add" size={18} color={colors.text} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  btn: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  valueBox: { width: 58, alignItems: 'center' },
});
