import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';

type Props = { front: string; back: string; deckName: string; color: string; flipped: boolean; onFlip: () => void; box: number };

/** 3B çevrilen kart: ön yüz soru, arka yüz cevap. */
export function FlipCard({ front, back, deckName, color, flipped, onFlip, box }: Props) {
  const rot = useSharedValue(0);
  useEffect(() => { rot.value = withTiming(flipped ? 180 : 0, { duration: 420, easing: Easing.inOut(Easing.cubic) }); }, [flipped, rot]);
  const frontStyle = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${rot.value}deg` }], opacity: interpolate(rot.value, [0, 89, 90], [1, 1, 0]) }));
  const backStyle = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateY: `${rot.value + 180}deg` }], opacity: interpolate(rot.value, [90, 91, 180], [0, 1, 1]) }));

  const face = (label: string, text: string, isBack: boolean) => (
    <View style={[styles.face, isBack && { borderColor: color, backgroundColor: 'rgba(255,255,255,0.08)' }]}>
      <View style={styles.faceHead}>
        <View style={[styles.deckPill, { backgroundColor: color }]}><AppText variant="tiny" color={colors.white}>{deckName}</AppText></View>
        <View style={styles.boxRow}>
          {[1, 2, 3, 4, 5].map((b) => <View key={b} style={[styles.boxDot, b <= box && { backgroundColor: color, borderColor: color }]} />)}
        </View>
      </View>
      <AppText variant="tiny" faint style={{ marginTop: space.md }}>{label}</AppText>
      <AppText variant={isBack ? 'body' : 'h3'} style={{ marginTop: 6, flex: 1 }} color={isBack ? colors.text : colors.text}>{text}</AppText>
      <View style={styles.hint}>
        <Ionicons name="swap-horizontal" size={14} color={colors.textFaint} />
        <AppText variant="tiny" faint>{isBack ? 'Soruya dön' : 'Çevirmek için dokun'}</AppText>
      </View>
    </View>
  );

  return (
    <Pressable onPress={onFlip} style={styles.wrap}>
      <Animated.View style={[styles.layer, frontStyle]} pointerEvents="none">{face('SORU', front, false)}</Animated.View>
      <Animated.View style={[styles.layer, backStyle]} pointerEvents="none">{face('CEVAP', back, true)}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 300 },
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden' },
  face: { flex: 1, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: space.xl },
  faceHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deckPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  boxRow: { flexDirection: 'row', gap: 4 },
  boxDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.borderStrong },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md },
});
