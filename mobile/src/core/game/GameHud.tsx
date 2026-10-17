import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, ProgressBar } from '@/core/ui';
import { colors, gradients, radius } from '@/core/theme';

type Props = { score: number; lives?: number; maxLives?: number; combo?: number; round?: number; totalRounds?: number; timerPct?: number; timerLabel?: string; level?: number };

/** Oyun üst çubuğu: skor, can, kombo, tur, süre. Tüm oyunlarda aynı. */
export function GameHud({ score, lives, maxLives = 3, combo, round, totalRounds, timerPct, timerLabel, level }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View>
          <AppText variant="tiny" faint>Skor</AppText>
          <AppText variant="h2" style={{ fontVariant: ['tabular-nums'] }}>{score.toLocaleString('tr-TR')}</AppText>
        </View>
        {typeof combo === 'number' && combo > 1 ? (
          <View style={styles.combo}><AppText variant="small" color={colors.white}>x{combo} kombo</AppText></View>
        ) : null}
        <View style={{ flex: 1 }} />
        {typeof level === 'number' ? <AppText variant="small" muted style={{ marginRight: 10 }}>Seviye {level}</AppText> : null}
        {typeof round === 'number' && totalRounds ? <AppText variant="small" muted style={{ marginRight: 10 }}>{round}/{totalRounds}</AppText> : null}
        {typeof lives === 'number' ? (
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {Array.from({ length: maxLives }).map((_, i) => <Ionicons key={i} name={i < lives ? 'heart' : 'heart-outline'} size={18} color={i < lives ? colors.coral : colors.borderStrong} />)}
          </View>
        ) : null}
      </View>
      {typeof timerPct === 'number' ? (
        <View style={{ marginTop: 8 }}>
          <ProgressBar value={timerPct} height={6} gradient={timerPct < 0.25 ? gradients.ember : gradients.brand} />
          {timerLabel ? <AppText variant="tiny" faint style={{ marginTop: 4 }}>{timerLabel}</AppText> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  combo: { backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
});
