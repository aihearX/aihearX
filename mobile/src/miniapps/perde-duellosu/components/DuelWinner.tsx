import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { duelShareText } from '../logic';

type Props = { names: { a: string; b: string }; scores: { a: number; b: number }; onRematch: () => void; onNewPlayers: () => void; onHome: () => void };

/** Düello sonu: kazanan kartı + rövanş. */
export function DuelWinner({ names, scores, onRematch, onNewPlayers, onHome }: Props) {
  const aWon = scores.a > scores.b;
  const winner = aWon ? names.a : names.b;
  const loser = aWon ? names.b : names.a;
  const ws = aWon ? scores.a : scores.b;
  const ls = aWon ? scores.b : scores.a;
  const shareText = duelShareText(winner, ws, loser, ls);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={ZoomIn.duration(350)} style={{ alignItems: 'center', marginTop: space.md }}>
        <AppText style={{ fontSize: 64, lineHeight: 76 }}>🏆</AppText>
        <AppText variant="h1" center>{winner} kazandı</AppText>
        <AppText variant="small" muted center>{ls >= ws - 2 ? 'Nefes kesen bir düello.' : 'Açık ara üstünlük.'}</AppText>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(150)} style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
        <Stat label={names.a} value={scores.a} icon="person" color={colors.accent} />
        <Stat label={names.b} value={scores.b} icon="person" color={colors.coral} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(250)} style={{ marginTop: space.lg }}>
        <ShareCard title={`⚔️ ${winner}`} subtitle={`${winner} ${ws} - ${ls} ${loser}`} gradient={gradients.ember} shareText={shareText} makerName="Sebahattin Ünlü" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(350)} style={{ marginTop: space.lg, gap: 10 }}>
        <Button title="Rövanş" icon="refresh" size="lg" gradient={gradients.ember} onPress={onRematch} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Yeni oyuncular" variant="secondary" icon="people" style={{ flex: 1 }} onPress={onNewPlayers} />
          <Button title="Ana ekran" variant="secondary" icon="home" style={{ flex: 1 }} onPress={onHome} />
        </View>
      </Animated.View>
      <Card style={{ marginTop: space.lg }}><AppText variant="tiny" faint center>Oyundur, işitme testi değildir. Ses göreli, kalibre değil.</AppText></Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { padding: space.lg, paddingBottom: 48 } });
