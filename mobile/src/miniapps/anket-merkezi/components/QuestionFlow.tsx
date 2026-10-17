import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Card, ProgressBar } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { ANSWERS, type Questionnaire } from '../questionnaires';

export function QuestionFlow({ q, onDone, onCancel }: { q: Questionnaire; onDone: (answers: number[]) => void; onCancel: () => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const total = q.items.length;
  const current = answers[idx];

  const pick = (v: number) => {
    Haptics.selectionAsync().catch(() => {});
    const next = [...answers];
    next[idx] = v;
    setAnswers(next);
    if (idx + 1 < total) setTimeout(() => setIdx(idx + 1), 180);
  };

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.head}>
        <Pressable onPress={idx === 0 ? onCancel : () => setIdx(idx - 1)} style={styles.back}><Ionicons name="arrow-back" size={18} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">{q.name}</AppText>
          <AppText variant="tiny" faint>SORU {idx + 1} / {total}</AppText>
        </View>
        <AppText variant="small" muted>{Math.round((answers.filter((a) => a != null).length / total) * 100)}%</AppText>
      </View>
      <ProgressBar value={(idx + (current != null ? 1 : 0)) / total} gradient={q.gradient} />

      <Animated.View key={idx} entering={FadeInRight.duration(240)}>
        <Card style={{ minHeight: 150, justifyContent: 'center' }}>
          <AppText variant="h2">{q.items[idx]}</AppText>
        </Card>
      </Animated.View>

      <View style={{ gap: space.sm }}>
        {ANSWERS.map((a, i) => {
          const active = current === a.value;
          return (
            <Animated.View key={a.label} entering={FadeInDown.delay(i * 50)}>
              <Pressable onPress={() => pick(a.value)} style={({ pressed }) => [styles.opt, active && { borderColor: q.gradient[0], backgroundColor: colors.surfaceStrong }, pressed && { opacity: 0.85 }]}>
                <View style={[styles.radio, active && { borderColor: q.gradient[0], backgroundColor: q.gradient[0] }]} />
                <AppText variant="bodyStrong" style={{ flex: 1 }}>{a.label}</AppText>
                <AppText variant="small" faint>{a.value} puan</AppText>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {idx + 1 === total && current != null ? <Button title="Sonucu Gör" icon="checkmark-circle" onPress={() => onDone(answers)} /> : null}
      <AppText variant="small" faint center>Dürüst cevaplar en doğru sonucu verir. Sorular arasında geri dönebilirsiniz.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.borderStrong },
});
