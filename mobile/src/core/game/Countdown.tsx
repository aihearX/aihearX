import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { ZoomIn, FadeOut } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors } from '@/core/theme';
import { sfx } from './sfx';

/** 3-2-1-Başla geri sayımı. Bitince onDone. */
export function Countdown({ onDone, label = 'Başla!' }: { onDone: () => void; label?: string }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n > 0) { sfx('countdown'); const t = setTimeout(() => setN(n - 1), 800); return () => clearTimeout(t); }
    sfx('go'); const t = setTimeout(onDone, 600); return () => clearTimeout(t);
  }, [n, onDone]);
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View key={n} entering={ZoomIn.duration(250)} exiting={FadeOut.duration(150)}>
        <AppText variant="display" color={colors.accent} style={{ fontSize: n > 0 ? 96 : 44, lineHeight: n > 0 ? 110 : 52 }}>{n > 0 ? n : label}</AppText>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({ wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 10 } });
