import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Avatar, Card } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { fmtNum, type PlayerRow } from '../logic';

/** İlk 20 oyuncu; kullanıcı listede değilse en altta kendi satırı. */
export function PlayerBoard({ top, you }: { top: PlayerRow[]; you: PlayerRow }) {
  const inTop = top.some((r) => r.you);
  return (
    <Card padded={false}>
      {top.map((r) => <Row key={`${r.rank}-${r.name}`} r={r} />)}
      {!inTop ? (<><View style={styles.dots}><AppText variant="tiny" faint>···</AppText></View><Row r={you} /></>) : null}
    </Card>
  );
}

function Row({ r }: { r: PlayerRow }) {
  return (
    <View style={[styles.row, r.you && styles.you]}>
      <AppText variant="mono" style={{ width: 28 }} muted>{r.rank}</AppText>
      <Avatar name={r.name} size={32} ring={r.you} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1} color={r.you ? colors.accent2 : colors.text}>{r.name}{r.you ? ' (sen)' : ''}</AppText>
        <AppText variant="tiny" faint numberOfLines={1}>{r.university}</AppText>
      </View>
      <AppText variant="mono">{fmtNum(r.points)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  you: { backgroundColor: colors.accent2Soft, borderRadius: radius.md },
  dots: { alignItems: 'center', paddingVertical: 4 },
});
