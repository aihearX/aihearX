import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { MAX_DB, MIN_DB, STEP } from '../data';

type Props = { value: number; onChange: (v: number) => void; disabled?: boolean };

const STEPS = Array.from({ length: (MAX_DB - MIN_DB) / STEP + 1 }, (_, i) => MIN_DB + i * STEP);

function colorFor(db: number): string {
  if (db < 70) return colors.mint;
  if (db < 85) return colors.accent2;
  if (db < 100) return colors.amber;
  if (db < 120) return colors.coral;
  return colors.red;
}

/** Pressable segmentlerden kurulu "kaydırıcı": 0-150 dB, 5'er adım; yanında -/+ düğmeleri. */
export function DbPicker({ value, onChange, disabled }: Props) {
  const set = (v: number) => {
    if (disabled) return;
    const c = Math.max(MIN_DB, Math.min(MAX_DB, v));
    if (c !== value) { Haptics.selectionAsync().catch(() => {}); onChange(c); }
  };
  const tint = colorFor(value);
  return (
    <View>
      <View style={styles.readout}>
        <Pressable onPress={() => set(value - STEP)} disabled={disabled} style={styles.stepBtn}><Ionicons name="remove" size={22} color={colors.text} /></Pressable>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <AppText variant="display" color={tint}>{value}</AppText>
          <AppText variant="tiny" faint>dB SPL</AppText>
        </View>
        <Pressable onPress={() => set(value + STEP)} disabled={disabled} style={styles.stepBtn}><Ionicons name="add" size={22} color={colors.text} /></Pressable>
      </View>
      <View style={styles.track}>
        {STEPS.map((s) => (
          <Pressable key={s} onPress={() => set(s)} disabled={disabled} hitSlop={{ top: 10, bottom: 10 }} style={styles.segWrap}>
            <View style={[styles.seg, s <= value && { backgroundColor: tint }, s === value && styles.active]} />
          </Pressable>
        ))}
      </View>
      <View style={styles.labels}>
        {[0, 30, 60, 90, 120, 150].map((l) => <AppText key={l} variant="tiny" faint>{l}</AppText>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { flexDirection: 'row', alignItems: 'center', marginBottom: space.md },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  track: { flexDirection: 'row', height: 36, alignItems: 'flex-end', gap: 2, backgroundColor: colors.surface, borderRadius: radius.sm, padding: 4, borderWidth: 1, borderColor: colors.border },
  segWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  seg: { height: 12, borderRadius: 2, backgroundColor: colors.surfaceStrong },
  active: { height: 28 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 2 },
});
