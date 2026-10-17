import React, { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, ShareCard, Stat } from '@/core/ui';
import { colors, space, type Gradient } from '@/core/theme';
import { rankFor, nextRank } from './ranks';
import { sfx } from './sfx';

type Props = {
  title: string;
  score: number;
  /** skor / mümkün en yüksek (0-1); rütbe için */
  ratio: number;
  best?: number;
  stats?: { label: string; value: string | number }[];
  gradient: Gradient;
  shareText: string;
  makerName?: string;
  onReplay: () => void;
  extra?: React.ReactNode;
  children?: React.ReactNode;
};

/** Oyun sonu ekranı: rütbe, skor, istatistik, paylaşım kartı, tekrar oyna. */
export function GameResult({ title, score, ratio, best, stats, gradient, shareText, makerName, onReplay, extra, children }: Props) {
  const rank = rankFor(ratio);
  const next = nextRank(ratio);
  const isBest = typeof best === 'number' && score >= best && score > 0;
  useEffect(() => { sfx(ratio >= 0.5 ? 'levelUp' : 'gameOver'); }, [ratio]);
  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={ZoomIn.duration(350)} style={{ alignItems: 'center', marginTop: space.md }}>
        <AppText style={{ fontSize: 64, lineHeight: 76 }}>{rank.emoji}</AppText>
        <AppText variant="h1" center>{rank.name}</AppText>
        <AppText variant="small" muted center>{next ? `Sonraki rütbe: ${next.name} (%${Math.round(next.min * 100)})` : 'En yüksek rütbe. Tebrikler.'}</AppText>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(150)} style={{ alignItems: 'center', marginTop: space.lg }}>
        <AppText variant="tiny" faint>{title}</AppText>
        <AppText variant="display" style={{ fontSize: 56, lineHeight: 64 }}>{score.toLocaleString('tr-TR')}</AppText>
        {isBest ? <AppText variant="small" color={colors.amber}>🎉 Yeni rekor</AppText> : typeof best === 'number' ? <AppText variant="small" muted>Rekorun: {best.toLocaleString('tr-TR')}</AppText> : null}
      </Animated.View>
      {stats?.length ? (
        <Animated.View entering={FadeInDown.delay(250)} style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
          {stats.map((s) => <Stat key={s.label} label={s.label} value={s.value} />)}
        </Animated.View>
      ) : null}
      {children ? <Animated.View entering={FadeInDown.delay(300)} style={{ marginTop: space.lg }}>{children}</Animated.View> : null}
      <Animated.View entering={FadeInDown.delay(350)} style={{ marginTop: space.lg }}>
        <ShareCard title={`${rank.emoji} ${rank.name}`} subtitle={`${title} · ${score.toLocaleString('tr-TR')} puan`} gradient={gradient} shareText={shareText} makerName={makerName} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(420)} style={{ marginTop: space.lg, gap: 10 }}>
        <Button title="Tekrar Oyna" icon="refresh" size="lg" gradient={gradient} onPress={onReplay} />
        {extra}
      </Animated.View>
      <Card style={{ marginTop: space.lg }}><AppText variant="tiny" faint center>Oyundur, işitme testi değildir. Ses göreli, kalibre değil.</AppText></Card>
    </ScrollView>
  );
}
