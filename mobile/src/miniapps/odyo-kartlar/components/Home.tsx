import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, Chip, ProgressBar, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { DECKS, type DeckId } from '../cards';

type Props = {
  due: number; mastered: number; learning: number; total: number;
  deck: DeckId | 'all'; onDeck: (d: DeckId | 'all') => void;
  deckCounts: Record<DeckId, { due: number; mastered: number; total: number }>;
  todayDone: { done: number; known: number } | undefined;
  onStart: (force: boolean) => void;
};

export function Home({ due, mastered, learning, total, deck, onDeck, deckCounts, todayDone, onStart }: Props) {
  return (
    <View style={{ gap: space.md }}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.rose}>
          <AppText variant="tiny" color="rgba(255,255,255,0.8)">LEITNER · GÜNLÜK 15 KART</AppText>
          <AppText variant="h1" color={colors.white} style={{ marginTop: 4 }}>{due > 0 ? `${Math.min(due, 15)} kart seni bekliyor` : 'Bugünlük tamam!'}</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>
            {todayDone ? `Bugün ${todayDone.known}/${todayDone.done} bildin. ` : ''}Bildiklerin seyrekleşir, bilemediklerin yarın geri gelir.
          </AppText>
        </Card>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(60)} style={styles.row}>
        <Stat label="Bugün" value={due} icon="time" color={colors.amber} />
        <Stat label="Öğreniliyor" value={learning} icon="flash" color={colors.accent2} />
        <Stat label="Ustalaşıldı" value={mastered} icon="trophy" color={colors.mint} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100)}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="small" muted>Genel ilerleme</AppText>
            <AppText variant="small" color={colors.accent2}>{mastered}/{total}</AppText>
          </View>
          <View style={{ marginTop: 8 }}><ProgressBar value={total ? mastered / total : 0} gradient={gradients.rose} /></View>
        </Card>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(140)}>
        <AppText variant="tiny" faint style={{ marginBottom: 8 }}>DESTE</AppText>
        <View style={styles.chips}>
          <Chip label="Tümü" active={deck === 'all'} onPress={() => onDeck('all')} color={colors.accent} small />
          {DECKS.map((d) => <Chip key={d.id} label={d.name} icon={d.icon} active={deck === d.id} onPress={() => onDeck(d.id)} color={d.color} small />)}
        </View>
      </Animated.View>
      {DECKS.map((d, i) => (
        <Animated.View key={d.id} entering={FadeInDown.delay(180 + i * 40)}>
          <Card onPress={() => onDeck(d.id)} style={deck === d.id ? { borderColor: d.color } : undefined}>
            <View style={styles.deckRow}>
              <View style={[styles.deckIcon, { backgroundColor: d.color }]}><Ionicons name={d.icon} size={18} color={colors.white} /></View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{d.name}</AppText>
                <AppText variant="small" muted>{deckCounts[d.id].due} bekliyor · {deckCounts[d.id].mastered}/{deckCounts[d.id].total} ustalaşıldı</AppText>
              </View>
              <AppText variant="h3" color={d.color}>{deckCounts[d.id].due}</AppText>
            </View>
          </Card>
        </Animated.View>
      ))}
      <Animated.View entering={FadeInDown.delay(400)} style={{ gap: space.sm, marginTop: space.sm }}>
        <Button title={due > 0 ? 'Günlük Oturuma Başla' : 'Yine de Çalış (rastgele 15)'} icon="play" size="lg" onPress={() => onStart(due === 0)} />
        {due > 0 ? <Button title="Ekstra: rastgele 15 kart" variant="ghost" onPress={() => onStart(true)} /> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  deckRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  deckIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
