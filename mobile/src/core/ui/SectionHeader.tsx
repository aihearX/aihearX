import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/core/theme';
import { AppText } from './AppText';

export function SectionHeader({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <AppText variant="h2">{title}</AppText>
        {subtitle ? <AppText variant="small" muted>{subtitle}</AppText> : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} style={styles.action}>
          <AppText variant="small" color={colors.accent2}>{action}</AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.accent2} />
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: space.xl, marginBottom: space.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
});
