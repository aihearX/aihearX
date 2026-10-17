import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import type { SoundDef } from '../sounds';

export type Answer = { chosenId: string; correctId: string } | null;

function OptionCard({ sound, state, onPress, index, disabled }: { sound: SoundDef; state: 'idle' | 'correct' | 'wrong' | 'dim'; onPress: () => void; index: number; disabled: boolean }) {
  const x = useSharedValue(0);
  const scale = useSharedValue(1);
  useEffect(() => {
    if (state === 'wrong') x.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(-5, { duration: 50 }), withTiming(0, { duration: 50 }));
    if (state === 'correct') scale.value = withSequence(withSpring(1.06), withSpring(1));
  }, [state, x, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { scale: scale.value }] }));
  const border = state === 'correct' ? colors.mint : state === 'wrong' ? colors.red : colors.border;
  const bg = state === 'correct' ? colors.accent2Soft : state === 'wrong' ? colors.surfaceStrong : colors.bg;
  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(220)} style={[styles.cell, anim, state === 'dim' && { opacity: 0.45 }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={sound.name}
        style={({ pressed }) => [styles.card, { borderColor: border, backgroundColor: bg }, pressed && !disabled && { transform: [{ scale: 0.97 }], backgroundColor: colors.surfaceStrong }]}
      >
        <AppText style={{ fontSize: 34, lineHeight: 40 }}>{sound.emoji}</AppText>
        <AppText variant="bodyStrong" center numberOfLines={2} style={{ marginTop: 6 }} color={state === 'correct' ? colors.mint : state === 'wrong' ? colors.red : colors.text}>{sound.name}</AppText>
      </Pressable>
    </Animated.View>
  );
}

/** 2×2 seçenek ızgarası. answer verildiğinde doğru yeşil, yanlış seçim kırmızı, diğerleri soluk. */
export function OptionGrid({ options, answer, onPick, roundKey }: { options: SoundDef[]; answer: Answer; onPick: (id: string) => void; roundKey: number }) {
  return (
    <View style={styles.grid} key={roundKey}>
      {options.map((o, i) => {
        let state: 'idle' | 'correct' | 'wrong' | 'dim' = 'idle';
        if (answer) state = o.id === answer.correctId ? 'correct' : o.id === answer.chosenId ? 'wrong' : 'dim';
        return <OptionCard key={o.id} sound={o} index={i} state={state} disabled={!!answer} onPress={() => onPick(o.id)} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '48%', flexGrow: 1 },
  card: { borderRadius: radius.lg, borderWidth: 2, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', minHeight: 112 },
});
