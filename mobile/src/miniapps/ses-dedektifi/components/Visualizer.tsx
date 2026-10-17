import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/core/ui';
import { colors, gradients, radius } from '@/core/theme';

const BAR_COUNT = 16;
const BAR_H = 72;

/** Tek çubuk: her tik'te rastgele yüksekliğe yumuşakça gider. */
function Bar({ tick, playing, index }: { tick: number; playing: boolean; index: number }) {
  const h = useSharedValue(0.12);
  useEffect(() => {
    // kenarlar alçak, orta yüksek: doğal "spektrum" silüeti
    const center = 1 - Math.abs(index - (BAR_COUNT - 1) / 2) / (BAR_COUNT / 2);
    const target = playing ? 0.18 + Math.random() * (0.35 + 0.5 * center) : 0.12;
    h.value = withTiming(target, { duration: playing ? 140 : 300, easing: Easing.out(Easing.quad) });
  }, [tick, playing, index, h]);
  const style = useAnimatedStyle(() => ({ height: BAR_H * h.value }));
  return <Animated.View style={[styles.bar, style]} />;
}

/** Ses çalarken nabız gibi atan büyük "dinle" görselleştiricisi. */
export function Visualizer({ playing, label, sublabel }: { playing: boolean; label: string; sublabel?: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), 150);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <LinearGradient colors={[...(playing ? gradients.violet : gradients.night)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.box}>
      <View style={styles.head}>
        <AppText style={{ fontSize: 30 }}>{playing ? '🔊' : '🔍'}</AppText>
        <View style={{ flex: 1 }}>
          <AppText variant="h2" color={colors.white}>{label}</AppText>
          {sublabel ? <AppText variant="small" color="rgba(255,255,255,0.8)">{sublabel}</AppText> : null}
        </View>
      </View>
      <View style={styles.bars}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => <Bar key={i} tick={tick} playing={playing} index={i} />)}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius.xl, padding: 18, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: BAR_H },
  bar: { width: 9, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.9)' },
});
