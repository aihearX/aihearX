import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppText, AUDIOGRAM_FREQS } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import type { Thresholds } from '../logic';

/** 6 frekans için kompakt +/- 5 dB eşik düzenleyici. */
export function ThresholdEditor({ values, color, onChange }: { values: Thresholds; color: string; onChange: (v: Thresholds) => void }) {
  const set = (i: number, d: number) => {
    const next = [...values];
    next[i] = Math.max(-10, Math.min(120, (next[i] ?? 0) + d));
    Haptics.selectionAsync().catch(() => {});
    onChange(next);
  };
  return (
    <View style={styles.grid}>
      {AUDIOGRAM_FREQS.map((f, i) => (
        <View key={f} style={styles.col}>
          <AppText variant="tiny" faint>{f >= 1000 ? `${f / 1000}k` : f}</AppText>
          <Pressable onPress={() => set(i, -5)} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}><Ionicons name="remove" size={14} color={colors.text} /></Pressable>
          <AppText variant="h3" color={color}>{values[i]}</AppText>
          <Pressable onPress={() => set(i, 5)} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}><Ionicons name="add" size={14} color={colors.text} /></Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  col: { alignItems: 'center', gap: 6, flex: 1 },
  btn: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.93 }] },
});
