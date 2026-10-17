import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { PAD_COLORS, SHUFFLE_FROM, SILENT_FROM, type Mode } from '../logic';
import { SONGS } from '../songs';
import type { DailyRecord } from '../store';

type Props = { bestRound: number; bestScore: number; songsDone: number; daily: DailyRecord | null; todayKey: string; onPlay: (mode: Mode) => void };

/** Giriş: tek cümle + Gizli Ezgi (ana) + Günün Ezgisi + Rastgele + kulaklık satırı. */
export function Intro({ bestRound, bestScore, songsDone, daily, todayKey, onPlay }: Props) {
  const dailyDone = daily?.key === todayKey;
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.violet} style={{ alignItems: 'center', paddingVertical: space.xl }}>
          <View style={styles.preview}>
            {[0, 2, 3, 5].map((id) => <View key={id} style={[styles.mini, { backgroundColor: PAD_COLORS[id] }]}><AppText variant="h3" color={colors.white}>♪</AppText></View>)}
          </View>
          <AppText variant="h1" color={colors.white} center style={{ marginTop: space.md }}>Ton Hafızası</AppText>
          <AppText color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>Pad'ler sırayla çalar, sen tekrar edersin. Her tur bir nota eklenir… ve farkında olmadan bir şarkı çalıyorsun.</AppText>
        </Card>
        <Button title="Gizli Ezgi · Oyna" icon="play" size="lg" gradient={gradients.violet} style={{ marginTop: space.lg }} onPress={() => onPlay('song')} />
        <Button
          title={dailyDone ? `Günün ezgisi: ${daily!.score.toLocaleString('tr-TR')} · ${daily!.round} nota` : 'Günün Ezgisi'}
          icon={dailyDone ? 'checkmark-circle' : 'calendar'}
          variant="secondary"
          size="lg"
          disabled={dailyDone}
          style={{ marginTop: space.sm }}
          onPress={() => onPlay('daily')}
        />
        <Button title="Rastgele (klasik Simon)" icon="shuffle" variant="ghost" size="md" style={{ marginTop: space.xs }} onPress={() => onPlay('random')} />
        {dailyDone ? <AppText variant="small" faint center style={{ marginTop: 6 }}>Yarın yeni ezgi. Herkes aynı şarkıyı çalar.</AppText> : null}
        <AppText variant="small" muted center style={{ marginTop: space.md }}>🎧 Kulaklıkla daha iyi. Ses göreli, test değil.</AppText>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
          <Stat label="Şarkı" value={songsDone ? `${songsDone}/${SONGS.length}+` : `0/${SONGS.length}`} icon="musical-notes" />
          <Stat label="Rekor" value={bestScore ? bestScore.toLocaleString('tr-TR') : '—'} icon="trophy" color={colors.amber} />
          <Stat label="En uzun tur" value={bestRound ? `${bestRound}` : '—'} icon="trending-up" color={colors.accent} />
        </View>
        <Card style={{ marginTop: space.lg, gap: 6 }}>
          <AppText variant="tiny" faint>Nasıl çalışır</AppText>
          <AppText variant="small" muted>• Her tur gizli bir ezginin <AppText variant="small" color={colors.accent}>sıradaki notası</AppText> eklenir. Cümle bitince ezgi ritmiyle çalar: "Bu ezgiyi tanıdın mı?"</AppText>
          <AppText variant="small" muted>• Pad'ler şarkının seslerine göre kurulur (4, 6 ya da 8 pad; Do Re Mi…).</AppText>
          <AppText variant="small" muted>• Seviye {SILENT_FROM}: her 3. tur <AppText variant="small" color={colors.accent2}>Sessiz</AppText> — pad'ler yanmaz. Seviye {SHUFFLE_FROM}: <AppText variant="small" color={colors.coral}>Karışık</AppText> — pad'ler yer değiştirir.</AppText>
          <AppText variant="small" muted>• Şarkıyı bitirince bonus ve sıradaki şarkı. {SONGS.length} anonim ezgi: türkü, çocuk şarkısı, klasik.</AppText>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  preview: { flexDirection: 'row', gap: 8 },
  mini: { width: 44, height: 44, borderRadius: 12, opacity: 0.9, alignItems: 'center', justifyContent: 'center' },
});
