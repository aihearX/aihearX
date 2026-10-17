import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Audiogram, Card } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import type { Case } from '../cases';

type Props = { c: Case; label: string };

const DIFF_NAME: Record<Case['difficulty'], string> = { 1: 'Kolay', 2: 'Orta', 3: 'Zor' };

/** Vaka adımı 1-2: anamnez kartı ve büyük odyogram + timpanogram çipleri. */
export function CaseView({ c, label }: Props) {
  const { width } = useWindowDimensions();
  const w = Math.min(420, width - 32 - space.lg * 2);
  return (
    <View style={{ gap: space.md }}>
      <Animated.View entering={FadeInDown.duration(300)}>
        <Card>
          <View style={styles.row}>
            <View style={styles.tag}><Ionicons name="person" size={12} color={colors.accent} /><AppText variant="tiny" color={colors.accent}>Anamnez</AppText></View>
            <AppText variant="tiny" faint>{label} · {DIFF_NAME[c.difficulty]} {'★'.repeat(c.difficulty)}</AppText>
          </View>
          <AppText variant="body" style={{ marginTop: space.md, lineHeight: 24 }}>{c.history}</AppText>
        </Card>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(80).duration(300)}>
        <Card>
          <View style={styles.row}>
            <View style={styles.tag}><Ionicons name="stats-chart" size={12} color={colors.accent2} /><AppText variant="tiny" color={colors.accent2}>Saf ses odyogramı</AppText></View>
            <AppText variant="tiny" faint>dB HL · maskeli</AppText>
          </View>
          <View style={{ alignItems: 'center', marginTop: space.sm }}>
            <Audiogram data={c.audiogram} width={w} height={Math.round(w * 0.74)} />
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { borderColor: colors.earRight }]} /><AppText variant="tiny" faint>Sağ O / {'<'}</AppText></View>
            <View style={styles.legendItem}><AppText variant="small" color={colors.earLeft} style={{ fontWeight: '800' }}>X</AppText><AppText variant="tiny" faint>Sol X / {'>'}</AppText></View>
            <AppText variant="tiny" faint>{'<'} {'>'} kemik yolu</AppText>
          </View>
          <View style={[styles.row, { marginTop: space.md }]}>
            <TympChip side="Sağ" color={colors.earRight} value={c.tympanogram.right} />
            <TympChip side="Sol" color={colors.earLeft} value={c.tympanogram.left} />
          </View>
        </Card>
      </Animated.View>
    </View>
  );
}

function TympChip({ side, color, value }: { side: string; color: string; value: string }) {
  return (
    <View style={styles.tymp}>
      <View style={styles.legendItem}>
        <View style={[styles.sideDot, { backgroundColor: color }]} />
        <AppText variant="tiny" faint>Timpanogram {side}</AppText>
      </View>
      <AppText variant="bodyStrong" style={{ marginTop: 2 }}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: space.lg, marginTop: space.sm, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  sideDot: { width: 8, height: 8, borderRadius: 4 },
  tymp: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.border },
});
