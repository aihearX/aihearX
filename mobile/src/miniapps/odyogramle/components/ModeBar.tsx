import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius, shadow } from '@/core/theme';

export type Mode = 'daily' | 'archive' | 'drill';

const ITEMS: { mode: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'daily', label: 'Günün Vakası', icon: 'calendar' },
  { mode: 'archive', label: 'Arşiv', icon: 'albums' },
  { mode: 'drill', label: 'Antrenman', icon: 'barbell' },
];

/** Üç mod arasında geçiş: segment kontrolü. */
export function ModeBar({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <View style={styles.wrap}>
      {ITEMS.map((it) => {
        const active = it.mode === mode;
        return (
          <Pressable key={it.mode} onPress={() => onChange(it.mode)} style={[styles.seg, active && styles.segActive]}>
            <Ionicons name={it.icon} size={14} color={active ? colors.accent : colors.textFaint} />
            <AppText variant="small" color={active ? colors.text : colors.textMuted} numberOfLines={1}>{it.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, padding: 4, gap: 4 },
  seg: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: radius.pill },
  segActive: { backgroundColor: colors.bg, ...shadow.card },
});
