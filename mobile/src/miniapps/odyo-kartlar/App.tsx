import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Card, ProgressBar, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { dayIndex, dayKey, seededRandom } from '@/core/util/day';
import { CARDS, DECKS, type Card as FlashCard, type DeckId } from './cards';
import { MAX_BOX, useCardStore } from './store';
import { FlipCard } from './components/FlipCard';
import { Home } from './components/Home';

const SESSION = 15;
type Phase = 'home' | 'play' | 'done';

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const r = seededRandom(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export default function App({ onResult }: MiniAppProps) {
  const today = dayKey();
  const progress = useCardStore((s) => s.progress);
  const sessions = useCardStore((s) => s.sessions);
  const mark = useCardStore((s) => s.mark);
  const logSession = useCardStore((s) => s.logSession);

  const [phase, setPhase] = useState<Phase>('home');
  const [deck, setDeck] = useState<DeckId | 'all'>('all');
  const [queue, setQueue] = useState<FlashCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [results, setResults] = useState<{ id: string; ok: boolean }[]>([]);

  const isDue = useCallback((c: FlashCard) => { const p = progress[c.id]; return !p || p.due <= today; }, [progress, today]);
  const pool = useMemo(() => (deck === 'all' ? CARDS : CARDS.filter((c) => c.deck === deck)), [deck]);
  const dueCards = useMemo(() => pool.filter(isDue), [pool, isDue]);
  const mastered = useMemo(() => pool.filter((c) => (progress[c.id]?.box ?? 0) >= MAX_BOX).length, [pool, progress]);
  const learning = useMemo(() => pool.filter((c) => { const b = progress[c.id]?.box ?? 0; return b > 0 && b < MAX_BOX; }).length, [pool, progress]);
  const deckCounts = useMemo(() => {
    const out = {} as Record<DeckId, { due: number; mastered: number; total: number }>;
    for (const d of DECKS) {
      const cs = CARDS.filter((c) => c.deck === d.id);
      out[d.id] = { due: cs.filter(isDue).length, mastered: cs.filter((c) => (progress[c.id]?.box ?? 0) >= MAX_BOX).length, total: cs.length };
    }
    return out;
  }, [isDue, progress]);

  const start = (force: boolean) => {
    const seed = dayIndex() * 7 + (force ? Date.now() % 1000 : 0);
    let list: FlashCard[];
    if (force) list = shuffleSeeded(pool, seed).slice(0, SESSION);
    else {
      const reviews = dueCards.filter((c) => progress[c.id]).sort((a, b) => (progress[a.id]?.box ?? 0) - (progress[b.id]?.box ?? 0));
      const fresh = shuffleSeeded(dueCards.filter((c) => !progress[c.id]), seed);
      list = shuffleSeeded([...reviews, ...fresh].slice(0, SESSION), seed + 1);
    }
    if (!list.length) return;
    setQueue(list); setIdx(0); setFlipped(false); setKnown(0); setResults([]); setPhase('play');
  };

  const answer = (ok: boolean) => {
    const card = queue[idx];
    if (!card) return;
    mark(card.id, ok, today);
    Haptics.impactAsync(ok ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const k = known + (ok ? 1 : 0);
    const res = [...results, { id: card.id, ok }];
    setKnown(k); setResults(res);
    if (idx + 1 >= queue.length) {
      logSession(today, queue.length, k);
      onResult({ score: Math.round((k / queue.length) * 100), label: `${k}/${queue.length}`, xp: 20, points: k * 5, meta: { deck } });
      setPhase('done');
      return;
    }
    setFlipped(false); setIdx(idx + 1);
  };

  const card = queue[idx];
  const deckOf = (c: FlashCard) => DECKS.find((d) => d.id === c.deck)!;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {phase === 'home' ? (
        <Home due={dueCards.length} mastered={mastered} learning={learning} total={pool.length} deck={deck} onDeck={setDeck} deckCounts={deckCounts} todayDone={sessions[today]} onStart={start} />
      ) : null}

      {phase === 'play' && card ? (
        <View style={{ gap: space.md }}>
          <View style={styles.row}>
            <AppText variant="small" muted style={{ flex: 1 }}>Kart {idx + 1}/{queue.length}</AppText>
            <AppText variant="small" color={colors.mint}>{known} bildim</AppText>
          </View>
          <ProgressBar value={idx / queue.length} gradient={gradients.rose} />
          <Animated.View key={card.id} entering={FadeIn.duration(220)}>
            <FlipCard front={card.q} back={card.a} deckName={deckOf(card).name} color={deckOf(card).color} flipped={flipped} onFlip={() => setFlipped((f) => !f)} box={progress[card.id]?.box ?? 0} />
          </Animated.View>
          {flipped ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.row}>
              <Button title="Bilemedim" icon="close" variant="danger" onPress={() => answer(false)} style={{ flex: 1 }} />
              <Button title="Bildim" icon="checkmark" gradient={gradients.mint} onPress={() => answer(true)} style={{ flex: 1 }} />
            </Animated.View>
          ) : (
            <AppText variant="small" faint center>Önce cevabı içinden söyle, sonra kartı çevir.</AppText>
          )}
          <Button title="Oturumu bırak" variant="ghost" size="sm" onPress={() => setPhase('home')} />
        </View>
      ) : null}

      {phase === 'done' ? (
        <View style={{ gap: space.md }}>
          <Animated.View entering={FadeInDown.springify()}>
            <Card gradient={known === queue.length ? gradients.gold : gradients.rose}>
              <AppText variant="tiny" color="rgba(255,255,255,0.8)">OTURUM TAMAM</AppText>
              <AppText variant="display" color={colors.white}>{known}/{queue.length}</AppText>
              <AppText variant="body" color="rgba(255,255,255,0.9)">{known === queue.length ? 'Hepsini bildin! Kartlar bir üst kutuya taşındı.' : `${queue.length - known} kart yarın tekrar karşına çıkacak.`}</AppText>
            </Card>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.row}>
            <Stat label="Bildim" value={known} icon="checkmark-circle" color={colors.mint} />
            <Stat label="Bilemedim" value={queue.length - known} icon="close-circle" color={colors.red} />
            <Stat label="Ustalaşıldı" value={mastered} icon="trophy" color={colors.amber} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(160)}>
            <Card>
              <AppText variant="tiny" faint style={{ marginBottom: 6 }}>TEKRAR EDİLECEKLER</AppText>
              {results.filter((r) => !r.ok).length === 0 ? <AppText variant="small" muted>Yok. Harika!</AppText> : results.filter((r) => !r.ok).map((r) => {
                const c = CARDS.find((x) => x.id === r.id)!;
                return <AppText key={r.id} variant="small" muted style={{ marginTop: 4 }}>• {c.q}</AppText>;
              })}
            </Card>
          </Animated.View>
          <Button title="Ana Sayfa" icon="layers" onPress={() => setPhase('home')} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
});
