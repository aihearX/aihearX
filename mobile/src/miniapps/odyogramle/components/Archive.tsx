import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { CASES } from '../cases';
import type { Play } from '../store';

type Props = { archive: Record<number, Play>; todayId: number; onPick: (id: number) => void };

/** Arşiv listesi: günün vakası hariç tüm vakalar, çözülme durumu ile. */
export function Archive({ archive, todayId, onPick }: Props) {
  return (
    <View style={{ gap: 6 }}>
      {CASES.filter((c) => c.id !== todayId).map((c) => {
        const p = archive[c.id];
        const icon = p?.done ? (p.solved ? 'checkmark-circle' : 'close-circle') : 'play-circle';
        const color = p?.done ? (p.solved ? colors.mint : colors.red) : colors.accent2;
        return (
          <Pressable key={c.id} onPress={() => onPick(c.id)} style={styles.item}>
            <Ionicons name={icon} size={22} color={color} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">Vaka #{c.id} · {'★'.repeat(c.difficulty)}</AppText>
              <AppText variant="tiny" faint numberOfLines={1}>{c.history}</AppText>
            </View>
            <AppText variant="tiny" faint>{p?.done ? `${p.solved ? p.guesses.length : 'X'}/6` : 'Oyna'}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
