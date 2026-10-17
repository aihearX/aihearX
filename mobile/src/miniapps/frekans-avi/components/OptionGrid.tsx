import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { fmtFreq } from '../logic';

type Props = {
  options: number[];
  answer: number;
  chosen: number | null;
  revealed: boolean;
  onPick: (f: number) => void;
};

/** 2x2 frekans seçenekleri; cevap sonrası doğru yeşil, yanlış kırmızı. */
export function OptionGrid({ options, answer, chosen, revealed, onPick }: Props) {
  return (
    <View style={styles.grid}>
      {options.map((f, i) => {
        const isAnswer = revealed && f === answer;
        const isWrong = revealed && chosen === f && f !== answer;
        return (
          <Animated.View key={`${f}-${i}`} entering={FadeInDown.delay(i * 60)} style={styles.cell}>
            <Pressable
              disabled={revealed}
              onPress={() => onPick(f)}
              style={({ pressed }) => [styles.btn, pressed && { transform: [{ scale: 0.97 }] }, isAnswer && styles.right, isWrong && styles.wrong]}
            >
              <AppText variant="h2" color={isAnswer ? colors.mint : isWrong ? colors.red : colors.text}>{fmtFreq(f)}</AppText>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  cell: { width: '47%', flexGrow: 1 },
  btn: { height: 84, borderRadius: radius.lg, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  right: { borderColor: colors.mint, backgroundColor: 'rgba(74,222,128,0.14)' },
  wrong: { borderColor: colors.red, backgroundColor: 'rgba(255,92,92,0.14)' },
});
