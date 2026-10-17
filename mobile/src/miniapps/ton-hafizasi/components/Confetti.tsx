import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { seededRandom } from '@/core/util/day';
import { PAD_COLORS } from '../logic';

type Piece = { x: number; drift: number; delay: number; dur: number; size: number; color: string; spin: number };

function Particle({ p, height, trigger }: { p: Piece; height: number; trigger: number }) {
  const y = useSharedValue(-40);
  const op = useSharedValue(0);
  const rot = useSharedValue(0);
  useEffect(() => {
    y.value = -40; op.value = 0; rot.value = 0;
    op.value = withDelay(p.delay, withTiming(1, { duration: 120 }));
    y.value = withDelay(p.delay, withTiming(height + 40, { duration: p.dur, easing: Easing.in(Easing.quad) }));
    rot.value = withDelay(p.delay, withTiming(p.spin, { duration: p.dur, easing: Easing.linear }));
    op.value = withDelay(p.delay + p.dur - 300, withTiming(0, { duration: 300 }));
  }, [trigger, p, height, y, op, rot]);
  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: y.value }, { translateX: Math.sin((y.value / height) * Math.PI * 2) * p.drift }, { rotate: `${rot.value}deg` }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.piece, { left: p.x, width: p.size, height: p.size * 1.6, backgroundColor: p.color, borderRadius: p.size / 3 }, style]} />;
}

/** Şarkı bitince renkli parçacık yağmuru (reanimated). trigger artınca yeniden oynar. */
export function Confetti({ trigger, count = 28 }: { trigger: number; count?: number }) {
  const { width, height } = useWindowDimensions();
  // Her tetikte yeni ama deterministik dağılım (render sırasında Math.random yok).
  const pieces = useMemo<Piece[]>(() => {
    const rng = seededRandom(trigger * 7919 + 17);
    const out: Piece[] = [];
    for (let i = 0; i < count; i++) {
      out.push({
        x: rng() * width, drift: 12 + rng() * 40, delay: rng() * 500, dur: 1600 + rng() * 1200,
        size: 7 + rng() * 7, color: PAD_COLORS[i % PAD_COLORS.length]!, spin: (rng() > 0.5 ? 1 : -1) * (360 + rng() * 540),
      });
    }
    return out;
  }, [count, width, trigger]);
  if (!trigger) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => <Particle key={`${trigger}-${i}`} p={p} height={height} trigger={trigger} />)}
    </View>
  );
}

const styles = StyleSheet.create({ piece: { position: 'absolute', top: 0 } });
