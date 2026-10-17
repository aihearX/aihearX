import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';

type Props = { correct: number; total: number; bestStreak: number; levelTitle: string; shareText: string; onAgain: () => void; onMenu: () => void };

const verdict = (ratio: number) => (ratio === 1 ? 'Kusursuz! Odyogram artık ana dilin.' : ratio >= 0.8 ? 'Çok iyi. Birkaç tur daha, 10/10 geliyor.' : ratio >= 0.5 ? 'İyi başlangıç. Açıklamaları bir daha oku, tekrar dene.' : 'Her yanlış bir ders. Tip ile başla, sonra dereceye geç.');

export function RoundResult({ correct, total, bestStreak, levelTitle, shareText, onAgain, onMenu }: Props) {
  const ratio = correct / total;
  return (
    <View style={{ gap: space.lg }}>
      <Animated.View entering={FadeInDown.springify()}>
        <ShareCard title={`${correct}/${total}`} subtitle={`Odyogram Okulu · ${levelTitle}`} gradient={ratio === 1 ? gradients.gold : gradients.ocean} shareText={shareText} makerName={SEBAHATTIN.name}>
          <AppText variant="body" color="rgba(255,255,255,0.9)">{verdict(ratio)}</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.75)" style={{ marginTop: 6 }}>En uzun seri: {bestStreak} 🔥</AppText>
        </ShareCard>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120)} style={styles.row}>
        <Stat label="Doğru" value={correct} icon="checkmark-circle" color={colors.mint} />
        <Stat label="Yanlış" value={total - correct} icon="close-circle" color={colors.red} />
        <Stat label="Seri" value={bestStreak} icon="flame" color={colors.amber} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200)}>
        <Card>
          <AppText variant="small" muted>Üretilen vakalar eğitim amaçlıdır; gerçek hasta verisi değildir ve tanı yerine geçmez.</AppText>
        </Card>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(260)} style={styles.row}>
        <Button title="Yeni Tur" icon="refresh" onPress={onAgain} style={{ flex: 1 }} />
        <Button title="Seviyeler" variant="secondary" onPress={onMenu} />
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: space.sm } });
