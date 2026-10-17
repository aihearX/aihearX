import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/core/theme';
import { AppText } from './AppText';

export function Stat({ label, value, icon, color = colors.accent2 }: { label: string; value: string | number; icon?: keyof typeof Ionicons.glyphMap; color?: string }) {
  return (
    <View style={styles.box}>
      {icon ? <Ionicons name={icon} size={16} color={color} /> : null}
      <AppText variant="h2" style={{ marginTop: 4 }}>{value}</AppText>
      <AppText variant="tiny" faint>{label}</AppText>
    </View>
  );
}
const styles = StyleSheet.create({ box: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12 } });
