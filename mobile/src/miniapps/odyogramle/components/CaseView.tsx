import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Audiogram, Card } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import type { Case } from '../cases';
import { HINT_TITLES } from '../logic';

type Props = { c: Case; unlockedHints: number; label: string };

const HINT_ICONS = ['pulse', 'chatbubble-ellipses', 'radio', 'analytics', 'scan'] as const;

/** Vaka kartı: öykü, odyogram, timpanogram ve açılan ipuçları. */
export function CaseView({ c, unlockedHints, label }: Props) {
  const { width } = useWindowDimensions();
  const w = Math.min(380, width - 32 - space.lg * 2);
  return (
    <View style={{ gap: space.md }}>
      <Card>
        <View style={styles.row}>
          <AppText variant="tiny" faint>{label}</AppText>
          <AppText variant="tiny" faint>Zorluk {'★'.repeat(c.difficulty)}{'☆'.repeat(3 - c.difficulty)}</AppText>
        </View>
        <AppText variant="body" style={{ marginTop: space.sm }}>{c.history}</AppText>
      </Card>
      <Card>
        <AppText variant="tiny" faint style={{ marginBottom: space.sm }}>Saf ses odyogramı · 🔴 sağ O / 🔵 sol X · {'<'} {'>'} kemik yolu</AppText>
        <View style={{ alignItems: 'center' }}>
          <Audiogram data={c.audiogram} width={w} height={Math.round(w * 0.78)} />
        </View>
        <View style={[styles.row, { marginTop: space.sm }]}>
          <View style={styles.tymp}><AppText variant="tiny" color={colors.earRight}>Timp. sağ</AppText><AppText variant="small">{c.tympanogram.right}</AppText></View>
          <View style={styles.tymp}><AppText variant="tiny" color={colors.earLeft}>Timp. sol</AppText><AppText variant="small">{c.tympanogram.left}</AppText></View>
        </View>
      </Card>
      <View style={{ gap: space.sm }}>
        {HINT_TITLES.map((t, i) => {
          const open = i < unlockedHints;
          return (
            <Animated.View key={t} entering={FadeInDown.delay(i * 40)} style={[styles.hint, open && styles.hintOpen]}>
              <Ionicons name={open ? HINT_ICONS[i] : 'lock-closed'} size={16} color={open ? colors.accent2 : colors.textFaint} />
              <View style={{ flex: 1 }}>
                <AppText variant="tiny" faint>{i + 1}. {t}</AppText>
                {open ? <AppText variant="small">{c.hints[i]}</AppText> : <AppText variant="small" faint>Yanlış tahminle açılır</AppText>}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  tymp: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, padding: space.sm, borderWidth: 1, borderColor: colors.border },
  hint: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: 0.7 },
  hintOpen: { opacity: 1, borderColor: colors.accent2Soft, backgroundColor: colors.accent2Soft },
});
