import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { colors } from '@/core/theme';

/** Doğru/yanlış anında kısa tam ekran renk flaşı. key değişince yeniden oynar. */
export function FeedbackFlash({ kind, trigger }: { kind: 'good' | 'bad' | null; trigger: number }) {
  const op = useSharedValue(0);
  useEffect(() => {
    if (!kind) return;
    op.value = withSequence(withTiming(0.28, { duration: 60 }), withTiming(0, { duration: 260 }));
  }, [trigger, kind, op]);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: kind === 'bad' ? colors.red : colors.mint }, style]} />;
}
