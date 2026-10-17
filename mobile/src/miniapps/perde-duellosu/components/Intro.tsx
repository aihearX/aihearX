import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SOLO_SECONDS, fmtPct, fmtSemi } from '../logic';

type Props = { bestScore: number; bestMinP: number | null; duels: number; onSolo: () => void; onDuel: () => void };

/** Giriş: tek cümle + Oyna + Düello + kulaklık satırı. */
export function Intro({ bestScore, bestMinP, duels, onSolo, onDuel }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.ocean} style={{ alignItems: 'center', paddingVertical: space.xl }}>
          <AppText style={{ fontSize: 56, lineHeight: 64 }}>🎼</AppText>
          <AppText variant="h1" color={colors.white} center>Perde Düellosu</AppText>
          <AppText color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>İki ses çalar; hangisi daha tiz? Bildikçe fark küçülür, puan büyür.</AppText>
        </Card>
        <Button title={`Oyna · ${SOLO_SECONDS} saniye`} icon="play" size="lg" gradient={gradients.ocean} style={{ marginTop: space.lg }} onPress={onSolo} />
        <Button title="Düello · 2 kişi, tek telefon" icon="people" variant="secondary" size="lg" style={{ marginTop: space.sm }} onPress={onDuel} />
        <AppText variant="small" muted center style={{ marginTop: space.md }}>🎧 Kulaklıkla daha iyi. Ses göreli, test değil.</AppText>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
          <Stat label="Rekor" value={bestScore ? bestScore.toLocaleString('tr-TR') : '—'} icon="trophy" color={colors.amber} />
          <Stat label="En küçük fark" value={bestMinP !== null ? fmtPct(bestMinP) : '—'} icon="git-compare" color={colors.accent} />
          <Stat label="Düello" value={duels || '—'} icon="flash" color={colors.coral} />
        </View>
        {bestMinP !== null ? <AppText variant="small" faint center style={{ marginTop: 8 }}>En iyi kulağın {fmtPct(bestMinP)} farkı ayırt etti (yaklaşık {fmtSemi(bestMinP)}).</AppText> : null}
        <Card style={{ marginTop: space.lg, gap: 6 }}>
          <AppText variant="tiny" faint>Nasıl oynanır</AppText>
          <AppText variant="small" muted>• Sol alan 1. ses, sağ alan 2. ses: daha tiz olana dokun.</AppText>
          <AppText variant="small" muted>• Doğru: fark %20 küçülür, puan artar. Yanlış: can gider, fark büyür.</AppText>
          <AppText variant="small" muted>• Üst seviyelerde tonlar hafifçe titrer (warble); yükseklik ipucu vermez, kulağına güven.</AppText>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 32 } });
