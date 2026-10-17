import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Card } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { fmtNum, type UniRow } from '../logic';

const medal = (r: number) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `${r}.`);

/** Üniversite ligi tablosu: ilk 10 + kullanıcının takımı. */
export function LeagueTable({ rows }: { rows: UniRow[] }) {
  const mine = rows.find((r) => r.you);
  const shown = rows.slice(0, 10);
  const extra = mine && mine.rank > 10 ? mine : null;
  return (
    <Card padded={false}>
      {shown.map((r, i) => <Row key={r.name} r={r} i={i} />)}
      {extra ? (<><View style={styles.dots}><AppText variant="tiny" faint>···</AppText></View><Row r={extra} i={10} /></>) : null}
    </Card>
  );
}

function Row({ r, i }: { r: UniRow; i: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(i * 30)} style={[styles.row, r.you && styles.you]}>
      <AppText variant="bodyStrong" style={{ width: 34 }}>{medal(r.rank)}</AppText>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1} color={r.you ? colors.accent2 : colors.text}>{r.name}{r.you ? ' · sen' : ''}</AppText>
        <AppText variant="tiny" faint>{r.members} oyuncu</AppText>
      </View>
      <AppText variant="mono">{fmtNum(r.points)}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  you: { backgroundColor: colors.accent2Soft, borderRadius: radius.md },
  dots: { alignItems: 'center', paddingVertical: 4 },
});
