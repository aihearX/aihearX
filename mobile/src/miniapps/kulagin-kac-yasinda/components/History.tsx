import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { AppText, Card } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { kHz } from '../data';
import { fmtDate, type EarAgeEntry } from '../store';

const H = 90;

/** Geçmiş sonuçlar: trend çizgisi (eskiden yeniye) + son kayıtlar. */
export function History({ history }: { history: EarAgeEntry[] }) {
  const { width } = useWindowDimensions();
  // sayfa (16) + kart (16) iç boşlukları düşülür; en az 200
  const W = Math.max(200, width - 2 * space.lg - 2 * space.lg);
  if (!history.length) return null;
  const series = history.slice(0, 8).reverse();
  const ages = series.map((e) => e.age);
  const lo = Math.min(...ages) - 3;
  const hi = Math.max(...ages) + 3;
  const x = (i: number) => (series.length === 1 ? W / 2 : 14 + (i * (W - 28)) / (series.length - 1));
  const y = (a: number) => 10 + ((hi - a) / (hi - lo)) * (H - 20);
  const pts = series.map((e, i) => `${x(i)},${y(e.age)}`).join(' ');
  const last = series[series.length - 1]!;

  return (
    <Card style={{ marginTop: space.lg }}>
      <AppText variant="h3">Geçmişin</AppText>
      <AppText variant="small" muted style={{ marginTop: 2 }}>{series.length > 1 ? 'Son sonuçlarının seyri (kulak yaşı, düşük = daha genç).' : 'İlk kaydın. Bir sonraki denemede çizgi oluşur.'}</AppText>
      <View style={{ marginTop: space.md }}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Line x1={0} y1={H - 10} x2={W} y2={H - 10} stroke={colors.border} strokeWidth={1} />
          <Line x1={0} y1={10} x2={W} y2={10} stroke={colors.border} strokeWidth={1} strokeDasharray="4 4" />
          {series.length > 1 ? <Polyline points={pts} fill="none" stroke={colors.coral} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" /> : null}
          {series.map((e, i) => <Circle key={e.id} cx={x(i)} cy={y(e.age)} r={i === series.length - 1 ? 6 : 4} fill={e.lowConfidence ? colors.amber : colors.coral} stroke={colors.white} strokeWidth={2} />)}
        </Svg>
        <View style={styles.axis}>
          <AppText variant="tiny" faint>{fmtDate(series[0]!.at)}</AppText>
          <AppText variant="tiny" faint>{fmtDate(last.at)}</AppText>
        </View>
      </View>
      <View style={{ marginTop: space.sm, gap: 6 }}>
        {history.slice(0, 5).map((e) => (
          <View key={e.id} style={styles.row}>
            <AppText variant="small" muted style={{ width: 86 }}>{fmtDate(e.at)}</AppText>
            <AppText variant="bodyStrong" style={{ width: 64 }}>{e.age} yaş</AppText>
            <AppText variant="small" muted style={{ flex: 1 }}>{e.highest ? `en tiz ${kHz(e.highest)}` : 'tiz duyulmadı'}</AppText>
            {e.lowConfidence ? <AppText variant="tiny" color={colors.amber}>düşük güven</AppText> : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, borderTopWidth: 1, borderTopColor: colors.border },
});
