import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import type { Pad as PadT } from '../logic';

type Props = { pad: PadT; lit: boolean; enabled: boolean; onTap: (id: number) => void };

/** Tek bir renkli pad: yanınca parlar ve hafifçe büyür. Etiket solfej (Do, Re, … Do'). */
export function Pad({ pad, lit, enabled, onTap }: Props) {
  const op = useSharedValue(0.45);
  const sc = useSharedValue(1);
  useEffect(() => {
    op.value = withTiming(lit ? 1 : 0.45, { duration: lit ? 40 : 160 });
    sc.value = withTiming(lit ? 1.06 : 1, { duration: lit ? 60 : 160 });
  }, [lit, op, sc]);
  const style = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ scale: sc.value }] }));
  return (
    <Pressable style={styles.cell} onPressIn={() => { if (enabled) onTap(pad.id); }} disabled={!enabled} hitSlop={2}>
      <Animated.View style={[styles.pad, { backgroundColor: pad.color, borderColor: lit ? colors.white : 'transparent' }, style]}>
        <AppText variant="h3" color={colors.white} style={{ opacity: 0.85 }}>{pad.name}</AppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1 },
  pad: { flex: 1, borderRadius: radius.xl, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
