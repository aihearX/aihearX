import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, ShareCard } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import { kHz, type AgeEstimate } from '../data';

type Props = { estimate: AgeEstimate; highest: number | null; shareText: string; onRetry: () => void };

export function Result({ estimate, highest, shareText, onRetry }: Props) {
  return (
    <View>
      <Animated.View entering={ZoomIn.duration(500)}>
        <Card gradient={gradients.sunset} glow={colors.coral} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
          <AppText variant="tiny" color="rgba(255,255,255,0.85)">Kulağın yaklaşık</AppText>
          <AppText color={colors.white} style={styles.huge}>{estimate.age}</AppText>
          <AppText variant="h2" color={colors.white}>yaşında · {estimate.range}</AppText>
          <AppText variant="body" color="rgba(255,255,255,0.9)" center style={{ marginTop: space.md }}>{estimate.line}</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.8)" style={{ marginTop: space.sm }}>
            {highest ? `Duyduğun en tiz ses: ${kHz(highest)}` : '8 kHz ve üzerini duymadın'}
          </AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)}>
        <Card style={{ marginTop: space.lg }}>
          <AppText variant="h3">Dürüst olalım 🙂</AppText>
          <AppText muted style={{ marginTop: 6 }}>
            Telefon hoparlörleri ve kulaklıklar tiz sesleri çok farklı verir; bazıları 14 kHz üstünü hiç çalmaz. Bu yüzden bu bir oyun, test değil. Sonuç ortam sesine, cihaza ve ses seviyesine göre değişir.
          </AppText>
          <AppText variant="small" faint style={{ marginTop: space.sm }}>Bu uygulama tıbbi tanı yerine geçmez.</AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450)}>
        <Card gradient={gradients.night} style={{ marginTop: space.lg }}>
          <AppText variant="h3">Gerçek test için bir odyoloğa git</AppText>
          <AppText muted style={{ marginTop: 4 }}>Kalibre cihazla 10 dakikada gerçek odyogramını öğrenirsin. Akışta yakınındaki uzmanları bul.</AppText>
          <Button title="Odyolog bul" icon="people" style={{ marginTop: space.md }} onPress={() => router.push('/(tabs)/akis')} />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)} style={{ marginTop: space.xl }}>
        <ShareCard
          title={`${estimate.age} yaşında 👂`}
          subtitle={`Kulağım ${estimate.range} yaş bandında. Seninki kaç?`}
          gradient={gradients.sunset}
          shareText={shareText}
          makerName={SEBAHATTIN.name}
        >
          <AppText variant="small" color="rgba(255,255,255,0.85)">{highest ? `En tiz duyduğum ses: ${kHz(highest)}` : 'Tizler artık benimle değil'}</AppText>
        </ShareCard>
      </Animated.View>

      <Button title="Tekrar oyna" variant="secondary" icon="refresh" style={{ marginTop: space.lg }} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({ huge: { fontSize: 96, fontWeight: '800', lineHeight: 104, letterSpacing: -3 } });
