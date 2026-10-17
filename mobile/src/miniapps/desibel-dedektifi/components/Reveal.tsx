import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Card } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { safeExposure, type SoundItem } from '../data';

type Props = { item: SoundItem; guess: number; gained: number };

/** Cevap sonrası: gerçek değer, fark ve güvenli maruziyet süresi. */
export function Reveal({ item, guess, gained }: Props) {
  const diff = Math.abs(guess - item.db);
  const tone = diff <= 5 ? colors.mint : diff <= 15 ? colors.amber : colors.red;
  const verdict = diff <= 5 ? 'Tam isabet!' : diff <= 10 ? 'Çok yakın' : diff <= 20 ? 'Yaklaştın' : 'Uzak kaldın';
  return (
    <Animated.View entering={FadeInDown}>
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText variant="tiny" faint>Gerçek değer</AppText>
            <AppText variant="h1" color={tone}>{item.db} dB</AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="tiny" faint>Senin tahminin</AppText>
            <AppText variant="h2">{guess} dB</AppText>
            <AppText variant="small" color={tone}>{verdict} · {diff === 0 ? 'fark yok' : `${diff} dB fark`} · +{gained}</AppText>
          </View>
        </View>
        <View style={styles.fact}>
          <AppText variant="tiny" faint>Güvenli maruziyet süresi (NIOSH)</AppText>
          <AppText variant="bodyStrong">⏱️ {safeExposure(item.db)}</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>{item.note ?? 'Kural: 85 dB için 8 saat; her +3 dB süreyi yarıya indirir.'}</AppText>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  fact: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.border },
});
