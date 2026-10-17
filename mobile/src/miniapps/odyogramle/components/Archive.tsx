import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Chip } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { CASES } from '../cases';
import { CATEGORY_NAME } from '../diagnoses';
import type { Play } from '../store';

type Props = { archive: Record<number, Play>; todayId: number; onPick: (id: number) => void };
type Filter = 'all' | 'open' | 'done';

/** Arşiv listesi: günün vakası hariç tüm vakalar, çözülme durumu ile. */
export function Archive({ archive, todayId, onPick }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [diff, setDiff] = useState<0 | 1 | 2 | 3>(0);
  const list = useMemo(() => CASES.filter((c) => c.id !== todayId).filter((c) => (diff ? c.difficulty === diff : true)).filter((c) => {
    const p = archive[c.id];
    return filter === 'all' ? true : filter === 'done' ? !!p?.done : !p?.done;
  }), [archive, diff, filter, todayId]);
  const doneCount = CASES.filter((c) => archive[c.id]?.done).length;

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.filters}>
        <Chip label="Tümü" small active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Çözülmemiş" small active={filter === 'open'} onPress={() => setFilter('open')} icon="play-circle" color={colors.accent2} />
        <Chip label="Bitenler" small active={filter === 'done'} onPress={() => setFilter('done')} icon="checkmark-done" color={colors.mint} />
      </View>
      <View style={styles.filters}>
        {([0, 1, 2, 3] as const).map((d) => (
          <Chip key={d} label={d === 0 ? 'Her zorluk' : '★'.repeat(d)} small active={diff === d} onPress={() => setDiff(d)} color={colors.amber} />
        ))}
        <View style={{ flex: 1 }} />
        <AppText variant="tiny" faint>{doneCount}/{CASES.length} bitti</AppText>
      </View>
      {list.length === 0 ? <AppText variant="small" faint center style={{ padding: space.lg }}>Bu filtrede vaka yok.</AppText> : null}
      {list.map((c, i) => {
        const p = archive[c.id];
        const icon = p?.done ? (p.solved ? 'checkmark-circle' : 'close-circle') : 'play-circle';
        const color = p?.done ? (p.solved ? colors.mint : colors.red) : colors.accent2;
        return (
          <Animated.View key={c.id} entering={FadeInDown.delay(Math.min(i, 8) * 30)}>
            <Pressable onPress={() => onPick(c.id)} style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}>
              <Ionicons name={icon} size={22} color={color} />
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <AppText variant="bodyStrong">Vaka #{c.id}</AppText>
                  <AppText variant="tiny" color={colors.amber}>{'★'.repeat(c.difficulty)}</AppText>
                  {p?.done ? <AppText variant="tiny" faint>· {CATEGORY_NAME[c.category]}</AppText> : null}
                </View>
                <AppText variant="small" muted numberOfLines={1}>{c.history}</AppText>
              </View>
              <AppText variant="small" color={p?.done ? color : colors.textFaint}>{p?.done ? `${p.solved ? p.guesses.length : 'X'}/6` : 'Oyna'}</AppText>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
