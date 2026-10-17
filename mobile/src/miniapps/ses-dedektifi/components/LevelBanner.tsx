import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOutUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/core/ui';
import { colors, gradients, radius } from '@/core/theme';

/** Seviye atlama rozeti; parent kısa süre sonra kaldırır. */
export function LevelBanner({ level, hint }: { level: number; hint?: string }) {
  return (
    <Animated.View entering={ZoomIn.duration(220)} exiting={FadeOutUp.duration(300)} pointerEvents="none" style={styles.wrap}>
      <LinearGradient colors={[...gradients.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <AppText variant="tiny" color={colors.white}>Seviye atladın</AppText>
        <AppText variant="display" color={colors.white}>Seviye {level}</AppText>
        {hint ? <AppText variant="small" color={colors.white}>{hint}</AppText> : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '26%', left: 0, right: 0, alignItems: 'center', zIndex: 6 },
  card: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center', gap: 2 },
});
