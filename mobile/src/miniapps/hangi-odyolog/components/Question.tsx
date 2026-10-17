import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, ProgressBar } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import type { Question as Q, TypeId } from '../data';

type Props = { index: number; total: number; question: Q; onAnswer: (t: TypeId) => void };

export function Question({ index, total, question, onAnswer }: Props) {
  return (
    <Animated.View key={index} entering={FadeInDown.duration(300)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <AppText variant="small" muted>Soru {index + 1} / {total}</AppText>
        <AppText variant="small" muted>{Math.round((index / total) * 100)}%</AppText>
      </View>
      <ProgressBar value={(index + 1) / total} gradient={gradients.rose} />
      <AppText variant="h1" style={{ marginTop: space.xl }}>{question.q}</AppText>
      <View style={{ gap: 10, marginTop: space.xl }}>
        {question.answers.map((a, i) => (
          <Pressable key={a.text} onPress={() => onAnswer(a.type)} style={({ pressed }) => [styles.answer, pressed && styles.pressed]}>
            <View style={styles.letter}><AppText variant="bodyStrong" color={colors.white}>{String.fromCharCode(65 + i)}</AppText></View>
            <AppText style={{ flex: 1 }}>{a.text}</AppText>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  answer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 64, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { backgroundColor: colors.accentSoft, borderColor: colors.accent, transform: [{ scale: 0.985 }] },
  letter: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
