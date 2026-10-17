import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, Stat } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { DAILY_ROUNDS, LIVES, type Mode } from '../engine';
import type { DailyEntry } from '../store';

type Props = {
  mode: Mode;
  onMode: (m: Mode) => void;
  onPlay: () => void;
  best: number;
  highLevel: number;
  gamesPlayed: number;
  todayDaily: DailyEntry | null;
  soundCount: number;
};

function ModeCard({ active, title, desc, icon, onPress, badge }: { active: boolean; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; badge?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: active }} style={({ pressed }) => [styles.mode, active && styles.modeActive, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={22} color={active ? colors.accent : colors.textMuted} />
      <AppText variant="h3" style={{ marginTop: 6 }} color={active ? colors.accent : colors.text}>{title}</AppText>
      <AppText variant="small" muted style={{ marginTop: 2 }}>{desc}</AppText>
      {badge ? <View style={styles.badge}><AppText variant="tiny" color={colors.white}>{badge}</AppText></View> : null}
    </Pressable>
  );
}

/** Giriş ekranı: başlık, tek satır, kulaklık uyarısı, mod seçimi, rekorlar, Oyna. */
export function Intro({ mode, onMode, onPlay, best, highLevel, gamesPlayed, todayDaily, soundCount }: Props) {
  const dailyDone = !!todayDaily;
  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Card gradient={gradients.violet} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
        <AppText style={{ fontSize: 64, lineHeight: 76 }}>🔍</AppText>
        <AppText variant="h1" color={colors.white} center>Ses Dedektifi</AppText>
        <AppText color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>Gizemli sesi dinle, süre bitmeden 4 seçenekten doğrusunu bul.</AppText>
        <View style={styles.pill}><Ionicons name="headset" size={14} color={colors.white} /><AppText variant="small" color={colors.white}>Kulaklıkla daha iyi. Ses göreli, test değil.</AppText></View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
        <ModeCard
          active={mode === 'daily'}
          title="Günün Serisi"
          desc={dailyDone ? `Bugün: ${todayDaily.score.toLocaleString('tr-TR')} puan · ${todayDaily.rank}` : `${DAILY_ROUNDS} ses, herkese aynı sıra`}
          icon="calendar"
          badge={dailyDone ? 'Yarın yeni seri' : undefined}
          onPress={() => onMode('daily')}
        />
        <ModeCard active={mode === 'free'} title="Serbest" desc={`${LIVES} can bitene kadar, ${soundCount} ses`} icon="infinite" onPress={() => onMode('free')} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: space.md }}>
        <Stat label="Rekor" value={best.toLocaleString('tr-TR')} icon="trophy" color={colors.amber} />
        <Stat label="En yüksek seviye" value={highLevel || '-'} icon="trending-up" />
        <Stat label="Oyun" value={gamesPlayed} icon="game-controller" color={colors.coral} />
      </View>

      <Button
        title={mode === 'daily' && dailyDone ? 'Bugünkü seri oynandı' : 'Oyna'}
        icon="play"
        size="lg"
        gradient={gradients.violet}
        style={{ marginTop: space.lg }}
        disabled={mode === 'daily' && dailyDone}
        onPress={onPlay}
      />
      <AppText variant="small" faint center style={{ marginTop: space.md }}>Doğru cevap: 100 × kombo + kalan saniye × 10. Tekrar dinlemek 10 puan.</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.22)' },
  mode: { flex: 1, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.bg, padding: 14 },
  modeActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  badge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.accent2 },
});
