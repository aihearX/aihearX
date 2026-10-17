import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, ProgressBar } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { LIVES, ROUNDS, ROUND_SECONDS, comboLabel, fmtNum } from '../logic';

type Props = { round: number; lives: number; score: number; combo: number; timeLeft: number; level: string };

/** Üst bilgi çubuğu: tur, can, puan, kombo ve süre çubuğu. */
export function Hud({ round, lives, score, combo, timeLeft, level }: Props) {
  const hearts = Array.from({ length: LIVES }, (_, i) => (i < lives ? '❤️' : '🖤')).join('');
  const label = comboLabel(combo);
  const urgent = timeLeft <= 5;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View>
          <AppText variant="tiny" faint>Tur {round}/{ROUNDS} · {level}</AppText>
          <AppText variant="h1">{fmtNum(score)}</AppText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <AppText variant="body">{hearts}</AppText>
          <View style={[styles.combo, combo >= 2 && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
            <AppText variant="small" color={combo >= 2 ? colors.text : colors.textFaint}>x{Math.max(1, combo)} {label}</AppText>
          </View>
        </View>
      </View>
      <View style={{ marginTop: space.sm }}>
        <ProgressBar value={timeLeft / ROUND_SECONDS} gradient={urgent ? gradients.ember : gradients.brand} height={6} />
        <AppText variant="tiny" color={urgent ? colors.red : colors.textFaint} style={{ marginTop: 4 }}>{timeLeft} sn</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: space.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  combo: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
});
