import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import type { Ear } from '../logic';

type Props = { onTap: (ear: Ear) => void; flash: Ear | null; flashColor: string };

/** İki büyük pad: sol mavi, sağ kırmızı (odyoloji geleneği). */
export function Pads({ onTap, flash, flashColor }: Props) {
  return (
    <View style={styles.row}>
      {(['left', 'right'] as const).map((ear) => {
        const base = ear === 'left' ? colors.earLeft : colors.earRight;
        const lit = flash === ear;
        return (
          <Pressable
            key={ear}
            onPressIn={() => onTap(ear)}
            style={({ pressed }) => [styles.pad, { borderColor: base, backgroundColor: lit ? flashColor : pressed ? `${base}33` : `${base}14` }]}
          >
            <Ionicons name={ear === 'left' ? 'arrow-back' : 'arrow-forward'} size={36} color={base} />
            <AppText variant="h2" color={base}>{ear === 'left' ? 'SOL' : 'SAĞ'}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', gap: space.md },
  pad: { flex: 1, borderRadius: radius.xl, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 260 },
});
