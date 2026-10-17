import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors } from '@/core/theme';

/** Üstte geri oku + başlık; sağda isteğe bağlı eylem. */
export function BackBar({ title, subtitle, right }: { title?: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/akis'))} hitSlop={10} style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <View style={{ flex: 1 }}>
        {title ? <AppText variant="h2" numberOfLines={1}>{title}</AppText> : null}
        {subtitle ? <AppText variant="small" muted numberOfLines={1}>{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
});
