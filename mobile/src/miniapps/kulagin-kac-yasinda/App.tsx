import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Card, Chip, ProgressBar } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { playTone, type Playback } from '@/core/audio';
import type { MiniAppProps } from '@/core/registry/types';
import { TEST_FREQS, TONE_DURATION, TONE_AMPLITUDE, estimateAge, kHz, type AgeEstimate } from './data';
import { PulseCircle } from './components/PulseCircle';
import { Result } from './components/Result';

type Phase = 'intro' | 'headphone' | 'volume' | 'test' | 'result';

export default function App({ onResult }: MiniAppProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [estimate, setEstimate] = useState<AgeEstimate | null>(null);
  const [highest, setHighest] = useState<number | null>(null);
  const [checked, setChecked] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const current = useRef<Playback | null>(null);
  const stopCurrent = useCallback(() => { current.current?.stop(); current.current = null; setPlaying(false); }, []);
  useEffect(() => () => { current.current?.stop(); }, []);

  const playFreq = useCallback(async (freq: number) => {
    stopCurrent();
    setPlaying(true);
    try {
      const p = await playTone({ freq, duration: TONE_DURATION, amplitude: TONE_AMPLITUDE, ramp: 0.05 });
      current.current = p;
      await p.done;
    } catch { /* ses çalınamadı */ }
    setPlaying(false);
    setPlayed(true);
  }, [stopCurrent]);

  const earCheck = useCallback(async (ear: 'left' | 'right') => {
    stopCurrent();
    setPlaying(true);
    try {
      const p = await playTone({ freq: 1000, duration: 0.6, amplitude: 0.4, ear, kind: 'warble' });
      current.current = p;
      await p.done;
    } catch { /* */ }
    setPlaying(false);
    setChecked((c) => ({ ...c, [ear]: true }));
  }, [stopCurrent]);

  // test aşamasında her yeni frekansı otomatik çal
  useEffect(() => {
    if (phase !== 'test') return;
    setPlayed(false);
    const t = setTimeout(() => { playFreq(TEST_FREQS[idx]!).catch(() => {}); }, 400);
    return () => clearTimeout(t);
  }, [phase, idx, playFreq]);

  const finish = useCallback((heard: number | null) => {
    stopCurrent();
    const est = estimateAge(heard);
    setHighest(heard);
    setEstimate(est);
    setPhase('result');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onResult({ score: est.age, label: `${est.age} yaş`, xp: 25, shareText: shareTextFor(est.age), meta: { highestHeard: heard } });
  }, [onResult, stopCurrent]);

  const answer = (heard: boolean) => {
    if (heard) { finish(TEST_FREQS[idx]!); return; }
    if (idx >= TEST_FREQS.length - 1) { finish(null); return; }
    setIdx((i) => i + 1);
  };

  const restart = () => { stopCurrent(); setIdx(0); setEstimate(null); setHighest(null); setPhase('intro'); };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {phase === 'intro' ? (
        <Animated.View entering={FadeInDown}>
          <Card gradient={gradients.sunset} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
            <AppText style={{ fontSize: 64 }}>👂</AppText>
            <AppText variant="h1" color={colors.white} center>Kulağın kaç yaşında?</AppText>
            <AppText color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>Yaş ilerledikçe en tiz sesler ilk vedalaşan seslerdir. 9 tonda kulağının yaşını tahmin edelim.</AppText>
          </Card>
          <Card style={{ marginTop: space.lg }}>
            <Step n="1" text="Kulaklık tak (hoparlör tizleri iyi vermez)." />
            <Step n="2" text="Sessiz bir yerde ol." />
            <Step n="3" text="Her ton için 'Duydun mu?' sorusuna dürüstçe cevap ver." />
          </Card>
          <AppText variant="small" faint center style={{ marginTop: space.md }}>Bu bir oyundur; tıbbi tanı yerine geçmez.</AppText>
          <Button title="Başlayalım" size="lg" icon="play" gradient={gradients.sunset} style={{ marginTop: space.lg }} onPress={() => setPhase('headphone')} />
        </Animated.View>
      ) : null}

      {phase === 'headphone' ? (
        <Animated.View entering={FadeInDown}>
          <AppText variant="h1">Kulaklık kontrolü</AppText>
          <AppText muted style={{ marginTop: 4 }}>Her iki kulağa ayrı ayrı ses gönderelim. Doğru taraftan duyduğundan emin ol.</AppText>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: space.xl }}>
            <Card onPress={() => earCheck('left')} style={{ ...styles.earCard, ...(checked.left ? { borderColor: colors.earLeft } : {}) }}>
              <AppText style={{ fontSize: 40 }}>👈</AppText>
              <AppText variant="h3" color={colors.earLeft}>Sol kulak</AppText>
              <AppText variant="small" muted>{checked.left ? 'Çalındı ✓' : 'Dokun, dinle'}</AppText>
            </Card>
            <Card onPress={() => earCheck('right')} style={{ ...styles.earCard, ...(checked.right ? { borderColor: colors.earRight } : {}) }}>
              <AppText style={{ fontSize: 40 }}>👉</AppText>
              <AppText variant="h3" color={colors.earRight}>Sağ kulak</AppText>
              <AppText variant="small" muted>{checked.right ? 'Çalındı ✓' : 'Dokun, dinle'}</AppText>
            </Card>
          </View>
          <Button title="İkisini de doğru taraftan duydum" size="lg" style={{ marginTop: space.xl }} disabled={!(checked.left && checked.right)} onPress={() => setPhase('volume')} />
          <Button title="Kulaklığım yok, yine de dene" variant="ghost" style={{ marginTop: space.sm }} onPress={() => setPhase('volume')} />
        </Animated.View>
      ) : null}

      {phase === 'volume' ? (
        <Animated.View entering={FadeInDown}>
          <Card gradient={gradients.night} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
            <AppText style={{ fontSize: 56 }}>🔉</AppText>
            <AppText variant="h1" center>Telefon sesini yarıya al</AppText>
            <AppText muted center style={{ marginTop: 8 }}>Yan tuşlarla sesi yaklaşık %50'ye getir. Çok yüksek ses hem sonucu bozar hem kulağı yorar.</AppText>
          </Card>
          <Button title="Yarıya aldım, başla" size="lg" icon="musical-notes" gradient={gradients.sunset} style={{ marginTop: space.xl }} onPress={() => { setIdx(0); setPhase('test'); }} />
        </Animated.View>
      ) : null}

      {phase === 'test' ? (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="small" muted>Ton {idx + 1} / {TEST_FREQS.length}</AppText>
            <Chip label={kHz(TEST_FREQS[idx]!)} small active color={colors.coral} />
          </View>
          <View style={{ marginTop: 8 }}><ProgressBar value={(idx + 1) / TEST_FREQS.length} gradient={gradients.sunset} /></View>
          <PulseCircle playing={playing} label={playing ? 'Dinle...' : 'Duydun mu?'} />
          <AppText variant="h2" center>{playing ? 'Şimdi bir ton çalıyor' : 'Bu tonu duydun mu?'}</AppText>
          <AppText variant="small" muted center style={{ marginTop: 4 }}>Emin değilsen "Tekrar çal". Hiçbir şey duymadıysan "Hayır".</AppText>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: space.xl }}>
            <Button title="Hayır" variant="secondary" size="lg" icon="close" style={{ flex: 1 }} disabled={!played} onPress={() => answer(false)} />
            <Button title="Evet, duydum" size="lg" icon="checkmark" gradient={gradients.mint} style={{ flex: 1.3 }} disabled={!played} onPress={() => answer(true)} />
          </View>
          <Button title="Tekrar çal" variant="ghost" icon="refresh" style={{ marginTop: space.sm }} disabled={playing} onPress={() => playFreq(TEST_FREQS[idx]!)} />
        </View>
      ) : null}

      {phase === 'result' && estimate ? <Result estimate={estimate} highest={highest} shareText={shareTextFor(estimate.age)} onRetry={restart} /> : null}
    </ScrollView>
  );
}

const shareTextFor = (age: number) => `Kulağım ${age} yaşında 👂 Seninki kaç? aihearX`;

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 6 }}>
      <View style={styles.stepDot}><AppText variant="small" color={colors.white}>{n}</AppText></View>
      <AppText style={{ flex: 1 }}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  earCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: space.xl },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
