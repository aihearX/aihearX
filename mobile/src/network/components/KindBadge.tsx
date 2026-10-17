import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import type { PostKind } from '../types';
import { KIND_LABEL } from '../types';

export const KIND_META: Record<PostKind, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  gonderi: { icon: 'chatbubble-ellipses', color: colors.accent },
  vaka: { icon: 'pulse', color: colors.coral },
  soru: { icon: 'help-circle', color: colors.amber },
  ilan: { icon: 'briefcase', color: colors.mint },
  etkinlik: { icon: 'calendar', color: colors.blue },
  basari: { icon: 'trophy', color: colors.accent2 },
};

export function KindBadge({ kind }: { kind: PostKind }) {
  const m = KIND_META[kind];
  if (kind === 'gonderi') return null;
  return (
    <View style={[styles.badge, { borderColor: m.color }]}>
      <Ionicons name={m.icon} size={11} color={m.color} />
      <AppText variant="tiny" color={m.color}>{KIND_LABEL[kind]}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
});
