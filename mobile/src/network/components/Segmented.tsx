import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/core/ui';
import { colors, gradients, radius } from '@/core/theme';

type Option<T extends string> = { value: T; label: string };

/** İki-üç seçenekli bölümlü anahtar. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={styles.seg}>
            {active ? <LinearGradient colors={[...gradients.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /> : null}
            <AppText variant="small" color={active ? colors.white : colors.textMuted} style={{ fontWeight: '700' }}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, padding: 3 },
  seg: { paddingHorizontal: 14, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
