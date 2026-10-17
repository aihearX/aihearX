import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import type { Sounding } from '../usePairPlayer';

type Props = { sounding: Sounding; enabled: boolean; onPick: (c: 1 | 2) => void; compact?: boolean };

/** Sol/sağ iki büyük dokunma alanı: "1. ses" ve "2. ses". Çalan ton nabız atar. */
export function ToneZones({ sounding, enabled, onPick, compact }: Props) {
  return (
    <View style={[styles.row, compact && { gap: 8 }]}>
      <Zone n={1} active={sounding === 1} enabled={enabled} onPick={onPick} compact={compact} />
      <Zone n={2} active={sounding === 2} enabled={enabled} onPick={onPick} compact={compact} />
    </View>
  );
}

function Zone({ n, active, enabled, onPick, compact }: { n: 1 | 2; active: boolean; enabled: boolean; onPick: (c: 1 | 2) => void; compact?: boolean }) {
  const sc = useSharedValue(1);
  useEffect(() => {
    if (active) sc.value = withSequence(withTiming(1.04, { duration: 80 }), withTiming(1, { duration: 300 }));
  }, [active, sc]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const tint = n === 1 ? colors.accent : colors.accent2;
  return (
    <Pressable style={styles.cell} onPressIn={() => { if (enabled) onPick(n); }} disabled={!enabled}>
      {({ pressed }) => (
        <Animated.View style={[styles.zone, { borderColor: active ? tint : enabled ? colors.borderStrong : colors.border, backgroundColor: active ? (n === 1 ? colors.accentSoft : colors.accent2Soft) : enabled ? colors.bg : colors.surface, opacity: pressed ? 0.85 : 1 }, anim]}>
          <Ionicons name={active ? 'volume-high' : 'musical-note'} size={compact ? 22 : 34} color={active || enabled ? tint : colors.textFaint} />
          <AppText variant={compact ? 'h3' : 'h1'} color={enabled || active ? colors.text : colors.textFaint} style={{ marginTop: 6 }}>{n}. ses</AppText>
          {!compact ? <AppText variant="small" faint>{enabled ? 'daha tiz mi?' : active ? 'çalıyor' : ' '}</AppText> : null}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
  zone: { flex: 1, borderRadius: radius.xl, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
