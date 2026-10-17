import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '@/core/theme';
import { AppText } from '@/core/ui';

/** Ton çalarken nefes alan büyük daire. */
export function PulseCircle({ playing, label }: { playing: boolean; label: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const halo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!playing) {
      scale.stopAnimation();
      halo.stopAnimation();
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
      return;
    }
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.18, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 420, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(halo, { toValue: 1, duration: 840, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(halo, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [playing, scale, halo]);

  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.halo, { transform: [{ scale: haloScale }], opacity: haloOpacity }]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient colors={[...gradients.sunset]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.circle}>
          <Ionicons name={playing ? 'volume-high' : 'ear'} size={44} color={colors.white} />
          <AppText variant="h2" color={colors.white} style={{ marginTop: 6 }}>{label}</AppText>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', height: 240 },
  halo: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: colors.coral },
  circle: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center' },
});
