import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Pressable, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';

type Props = { label: string; value: number; min: number; max: number; step: number; unit: string; color?: string; onChange: (v: number) => void; format?: (v: number) => string };

/** Bağımlılıksız kaydırıcı: sürükle veya +/- bas. */
export function Slider({ label, value, min, max, step, unit, color = colors.accent2, onChange, format }: Props) {
  const [w, setW] = useState(1);
  const wRef = useRef(1);
  const valRef = useRef(value);
  valRef.current = value;
  const startRef = useRef(value);
  const quant = (v: number) => Math.max(min, Math.min(max, Math.round(v / step) * step));
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / wRef.current));
        const v = quant(min + ratio * (max - min));
        startRef.current = v;
        if (v !== valRef.current) onChange(v);
      },
      onPanResponderMove: (_e, g) => {
        const v = quant(startRef.current + (g.dx / wRef.current) * (max - min));
        if (v !== valRef.current) { onChange(v); }
      },
      onPanResponderRelease: () => { Haptics.selectionAsync().catch(() => {}); },
    }),
  ).current;
  const onLayout = (e: LayoutChangeEvent) => { const lw = e.nativeEvent.layout.width; setW(lw); wRef.current = lw; };
  const pct = (value - min) / (max - min);
  const fmt = format ?? ((v: number) => (Number.isInteger(step) ? `${v}` : v.toFixed(step < 0.1 ? 2 : 1)));
  const nudge = (d: number) => { const v = quant(value + d * step); if (v !== value) { Haptics.selectionAsync().catch(() => {}); onChange(v); } };

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AppText variant="small" muted style={{ flex: 1 }}>{label}</AppText>
        <AppText variant="h3" color={color}>{fmt(value)} <AppText variant="tiny" faint>{unit}</AppText></AppText>
      </View>
      <View style={styles.row}>
        <Pressable onPress={() => nudge(-1)} style={styles.btn}><Ionicons name="remove" size={16} color={colors.text} /></Pressable>
        <View style={styles.trackWrap} onLayout={onLayout} {...pan.panHandlers}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: pct * w, backgroundColor: color }]} />
          </View>
          <View style={[styles.thumb, { left: pct * w - 11, borderColor: color }]} />
        </View>
        <Pressable onPress={() => nudge(1)} style={styles.btn}><Ionicons name="add" size={16} color={colors.text} /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, paddingVertical: 4 },
  head: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  trackWrap: { flex: 1, height: 36, justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceStrong, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  thumb: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg3, borderWidth: 3 },
});
