import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { LATERALITY_NAME, dxByKey } from '../diagnoses';
import { MARK_EMOJI, MARK_HINT, MAX_GUESSES, type Guess, type Mark } from '../logic';

const BG: Record<Mark, string> = { green: colors.mint, orange: colors.coral, yellow: colors.amber, gray: colors.borderStrong };

/** Adım 4: yapılan tahminler, renk kodlu; boş haklar nokta olarak görünür. */
export function GuessRows({ guesses }: { guesses: Guess[] }) {
  const left = MAX_GUESSES - guesses.length;
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.head}>
        <AppText variant="tiny" faint>Tahminler</AppText>
        <View style={styles.pips}>
          {Array.from({ length: MAX_GUESSES }).map((_, i) => {
            const g = guesses[i];
            return <View key={i} style={[styles.pip, g ? { backgroundColor: BG[g.mark] } : styles.pipEmpty]} />;
          })}
          <AppText variant="tiny" faint style={{ marginLeft: 4 }}>{left} hak</AppText>
        </View>
      </View>
      {guesses.length === 0 ? (
        <View style={styles.empty}><AppText variant="small" faint center>Henüz tahmin yok. Öyküyü ve odyogramı oku, ilk tahminini yap.</AppText></View>
      ) : null}
      {guesses.map((g, i) => (
        <Animated.View key={`${g.dx}-${i}`} entering={FadeInLeft} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: BG[g.mark] }]}><AppText variant="tiny" color={colors.white}>{i + 1}</AppText></View>
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">{dxByKey(g.dx)?.name ?? g.dx} · {LATERALITY_NAME[g.lat]}</AppText>
            <AppText variant="tiny" faint>{MARK_EMOJI[g.mark]} {MARK_HINT[g.mark]}</AppText>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pips: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pip: { width: 10, height: 10, borderRadius: 3 },
  pipEmpty: { backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border },
  empty: { padding: space.md, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm, paddingHorizontal: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dot: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
});
