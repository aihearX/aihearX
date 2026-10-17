import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Card } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { QUESTIONS, TYPES, TYPE_ORDER, computeType, type TypeId } from './data';
import { Question } from './components/Question';
import { Reveal } from './components/Reveal';

type Phase = 'intro' | 'quiz' | 'reveal';

export default function App({ onResult }: MiniAppProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<TypeId[]>([]);
  const [result, setResult] = useState<TypeId | null>(null);

  const answer = (t: TypeId) => {
    Haptics.selectionAsync().catch(() => {});
    const next = [...answers, t];
    if (idx >= QUESTIONS.length - 1) {
      const type = computeType(next);
      setAnswers(next);
      setResult(type);
      setPhase('reveal');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onResult({ label: TYPES[type].name, xp: 15, shareText: shareTextFor(type), meta: { type, answers: next } });
      return;
    }
    setAnswers(next);
    setIdx((i) => i + 1);
  };

  const restart = () => { setIdx(0); setAnswers([]); setResult(null); setPhase('intro'); };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {phase === 'intro' ? (
        <Animated.View entering={FadeInDown}>
          <Card gradient={gradients.rose} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
            <AppText style={{ fontSize: 56 }}>🧬</AppText>
            <AppText variant="h1" color={colors.white} center>Hangi odyolog tipisin?</AppText>
            <AppText color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>10 soru, 6 tip. Odyolog olman gerekmiyor; içgüdüne göre cevapla.</AppText>
          </Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.lg }}>
            {TYPE_ORDER.map((t) => (
              <View key={t} style={styles.typePill}>
                <AppText variant="small">{TYPES[t].emoji} {TYPES[t].name}</AppText>
              </View>
            ))}
          </View>
          <Button title="Başla" size="lg" icon="play" gradient={gradients.rose} style={{ marginTop: space.xl }} onPress={() => setPhase('quiz')} />
        </Animated.View>
      ) : null}

      {phase === 'quiz' ? <Question index={idx} total={QUESTIONS.length} question={QUESTIONS[idx]!} onAnswer={answer} /> : null}

      {phase === 'reveal' && result ? <Reveal type={TYPES[result]} shareText={shareTextFor(result)} onRetry={restart} /> : null}
    </ScrollView>
  );
}

const shareTextFor = (t: TypeId) => `Ben bir ${TYPES[t].nameSuffix} ${TYPES[t].emoji} Sen hangisisin? aihearX`;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  typePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
