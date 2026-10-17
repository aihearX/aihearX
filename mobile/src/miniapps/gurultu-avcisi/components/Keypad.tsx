import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';

type Props = { value: number[]; onDigit: (d: number) => void; onBackspace: () => void; disabled?: boolean };

const ROWS: (number | 'back' | null)[][] = [[1, 2, 3], [4, 5, 6], [7, 8, 9], ['back', 0, null]];

/** Üç kutu + büyük sayısal tuş takımı. */
export function Keypad({ value, onDigit, onBackspace, disabled }: Props) {
  return (
    <View>
      <View style={styles.slots}>
        {[0, 1, 2].map((i) => {
          const d = value[i];
          const active = !disabled && value.length === i;
          return (
            <View key={i} style={[styles.slot, active && styles.slotActive, typeof d === 'number' && styles.slotFilled]}>
              <AppText variant="display" color={typeof d === 'number' ? colors.white : colors.textFaint} style={{ fontSize: 36, lineHeight: 42 }}>{typeof d === 'number' ? d : '·'}</AppText>
            </View>
          );
        })}
      </View>
      <View style={styles.grid}>
        {ROWS.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((k, c) => {
              if (k === null) return <View key={c} style={styles.keySpacer} />;
              const isBack = k === 'back';
              return (
                <Pressable
                  key={c}
                  disabled={disabled}
                  onPress={() => (isBack ? onBackspace() : onDigit(k))}
                  accessibilityLabel={isBack ? 'Sil' : String(k)}
                  style={({ pressed }) => [styles.key, isBack && styles.keyBack, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
                >
                  {isBack ? <Ionicons name="backspace-outline" size={26} color={colors.textMuted} /> : <AppText variant="h1" style={{ fontSize: 28 }}>{k}</AppText>}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 14 },
  slot: { width: 64, height: 72, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  slotActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  slotFilled: { borderColor: colors.accent, backgroundColor: colors.accent },
  grid: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  key: { flex: 1, height: 58, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  keyBack: { backgroundColor: colors.bg },
  keySpacer: { flex: 1 },
});
