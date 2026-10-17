import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, type Gradient } from '@/core/theme';

export function ProgressBar({ value, gradient = gradients.brand, height = 8 }: { value: number; gradient?: Gradient; height?: number }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.surfaceStrong, overflow: 'hidden' }}>
      <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${v * 100}%`, height }} />
    </View>
  );
}
