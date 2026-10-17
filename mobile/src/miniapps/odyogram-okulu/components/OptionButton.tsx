import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';

type State = 'idle' | 'correct' | 'wrong' | 'dim' | 'reveal';

/** Dört/altı şıklı soru butonu: cevaptan sonra doğru yeşil, yanlış kırmızı, doğru-olan "reveal" ile vurgulanır. */
export function OptionButton({ label, state, onPress, index = 0 }: { label: string; state: State; onPress?: () => void; index?: number }) {
  const bg = state === 'correct' || state === 'reveal' ? 'rgba(74,222,128,0.16)' : state === 'wrong' ? 'rgba(255,92,92,0.14)' : colors.surface;
  const border = state === 'correct' || state === 'reveal' ? colors.mint : state === 'wrong' ? colors.red : colors.border;
  const icon = state === 'correct' || state === 'reveal' ? 'checkmark-circle' : state === 'wrong' ? 'close-circle' : null;
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify().damping(16)}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.btn, { backgroundColor: bg, borderColor: border, opacity: state === 'dim' ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
      >
        <AppText variant="bodyStrong" style={{ flex: 1 }}>{label}</AppText>
        {icon ? <Ionicons name={icon} size={20} color={border} /> : <View style={styles.dot} />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 14, paddingHorizontal: space.lg, borderRadius: radius.md, borderWidth: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: colors.borderStrong },
});
