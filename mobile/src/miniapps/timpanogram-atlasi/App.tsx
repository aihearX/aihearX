import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Card, Chip } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { Explore } from './components/Explore';
import { Quiz } from './components/Quiz';

type Mode = 'kesfet' | 'tahmin';

export default function App({ onResult }: MiniAppProps) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<Mode>('kesfet');
  const w = Math.min(width - 4 * space.lg, 360);

  const onSave = useCallback((label: string) => onResult({ label, xp: 25, points: 10 }), [onResult]);
  const onFinish = useCallback((correct: number, total: number, best: number) => {
    onResult({ score: Math.round((correct / total) * 100), label: `Tahmin ${correct}/${total}`, xp: 25, points: correct * 10 + best * 2, shareText: `Timpanogram Atlası'nda ${correct}/${total} Jerger tipini doğru bildim. aihearX` });
  }, [onResult]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.violet} style={{ marginBottom: space.md }}>
          <AppText variant="tiny" color="rgba(255,255,255,0.8)">JERGER SINIFLAMASI · 226 Hz</AppText>
          <AppText variant="h2" color={colors.white} style={{ marginTop: 4 }}>Eğriyi oynat, orta kulağı anla</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>Kaydırıcılarla kendi timpanogramını çiz ya da rastgele eğrilerde tipini tahmin et.</AppText>
        </Card>
      </Animated.View>
      <View style={styles.tabs}>
        <Chip label="Keşfet" icon="options" active={mode === 'kesfet'} onPress={() => setMode('kesfet')} color={colors.accent} />
        <Chip label="Tahmin Et" icon="flash" active={mode === 'tahmin'} onPress={() => setMode('tahmin')} color={colors.accent} />
      </View>
      {mode === 'kesfet' ? <Explore width={w} onSave={onSave} /> : <Quiz width={w} onFinish={onFinish} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: space.md },
});
