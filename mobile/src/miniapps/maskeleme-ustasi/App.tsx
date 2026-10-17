import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Card, Chip } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { Calculator } from './components/Calculator';
import { Practice } from './components/Practice';

type Mode = 'hesapla' | 'pratik';

export default function App({ onResult }: MiniAppProps) {
  const [mode, setMode] = useState<Mode>('hesapla');

  const onSave = useCallback((label: string) => {
    onResult({ label, xp: 25, points: 10, meta: { mode: 'hesapla' } });
  }, [onResult]);
  const onFinish = useCallback((correct: number, total: number) => {
    onResult({ score: Math.round((correct / total) * 100), label: `Pratik ${correct}/${total}`, xp: 25, points: correct * 10, shareText: `Maskeleme Ustası pratiğinde ${correct}/${total} yaptım. aihearX` });
  }, [onResult]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.mint} style={{ marginBottom: space.md }}>
          <AppText variant="tiny" color="rgba(255,255,255,0.8)">HOOD PLATO · IA · OKLÜZYON</AppText>
          <AppText variant="h2" color={colors.white} style={{ marginTop: 4 }}>Maske gerekli mi, kaç dB ile başlamalı?</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>Eğitim amaçlı basitleştirilmiş model; klinik kararın yerine geçmez.</AppText>
        </Card>
      </Animated.View>
      <View style={styles.tabs}>
        <Chip label="Hesapla" icon="calculator" active={mode === 'hesapla'} onPress={() => setMode('hesapla')} color={colors.accent} />
        <Chip label="Pratik" icon="flash" active={mode === 'pratik'} onPress={() => setMode('pratik')} color={colors.accent} />
      </View>
      {mode === 'hesapla' ? <Calculator onSave={onSave} /> : <Practice onFinish={onFinish} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: space.md },
});
