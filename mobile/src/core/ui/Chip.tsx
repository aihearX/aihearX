import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/core/theme';
import { AppText } from './AppText';

type Props = { label: string; active?: boolean; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap; color?: string; small?: boolean };

export function Chip({ label, active, onPress, icon, color = colors.accent, small }: Props) {
  const body = (
    <View style={[styles.chip, small && styles.small, active && { backgroundColor: color, borderColor: color }]}>
      {icon ? <Ionicons name={icon} size={small ? 12 : 14} color={active ? colors.white : colors.textMuted} /> : null}
      <AppText variant="small" color={active ? colors.white : colors.textMuted} style={small && { fontSize: 12 }}>
        {label}
      </AppText>
    </View>
  );
  if (!onPress) return body;
  return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>{body}</Pressable>;
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  small: { paddingHorizontal: 9, paddingVertical: 4 },
});
