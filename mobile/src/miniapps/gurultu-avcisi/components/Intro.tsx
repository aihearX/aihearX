import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, Chip, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { TOTAL_ROUNDS, fmtSnr } from '../logic';
import { MISSING_VOICE_HINT, type VoiceInfo } from '../tts';
import type { Mode } from '../useNoiseGame';

type Props = { best: number; games: number; bestSnrDb: number | null; dailyScore: number | null; voice: VoiceInfo; onPlay: (m: Mode) => void };

/** Giriş: tek cümle + Oyna. Türkçe ses kontrolü ve günün avı burada. */
export function Intro({ best, games, bestSnrDb, dailyScore, voice, onPlay }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <Card gradient={gradients.ocean} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
          <AppText style={{ fontSize: 64, lineHeight: 76 }}>🎯</AppText>
          <AppText variant="h1" color={colors.white} center>Gürültü Avcısı</AppText>
          <AppText color="rgba(255,255,255,0.92)" center style={{ marginTop: 6 }}>Gürültünün içinden okunan üç rakamı yakala. Doğru bildikçe gürültü artar.</AppText>
          <View style={styles.chips}>
            <Chip label={`${TOTAL_ROUNDS} üçlü`} icon="list" small />
            <Chip label="3 can" icon="heart" small />
            <Chip label="Kombo" icon="flame" small />
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120)}>
        <AppText variant="small" muted center style={{ marginTop: space.md }}>Kulaklıkla daha iyi. Ses göreli, test değil.</AppText>
        {voice.status === 'missing' ? (
          <Card style={{ marginTop: space.md, borderColor: colors.amber }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Ionicons name="warning" size={20} color={colors.amber} />
              <AppText variant="small" style={{ flex: 1 }}>{MISSING_VOICE_HINT}</AppText>
            </View>
          </Card>
        ) : voice.status === 'checking' ? (
          <AppText variant="tiny" faint center style={{ marginTop: space.sm }}>Türkçe ses kontrol ediliyor…</AppText>
        ) : (
          <AppText variant="tiny" faint center style={{ marginTop: space.sm }}>{voice.status === 'ready' ? 'Türkçe ses hazır · rakamlar cihazın sesiyle okunur' : 'Rakamlar cihazın sesiyle okunur'}</AppText>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={{ marginTop: space.lg, gap: 10 }}>
        <Button title="Oyna" icon="play" size="lg" gradient={gradients.ocean} onPress={() => onPlay('free')} disabled={voice.status === 'checking'} />
        <Button
          title={dailyScore == null ? 'Günün Avı' : `Bugünün avı tamam · ${dailyScore.toLocaleString('tr-TR')} puan`}
          icon={dailyScore == null ? 'calendar' : 'checkmark-circle'}
          variant="secondary"
          onPress={() => onPlay('daily')}
          disabled={dailyScore != null || voice.status === 'checking'}
        />
        <AppText variant="tiny" faint center>Günün avı: herkese aynı 20 üçlü, günde bir kez.</AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(280)} style={styles.stats}>
        <Stat label="Rekor" value={best.toLocaleString('tr-TR')} icon="trophy" color={colors.amber} />
        <Stat label="Oyun" value={games} icon="game-controller" />
        <Stat label="En zor SNR" value={bestSnrDb == null ? '—' : fmtSnr(bestSnrDb)} icon="pulse" color={colors.coral} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(340)}>
        <Card style={{ marginTop: space.lg }}>
          <AppText variant="h3">Nasıl oynanır?</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>Gürültü başlar, bir ses üç rakam okur. Sen tuş takımına üç rakamı yaz. Her doğruda gürültü yükselir, her yanlışta biraz düşer. Üst üste 3 yanlış oyunu bitirir.</AppText>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  chips: { flexDirection: 'row', gap: 8, marginTop: space.lg },
  stats: { flexDirection: 'row', gap: 10, marginTop: space.lg },
});
