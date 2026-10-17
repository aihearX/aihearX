import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { DAILY_CAP, NOTES, SHUFFLE_FROM, SILENT_FROM, type Mode } from '../logic';
import type { DailyRecord } from '../store';

type Props = { bestRound: number; bestScore: number; bestLevel: number; daily: DailyRecord | null; todayKey: string; onPlay: (mode: Mode) => void };

/** Giriş: tek cümle + Oyna + Günün Dizisi + kulaklık satırı. */
export function Intro({ bestRound, bestScore, bestLevel, daily, todayKey, onPlay }: Props) {
  const dailyDone = daily?.key === todayKey;
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.violet} style={{ alignItems: 'center', paddingVertical: space.xl }}>
          <View style={styles.preview}>
            {[0, 2, 3, 5].map((id) => <View key={id} style={[styles.mini, { backgroundColor: NOTES[id]!.color }]} />)}
          </View>
          <AppText variant="h1" color={colors.white} center style={{ marginTop: space.md }}>Ton Hafızası</AppText>
          <AppText color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>Pad'ler sırayla çalar; sen aynı sırayla dokun. Her tur bir nota eklenir.</AppText>
        </Card>
        <Button title="Oyna" icon="play" size="lg" gradient={gradients.violet} style={{ marginTop: space.lg }} onPress={() => onPlay('free')} />
        <Button
          title={dailyDone ? `Günün skoru: ${daily!.score.toLocaleString('tr-TR')} · ${daily!.round} nota` : `Günün Dizisi (${DAILY_CAP} nota)`}
          icon={dailyDone ? 'checkmark-circle' : 'calendar'}
          variant="secondary"
          size="lg"
          disabled={dailyDone}
          style={{ marginTop: space.sm }}
          onPress={() => onPlay('daily')}
        />
        {dailyDone ? <AppText variant="small" faint center style={{ marginTop: 6 }}>Yarın yeni dizi. Herkes aynı diziyi çalar.</AppText> : null}
        <AppText variant="small" muted center style={{ marginTop: space.md }}>🎧 Kulaklıkla daha iyi. Ses göreli, test değil.</AppText>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
          <Stat label="En uzun dizi" value={bestRound ? `${bestRound} nota` : '—'} icon="musical-notes" />
          <Stat label="Rekor" value={bestScore ? bestScore.toLocaleString('tr-TR') : '—'} icon="trophy" color={colors.amber} />
          <Stat label="Seviye" value={bestLevel || '—'} icon="trending-up" color={colors.accent} />
        </View>
        <Card style={{ marginTop: space.lg, gap: 6 }}>
          <AppText variant="tiny" faint>Seviye atladıkça</AppText>
          <AppText variant="small" muted>• Seviye {SILENT_FROM}: her 3. tur <AppText variant="small" color={colors.accent2}>Sessiz</AppText> — pad'ler yanmaz, sadece kulak.</AppText>
          <AppText variant="small" muted>• Seviye 6: 6 pad. Seviye {SHUFFLE_FROM}: <AppText variant="small" color={colors.coral}>Karışık</AppText> — pad'ler yer değiştirir, sesi takip et.</AppText>
          <AppText variant="small" muted>• Seviye 10: 8 pad, hızlı tempo.</AppText>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  preview: { flexDirection: 'row', gap: 8 },
  mini: { width: 44, height: 44, borderRadius: 12, opacity: 0.9 },
});
