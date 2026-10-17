import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOutUp, ZoomIn } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { PAD_COLORS } from '../logic';

const GLYPHS = ['♪', '♫', '♪', '♬', '♪'];

/** Cümle tamamlanınca pad alanının ortasından yükselen küçük "♪" patlaması. */
export function NoteBurst({ trigger }: { trigger: number }) {
  // Gösterim trigger'dan türetilir; zamanlayıcı yalnız "bu tetik söndü" bilgisini yazar.
  const [doneFor, setDoneFor] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const t = setTimeout(() => setDoneFor(trigger), 1100);
    return () => clearTimeout(t);
  }, [trigger]);
  if (!trigger || doneFor === trigger) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {GLYPHS.map((g, i) => (
        <Animated.View key={`${trigger}-${i}`} entering={ZoomIn.delay(i * 70).duration(220)} exiting={FadeOutUp.duration(500)}>
          <View style={{ transform: [{ translateX: (i - 2) * 34 }, { translateY: (i % 2) * -22 }] }}>
            <AppText style={{ fontSize: 30 + (i % 3) * 6, lineHeight: 44 }} color={PAD_COLORS[(i * 3) % PAD_COLORS.length]}>{g}</AppText>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { position: 'absolute', top: '38%', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', zIndex: 6 } });
