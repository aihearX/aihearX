import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Card, ProgressBar } from '@/core/ui';
import { gradients, space } from '@/core/theme';
import { BUCKETS, KIND_LABEL, distribution, type Trial } from '../logic';

/** Tepki süresi dağılımı (yalnızca doğru yanıtlar) ve deneme özetleri. */
export function Distribution({ trials }: { trials: Trial[] }) {
  const dist = distribution(trials);
  const max = Math.max(1, ...dist);
  const kinds = (['hit', 'wrong', 'early', 'miss'] as const).map((k) => ({ k, n: trials.filter((t) => t.kind === k).length }));
  return (
    <Card>
      <AppText variant="bodyStrong">Tepki süresi dağılımı (ms)</AppText>
      <View style={{ gap: space.sm, marginTop: space.md }}>
        {BUCKETS.map((b, i) => (
          <View key={b.label} style={styles.row}>
            <AppText variant="small" muted style={{ width: 64 }}>{b.label}</AppText>
            <View style={{ flex: 1 }}><ProgressBar value={(dist[i] ?? 0) / max} gradient={i <= 1 ? gradients.mint : i === 2 ? gradients.ocean : gradients.sunset} height={10} /></View>
            <AppText variant="mono" style={{ width: 24, textAlign: 'right' }}>{dist[i] ?? 0}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.kinds}>
        {kinds.map(({ k, n }) => <AppText key={k} variant="tiny" faint>{KIND_LABEL[k]}: {n}</AppText>)}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.md },
});
