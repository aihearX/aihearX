import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Card, Stat } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { MAX_GUESSES } from '../logic';
import { averageGuesses } from '../store';

type Props = { streak: number; bestStreak: number; played: number; solved: number; dist: number[]; drillBest: number; highlight?: number };

/** Seri, çözüm ve 1..6 tahmin dağılımı çubukları. */
export function StatsPanel({ streak, bestStreak, played, solved, dist, drillBest, highlight }: Props) {
  const max = Math.max(1, ...dist);
  const avg = averageGuesses(dist);
  const pct = played ? Math.round((solved / played) * 100) : 0;
  return (
    <View style={{ gap: space.md }}>
      <View style={styles.row}>
        <Stat label="Günlük seri" value={`🔥 ${streak}`} icon="flame" color={colors.amber} />
        <Stat label="En uzun seri" value={bestStreak} icon="trophy" color={colors.accent} />
        <Stat label="Çözüm" value={`%${pct}`} icon="checkmark-circle" color={colors.mint} />
      </View>
      <Card>
        <View style={styles.head}>
          <AppText variant="tiny" faint>Tahmin dağılımı</AppText>
          <AppText variant="tiny" faint>{avg != null ? `Ortalama ${avg.toLocaleString('tr-TR')} tahmin` : `${played} oynanan`}</AppText>
        </View>
        <View style={{ gap: 6, marginTop: space.sm }}>
          {Array.from({ length: MAX_GUESSES }).map((_, i) => {
            const n = dist[i] ?? 0;
            const hl = highlight === i + 1;
            return (
              <View key={i} style={styles.barRow}>
                <AppText variant="small" muted style={{ width: 14, textAlign: 'right' }}>{i + 1}</AppText>
                <View style={styles.track}>
                  <View style={[styles.bar, { width: `${Math.max(8, Math.round((n / max) * 100))}%`, backgroundColor: hl ? colors.mint : n ? colors.accent : colors.surfaceStrong }]}>
                    <AppText variant="tiny" color={n || hl ? colors.white : colors.textFaint}>{n}</AppText>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        {drillBest > 0 ? <AppText variant="tiny" faint style={{ marginTop: space.md }}>Antrenman rekoru: {drillBest.toLocaleString('tr-TR')} puan</AppText> : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  track: { flex: 1 },
  bar: { height: 20, borderRadius: radius.sm, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 8 },
});
