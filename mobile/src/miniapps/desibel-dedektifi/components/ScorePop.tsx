import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors } from '@/core/theme';

export function ScorePop({ text, trigger, color = colors.mint }: { text: string; trigger: number; color?: string }) {
  const scale = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (!trigger) return;
    opacity.value = 1;
    y.value = 0;
    scale.value = withSequence(withSpring(1.3, { damping: 8 }), withTiming(1, { duration: 150 }));
    y.value = withTiming(-46, { duration: 800 });
    opacity.value = withDelay(500, withTiming(0, { duration: 350 }));
  }, [trigger, opacity, scale, y]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }, { scale: scale.value }] }));
  if (!trigger) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.pop, style]}>
      <AppText variant="h1" color={color}>{text}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ pop: { position: 'absolute', alignSelf: 'center', top: -10, zIndex: 10 } });
