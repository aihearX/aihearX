import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { LATERALITY_NAME, dxByKey } from '../diagnoses';
import { MARK_HINT, MAX_GUESSES, type Guess, type Mark } from '../logic';

const BG: Record<Mark, string> = { green: colors.mint, orange: colors.coral, yellow: colors.amber, gray: 'rgba(255,255,255,0.14)' };

/** Yapılan tahminler, renk kodlu. */
export function GuessRows({ guesses }: { guesses: Guess[] }) {
  if (guesses.length === 0) return null;
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="tiny" faint>Tahminler · {MAX_GUESSES - guesses.length} hak kaldı</AppText>
      {guesses.map((g, i) => (
        <Animated.View key={`${g.dx}-${i}`} entering={FadeInLeft} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: BG[g.mark] }]} />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">{dxByKey(g.dx)?.name ?? g.dx} · {LATERALITY_NAME[g.lat]}</AppText>
            <AppText variant="tiny" faint>{MARK_HINT[g.mark]}</AppText>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dot: { width: 14, height: 14, borderRadius: 4 },
});
