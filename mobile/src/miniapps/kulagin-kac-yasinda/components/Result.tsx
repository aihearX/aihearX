import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, ShareCard, useToast } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import { kHz, shareTextFor, trendLine } from '../data';
import type { EarAgeEntry } from '../store';
import type { Outcome } from '../useEarAge';
import { CountUp } from './CountUp';
import { MiniLadder } from './Ladder';
import { History } from './History';

type Props = { outcome: Outcome; history: EarAgeEntry[]; onRetry: () => void };

export function Result({ outcome, history, onRetry }: Props) {
  const { estimate, badge, highest, lowConfidence, entry, previous } = outcome;
  const toast = useToast((s) => s.show);
  const shareText = shareTextFor(estimate.age);
  const challenge = async () => {
    await Clipboard.setStringAsync(`${shareText}\nSen de dene: aihearX > Kulağın Kaç Yaşında?`);
    toast('Meydan okuma metni kopyalandı', 'flash');
  };

  return (
    <View>
      <Animated.View entering={ZoomIn.duration(500)}>
        <Card gradient={gradients.sunset} glow={colors.coral} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
          <AppText variant="tiny" color="rgba(255,255,255,0.85)">Kulağın yaklaşık</AppText>
          <CountUp to={estimate.age} color={colors.white} style={styles.huge} />
          <AppText variant="h2" color={colors.white}>yaşında · {estimate.range}</AppText>
          <View style={{ marginTop: space.md }}><Chip label={`${badge.emoji} ${badge.name}`} active color="rgba(0,0,0,0.28)" /></View>
          <AppText color="rgba(255,255,255,0.92)" center style={{ marginTop: space.md }}>{estimate.line}</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.8)" style={{ marginTop: space.sm }}>
            {highest ? `Duyduğun en tiz ses: ${kHz(highest)}` : '8 kHz ve üzerini duymadın'}
          </AppText>
          {lowConfidence ? (
            <View style={styles.lowRow}>
              <Ionicons name="alert-circle" size={16} color={colors.white} />
              <AppText variant="small" color={colors.white}>Düşük güven: sessiz denemede "Duydum" dedin.</AppText>
            </View>
          ) : null}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250)}>
        <Card style={{ marginTop: space.lg }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Ionicons name="people" size={20} color={colors.accent2} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">Türkiye ortalaması için yeterli veri yok; arkadaşlarınla kıyasla.</AppText>
              <AppText variant="small" muted style={{ marginTop: 4 }}>{trendLine(estimate.age, previous)}</AppText>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350)} style={{ marginTop: space.lg }}>
        <ShareCard title={`Kulağım ${estimate.age} yaşında 👂`} subtitle={`${badge.emoji} ${badge.name} · Seninki kaç?`} gradient={gradients.sunset} shareText={shareText} makerName={SEBAHATTIN.name}>
          <MiniLadder heard={entry.heard} />
        </ShareCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(420)} style={{ marginTop: space.md, gap: 10 }}>
        <Button title="Arkadaşına meydan oku" icon="flash" size="lg" gradient={gradients.rose} onPress={challenge} />
        <Button title="Gerçek test için odyolog bul" icon="medkit" variant="secondary" onPress={() => router.push('/(tabs)/akis' as Href)} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500)}>
        <Card style={{ marginTop: space.lg }}>
          <AppText variant="h3">Dürüst olalım 🙂</AppText>
          <AppText variant="small" muted style={{ marginTop: 6 }}>
            Telefon hoparlörleri ve kulaklıklar tiz sesleri çok farklı verir; bazıları 14 kHz üstünü hiç çalmaz. Ses kalibre değil, ortam gürültüsü sonucu değiştirir. Bu bir oyun, işitme testi değil; tıbbi tanı yerine geçmez.
          </AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(560)}>
        <History history={history} />
      </Animated.View>

      <Button title="Tekrar oyna" variant="secondary" icon="refresh" style={{ marginTop: space.lg }} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  huge: { fontSize: 96, fontWeight: '800', lineHeight: 104, letterSpacing: -3 },
  lowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md, backgroundColor: 'rgba(0,0,0,0.22)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
});
