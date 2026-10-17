import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, Chip } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { TEST_FREQS, kHz } from './data';
import { useEarAgeStore } from './store';
import { useEarAge } from './useEarAge';
import { Intro } from './components/Intro';
import { HeadphoneCheck, VolumeGuide } from './components/HeadphoneCheck';
import { PulseRing } from './components/PulseRing';
import { Ladder } from './components/Ladder';
import { Result } from './components/Result';

/**
 * Kulağın Kaç Yaşında? — 17→8 kHz tonlar, 2 sessiz tuzak, dürüstlük kontrolü, paylaşılabilir "kulak yaşı".
 * Akış: intro → kulaklık kontrolü → ses rehberi → test → sonuç (geçmiş + trend).
 */
export default function App({ onResult }: MiniAppProps) {
  const t = useEarAge(onResult);
  const history = useEarAgeStore((s) => s.history);
  const setWarble = useEarAgeStore((s) => s.setWarble);

  if (t.phase === 'intro') return <Intro last={history[0] ?? null} onStart={() => t.setPhase('headphone')} />;

  const currentFreq = t.currentTrial?.kind === 'tone' ? t.currentTrial.freq : null;
  const trialLabel = t.playing ? 'Dinle...' : t.played ? 'Duydun mu?' : 'Hazır';

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {t.phase === 'headphone' ? (
        <HeadphoneCheck checked={t.checked} playing={t.playing} onPlay={t.earCheck} onConfirm={t.confirmEar} onNext={() => t.setPhase('volume')} onSkip={() => t.setPhase('volume')} />
      ) : null}

      {t.phase === 'volume' ? <VolumeGuide warble={t.warble} onWarble={setWarble} onStart={t.beginTest} /> : null}

      {t.phase === 'test' ? (
        <View>
          <View style={styles.topRow}>
            <AppText variant="small" muted>Basamak {Math.min(t.toneIndex, TEST_FREQS.length)} / {TEST_FREQS.length}</AppText>
            <Chip label={currentFreq ? kHz(currentFreq) : 'Dinle'} small active color={colors.coral} icon="musical-note" />
          </View>
          <View style={{ marginTop: 10 }}><Ladder marks={t.marks} currentFreq={currentFreq} /></View>
          <PulseRing playing={t.playing} label={trialLabel} sub={t.playing ? 'Ton çalıyor' : undefined} />
          <AppText variant="h2" center>{t.playing ? 'Şimdi bir ton çalıyor' : 'Bu tonu duydun mu?'}</AppText>
          <AppText variant="small" muted center style={{ marginTop: 4 }}>Emin değilsen bir kez tekrar dinle. Hiçbir şey duymadıysan "Duymadım".</AppText>
          {t.honesty ? (
            <Animated.View entering={FadeInDown} exiting={FadeOut}>
              <Card style={{ marginTop: space.md, borderColor: colors.amber, backgroundColor: colors.surface }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Ionicons name="happy-outline" size={20} color={colors.amber} />
                  <AppText variant="bodyStrong" style={{ flex: 1 }}>{t.honesty}</AppText>
                  <Button title="Tamam" size="sm" variant="ghost" onPress={t.dismissHonesty} />
                </View>
              </Card>
            </Animated.View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: space.xl }}>
            <Button title="Duymadım" variant="secondary" size="lg" icon="close" style={{ flex: 1 }} disabled={!t.played || t.playing} onPress={() => t.answer(false)} />
            <Button title="Duydum" size="lg" icon="checkmark" gradient={gradients.mint} style={{ flex: 1.2 }} disabled={!t.played || t.playing} onPress={() => t.answer(true)} />
          </View>
          <Button title={t.replays > 0 ? 'Tekrar çal (1 hak)' : 'Tekrar hakkı bitti'} variant="ghost" icon="refresh" style={{ marginTop: space.sm }} disabled={t.playing || t.replays <= 0} onPress={t.replay} />
          <AppText variant="tiny" faint center style={{ marginTop: space.sm }}>Arada sessiz denemeler var; dürüst cevap sonucu doğru yapar.</AppText>
        </View>
      ) : null}

      {t.phase === 'result' && t.outcome ? <Result outcome={t.outcome} history={history} onRetry={t.restart} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
