import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import { KEY_ROWS, type Mark } from '../logic';

type Props = { states: Record<string, Mark>; onKey: (k: string) => void; onEnter: () => void; onDelete: () => void; disabled?: boolean };

const BG: Record<Mark, string> = { green: colors.mint, yellow: colors.amber, gray: 'rgba(255,255,255,0.06)' };

/** Türkçe Q klavye: ERTYUIOPĞÜ / ASDFGHJKLŞİ / ZCVBNMÖÇ + Sil / Enter. */
export function Keyboard({ states, onKey, onEnter, onDelete, disabled }: Props) {
  const { width } = useWindowDimensions();
  const gap = 4;
  const keyW = Math.floor((width - 32 - gap * 10) / 11);
  const press = (fn: () => void) => () => { if (disabled) return; Haptics.selectionAsync().catch(() => {}); fn(); };
  return (
    <View style={{ gap: 6, alignItems: 'center' }}>
      {KEY_ROWS.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap }}>
          {ri === 2 ? (
            <Pressable onPress={press(onEnter)} style={[styles.key, styles.wide, { width: keyW * 1.6 }]}>
              <Ionicons name="return-down-back" size={18} color={colors.text} />
            </Pressable>
          ) : null}
          {row.map((k) => {
            const m = states[k];
            return (
              <Pressable key={k} onPress={press(() => onKey(k))} style={({ pressed }) => [styles.key, { width: keyW }, m && { backgroundColor: BG[m], borderColor: BG[m] }, m === 'gray' && { opacity: 0.45 }, pressed && { transform: [{ scale: 0.92 }] }]}>
                <AppText variant="bodyStrong" color={m === 'green' || m === 'yellow' ? colors.bg : colors.text}>{k}</AppText>
              </Pressable>
            );
          })}
          {ri === 2 ? (
            <Pressable onPress={press(onDelete)} style={[styles.key, styles.wide, { width: keyW * 1.6 }]}>
              <Ionicons name="backspace-outline" size={18} color={colors.text} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  key: { height: 46, borderRadius: radius.sm, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  wide: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
});
