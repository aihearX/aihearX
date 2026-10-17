import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '@/core/theme';
import { AppText } from '@/core/ui';

/** Çalma sırasında nabız gibi atan büyük halka; durunca sakinleşir. */
export function PulseRing({ playing, label, sub }: { playing: boolean; label: string; sub?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!playing) {
      [scale, ring1, ring2].forEach((v) => v.stopAnimation());
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
      return;
    }
    const ring = (v: Animated.Value, delay: number) => Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: 1, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    const loop = Animated.parallel([
      Animated.loop(Animated.sequence([
        Animated.timing(scale, { toValue: 1.12, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])),
      ring(ring1, 0),
      ring(ring2, 500),
    ]);
    loop.start();
    return () => loop.stop();
  }, [playing, scale, ring1, ring2]);

  const ringStyle = (v: Animated.Value) => ({
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ringStyle(ring1)]} />
      <Animated.View style={[styles.ring, ringStyle(ring2)]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient colors={[...gradients.sunset]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.circle}>
          <Ionicons name={playing ? 'volume-high' : 'ear'} size={40} color={colors.white} />
          <AppText variant="h2" color={colors.white} style={{ marginTop: 4 }}>{label}</AppText>
          {sub ? <AppText variant="small" color="rgba(255,255,255,0.85)">{sub}</AppText> : null}
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', height: 250 },
  ring: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: 3, borderColor: colors.coral },
  circle: { width: 170, height: 170, borderRadius: 85, alignItems: 'center', justifyContent: 'center' },
});
