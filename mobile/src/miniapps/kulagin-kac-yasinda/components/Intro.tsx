import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card, Chip } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { EarIllustration } from './EarIllustration';
import { fmtDate, type EarAgeEntry } from '../store';

/** Giriş: animasyonlu kulak, 3 adım, tek cümle, Başla. */
export function Intro({ last, onStart }: { last: EarAgeEntry | null; onStart: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(350)} style={{ alignItems: 'center' }}>
        <EarIllustration size={190} />
        <AppText variant="display" center style={{ marginTop: space.sm }}>Kulağın kaç yaşında?</AppText>
        <AppText muted center style={{ marginTop: 6, paddingHorizontal: 8 }}>Yaş ilerledikçe ilk veda eden sesler en tizlerdir. 17 kHz'den aşağı inen tonlarla kulağının "yaşını" tahmin edelim.</AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120)} style={styles.steps}>
        <Chip label="1 · Kulaklık tak" icon="headset" active color={colors.accent} />
        <Chip label="2 · Sesi yarıya al" icon="volume-medium" active color={colors.accent2} />
        <Chip label="3 · Dürüst cevapla" icon="happy" active color={colors.coral} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={{ marginTop: space.lg }}>
        <Button title="Başlayalım" size="lg" icon="play" gradient={gradients.sunset} onPress={onStart} />
        <AppText variant="small" faint center style={{ marginTop: space.sm }}>Kulaklıkla daha iyi. Ses göreli, test değil.</AppText>
      </Animated.View>

      {last ? (
        <Animated.View entering={FadeInDown.delay(280)}>
          <Card style={{ marginTop: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AppText style={{ fontSize: 34, lineHeight: 40 }}>👂</AppText>
              <View style={{ flex: 1 }}>
                <AppText variant="h3">Son sonucun: {last.age} yaş</AppText>
                <AppText variant="small" muted>{fmtDate(last.at)}{last.lowConfidence ? ' · düşük güven' : ''}</AppText>
              </View>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(340)}>
        <Card style={{ marginTop: space.lg }}>
          <AppText variant="h3">Neden tizler?</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>Kokleanın girişindeki tüy hücreleri en tiz sesleri algılar ve yıllar içinde ilk yıpranan onlardır. Bu yüzden duyabildiğin en tiz ses, yaşla kabaca ilişkilidir. Eğlenceli bir tahmin; tanı değil.</AppText>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  steps: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: space.lg },
});
