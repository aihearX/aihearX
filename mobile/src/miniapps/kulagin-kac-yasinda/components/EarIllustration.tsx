import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/core/theme';

const APath = Animated.createAnimatedComponent(Path);

/** i. dalganın parlaklığı: paylaşılan ilerlemeye faz farkıyla bağlı üçgen dalga. */
function useWave(p: SharedValue<number>, i: number) {
  return useAnimatedProps(() => {
    const x = (((p.value - i * 0.28) % 1) + 1) % 1;
    const tri = x < 0.5 ? x * 2 : (1 - x) * 2;
    return { opacity: 0.15 + 0.85 * tri, strokeWidth: 5 + 3 * tri };
  });
}

/** Kulak + kulağa doğru gelen üç ses dalgası (dalgalar sırayla parlar). */
export function EarIllustration({ size = 180, active = true }: { size?: number; active?: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = active ? withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1, false) : withTiming(0, { duration: 300 });
  }, [active, p]);

  const w0 = useWave(p, 0);
  const w1 = useWave(p, 1);
  const w2 = useWave(p, 2);

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Circle cx={74} cy={82} r={58} fill={colors.accentSoft} />
      <Path d="M 92 24 C 60 14, 34 38, 40 72 C 44 94, 58 102, 64 120 C 68 134, 82 144, 96 138 C 110 132, 112 116, 106 106 C 102 98, 92 98, 86 104" stroke={colors.accent} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M 86 46 C 68 42, 56 58, 60 74 C 64 88, 76 88, 80 98" stroke={colors.accent2} strokeWidth={6} strokeLinecap="round" fill="none" />
      <APath d="M 118 66 A 16 16 0 0 1 118 98" stroke={colors.coral} strokeLinecap="round" fill="none" animatedProps={w0} />
      <APath d="M 130 54 A 30 30 0 0 1 130 110" stroke={colors.coral} strokeLinecap="round" fill="none" animatedProps={w1} />
      <APath d="M 142 42 A 44 44 0 0 1 142 122" stroke={colors.coral} strokeLinecap="round" fill="none" animatedProps={w2} />
    </Svg>
  );
}
