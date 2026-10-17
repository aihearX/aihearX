import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOutUp, ZoomIn } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors } from '@/core/theme';

/** "+120" gibi uçan puan yazısı. key ile tetiklenir. */
export function ScorePop({ text, color = colors.mint, popKey }: { text: string; color?: string; popKey: number }) {
  if (!text) return null;
  return (
    <Animated.View key={popKey} entering={ZoomIn.duration(150)} exiting={FadeOutUp.duration(500)} pointerEvents="none" style={styles.pop}>
      <AppText variant="h1" color={color}>{text}</AppText>
    </Animated.View>
  );
}
const styles = StyleSheet.create({ pop: { position: 'absolute', top: '32%', alignSelf: 'center', zIndex: 5 } });
