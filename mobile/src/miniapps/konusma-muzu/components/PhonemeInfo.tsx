import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Card, Chip } from '@/core/ui';
import { colors, space } from '@/core/theme';
import type { Phoneme } from '../data';

export function PhonemeInfo({ phoneme, lost }: { phoneme: Phoneme | null; lost: boolean }) {
  if (!phoneme) {
    return (
      <Card style={{ marginTop: space.md }}>
        <AppText variant="h3">Bir harfe dokun 👆</AppText>
        <AppText muted style={{ marginTop: 4 }}>Sarı muz, konuşma seslerinin odyogramda yaşadığı bölge. Solda kalın sesler, sağda tizler; yukarı çıktıkça ses daha sessiz.</AppText>
      </Card>
    );
  }
  return (
    <Animated.View key={phoneme.id} entering={FadeInDown.duration(300)}>
      <Card style={{ marginTop: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AppText variant="h1" color={lost ? colors.textFaint : colors.amber}>{phoneme.label}</AppText>
          <Chip label={`${phoneme.freq >= 1000 ? `${(phoneme.freq / 1000).toFixed(1)} kHz` : `${phoneme.freq} Hz`} · ${phoneme.db} dB`} small />
          {lost ? <Chip label="Kayboldu" small active color={colors.red} /> : <Chip label="Duyuluyor" small active color={colors.mint} />}
        </View>
        <AppText style={{ marginTop: space.sm }}>{phoneme.what}</AppText>
        <AppText variant="tiny" faint style={{ marginTop: space.md }}>Bu sesi kaybedince ne olur</AppText>
        <AppText muted style={{ marginTop: 2 }}>{phoneme.lost}</AppText>
      </Card>
    </Animated.View>
  );
}
