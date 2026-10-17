import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import type { Poll } from '../types';

/** Anket: seçenekler dokunulabilir, yüzdeler ve oy toplamı görünür. */
export function PollView({ poll, myVote, onVote }: { poll: Poll; myVote?: number; onVote: (i: number) => void }) {
  const total = poll.votes.reduce((a, b) => a + b, 0);
  return (
    <View style={{ gap: 6, marginTop: 10 }}>
      {poll.options.map((opt, i) => {
        const v = poll.votes[i] ?? 0;
        const pct = total ? Math.round((v / total) * 100) : 0;
        const mine = myVote === i;
        return (
          <Pressable key={i} onPress={() => onVote(i)} style={({ pressed }) => [styles.opt, mine && styles.mine, { opacity: pressed ? 0.85 : 1 }]}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: mine ? colors.accentSoft : colors.surfaceStrong }]} />
            <View style={styles.optRow}>
              {mine ? <Ionicons name="checkmark-circle" size={15} color={colors.accent2} /> : null}
              <AppText variant="small" color={colors.text} style={{ flex: 1 }} numberOfLines={1}>{opt}</AppText>
              <AppText variant="mono" color={mine ? colors.accent2 : colors.textMuted}>%{pct}</AppText>
            </View>
          </Pressable>
        );
      })}
      <AppText variant="tiny" faint>{total} oy{typeof myVote === 'number' ? ' · oy verdin' : ' · dokunarak oy ver'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  opt: { borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surface },
  mine: { borderColor: colors.accent },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9 },
});
