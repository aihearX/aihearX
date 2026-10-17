import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, ProgressBar, ShareCard } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { playTone, levelToAmplitude, type Playback } from '@/core/audio';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { useTinnitusStore, fmtFreq, EAR_LABEL, type Ears, type TinnitusType } from './store';
import { Therapy } from './components/Therapy';
import { Tips } from './components/Tips';
import { History } from './components/History';

type Step = 'ear' | 'pitch' | 'loud' | 'type' | 'done';
const STEPS: Step[] = ['ear', 'pitch', 'loud', 'type', 'done'];
const TYPES: { id: TinnitusType; emoji: string; desc: string }[] = [
  { id: 'ton', emoji: '🎵', desc: 'Sabit, temiz bir ses' },
  { id: 'ıslık', emoji: '🎐', desc: 'İnce, tiz bir ıslık' },
  { id: 'uğultu', emoji: '🌊', desc: 'Kalın, dolgun bir uğultu' },
  { id: 'cırcır', emoji: '🦗', desc: 'Cırcır böceği gibi titrek' },
];
const MIN_F = 125, MAX_F = 12000, STEP_F = 1.15;

export default function App({ onResult }: MiniAppProps) {
  const add = useTinnitusStore((s) => s.add);
  const [step, setStep] = useState<Step>('ear');
  const [ears, setEars] = useState<Ears>('both');
  const [freq, setFreq] = useState(4000);
  const [level, setLevel] = useState(40);
  const [type, setType] = useState<TinnitusType>('ton');
  const [playing, setPlaying] = useState(false);
  const playback = useRef<Playback | null>(null);
  useEffect(() => () => { playback.current?.stop(); }, []);

  const play = useCallback(async (f: number, lv: number) => {
    playback.current?.stop();
    setPlaying(true);
    try {
      const p = await playTone({ freq: f, duration: 1, amplitude: lv >= 0 ? levelToAmplitude(lv) : 0.4, ear: ears, ramp: 0.04 });
      playback.current = p;
      await p.done;
    } catch { /* */ }
    setPlaying(false);
  }, [ears]);

  const adjustFreq = (up: boolean) => {
    const next = Math.max(MIN_F, Math.min(MAX_F, up ? freq * STEP_F : freq / STEP_F));
    setFreq(next);
    play(next, -1).catch(() => {});
  };
  const adjustLevel = (up: boolean) => {
    const next = Math.max(0, Math.min(80, level + (up ? 5 : -5)));
    setLevel(next);
    play(freq, next).catch(() => {});
  };

  const save = (t: TinnitusType) => {
    setType(t);
    add({ ears, freq: Math.round(freq), level, type: t });
    setStep('done');
    onResult({ label: fmtFreq(freq), xp: 20, shareText: shareText(freq, t), meta: { freq: Math.round(freq), level, type: t, ears } });
  };
  const restart = () => { playback.current?.stop(); setFreq(4000); setLevel(40); setStep('ear'); };
  const stepIdx = STEPS.indexOf(step);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {step !== 'done' ? (
        <View style={{ marginBottom: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <AppText variant="small" muted>Adım {stepIdx + 1} / 4</AppText>
            <AppText variant="small" muted>Kulaklık önerilir</AppText>
          </View>
          <ProgressBar value={(stepIdx + 1) / 4} gradient={gradients.violet} />
        </View>
      ) : null}

      {step === 'ear' ? (
        <Animated.View entering={FadeInDown}>
          <AppText variant="h1">Çınlama hangi kulakta?</AppText>
          <AppText muted style={{ marginTop: 4 }}>Sesi o kulağa (ya da ikisine) göndereceğiz; böylece karşılaştırmak kolaylaşır.</AppText>
          <View style={{ gap: 10, marginTop: space.xl }}>
            {(['left', 'right', 'both'] as Ears[]).map((e) => (
              <Card key={e} onPress={() => setEars(e)} style={{ ...styles.option, ...(ears === e ? { borderColor: colors.accent } : {}) }}>
                <AppText style={{ fontSize: 28 }}>{e === 'left' ? '👈' : e === 'right' ? '👉' : '🙌'}</AppText>
                <AppText variant="h3" style={{ flex: 1 }}>{EAR_LABEL[e]}</AppText>
                {ears === e ? <Chip label="Seçili" small active /> : null}
              </Card>
            ))}
          </View>
          <Button title="Devam" size="lg" icon="arrow-forward" gradient={gradients.violet} style={{ marginTop: space.xl }} onPress={() => { setStep('pitch'); play(freq, -1).catch(() => {}); }} />
        </Animated.View>
      ) : null}

      {step === 'pitch' ? (
        <Animated.View entering={FadeInDown}>
          <AppText variant="h1">İnceliği bul</AppText>
          <AppText muted style={{ marginTop: 4 }}>Çalan ses çınlamandan daha mı ince, daha mı kalın? "Bu!" diyene kadar ayarla.</AppText>
          <Card gradient={gradients.violet} style={{ alignItems: 'center', marginTop: space.xl, paddingVertical: space.xl }}>
            <AppText variant="tiny" color="rgba(255,255,255,0.8)">Şu anki ses</AppText>
            <AppText color={colors.white} style={styles.big}>{fmtFreq(freq)}</AppText>
            <Button title={playing ? 'Çalıyor...' : 'Tekrar dinle'} variant="secondary" size="sm" icon="play" onPress={() => play(freq, -1)} />
          </Card>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
            <Button title="Daha kalın" variant="secondary" size="lg" icon="arrow-down" style={{ flex: 1 }} disabled={freq <= MIN_F} onPress={() => adjustFreq(false)} />
            <Button title="Daha ince" variant="secondary" size="lg" icon="arrow-up" style={{ flex: 1 }} disabled={freq >= MAX_F} onPress={() => adjustFreq(true)} />
          </View>
          <Button title="Bu! Çınlamam buna benziyor" size="lg" icon="checkmark" gradient={gradients.mint} style={{ marginTop: space.md }} onPress={() => { setStep('loud'); play(freq, level).catch(() => {}); }} />
        </Animated.View>
      ) : null}

      {step === 'loud' ? (
        <Animated.View entering={FadeInDown}>
          <AppText variant="h1">Yüksekliği bul</AppText>
          <AppText muted style={{ marginTop: 4 }}>Şimdi aynı tonu çınlamanla aynı yükseklikte duyana kadar ayarla. Değerler göreli, kalibre değil.</AppText>
          <Card gradient={gradients.violet} style={{ alignItems: 'center', marginTop: space.xl, paddingVertical: space.xl }}>
            <AppText variant="tiny" color="rgba(255,255,255,0.8)">{fmtFreq(freq)} · göreli seviye</AppText>
            <AppText color={colors.white} style={styles.big}>{level} dB</AppText>
            <View style={{ alignSelf: 'stretch', marginVertical: 10 }}><ProgressBar value={level / 80} gradient={gradients.sunset} /></View>
            <Button title={playing ? 'Çalıyor...' : 'Tekrar dinle'} variant="secondary" size="sm" icon="play" onPress={() => play(freq, level)} />
          </Card>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
            <Button title="Daha kısık" variant="secondary" size="lg" icon="volume-low" style={{ flex: 1 }} disabled={level <= 0} onPress={() => adjustLevel(false)} />
            <Button title="Daha yüksek" variant="secondary" size="lg" icon="volume-high" style={{ flex: 1 }} disabled={level >= 80} onPress={() => adjustLevel(true)} />
          </View>
          <Button title="Bu! Aynı yükseklikte" size="lg" icon="checkmark" gradient={gradients.mint} style={{ marginTop: space.md }} onPress={() => setStep('type')} />
        </Animated.View>
      ) : null}

      {step === 'type' ? (
        <Animated.View entering={FadeInDown}>
          <AppText variant="h1">Sesin türü ne?</AppText>
          <AppText muted style={{ marginTop: 4 }}>En çok hangisine benziyor? Seçince profilin kaydedilir.</AppText>
          <View style={{ gap: 10, marginTop: space.xl }}>
            {TYPES.map((t) => (
              <Card key={t.id} onPress={() => save(t.id)} style={styles.option}>
                <AppText style={{ fontSize: 28 }}>{t.emoji}</AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="h3">{t.id.charAt(0).toLocaleUpperCase('tr') + t.id.slice(1)}</AppText>
                  <AppText variant="small" muted>{t.desc}</AppText>
                </View>
              </Card>
            ))}
          </View>
        </Animated.View>
      ) : null}

      {step === 'done' ? (
        <Animated.View entering={FadeInDown}>
          <ShareCard title={`${fmtFreq(freq)} · ${type}`} subtitle={`${EAR_LABEL[ears]} · göreli ${level} dB`} gradient={gradients.violet} shareText={shareText(freq, type)} makerName={SEBAHATTIN.name}>
            <AppText variant="small" color="rgba(255,255,255,0.85)">Çınlamamı eşleştirdim; klinisyenime bu profili göstereceğim.</AppText>
          </ShareCard>
          <Card style={{ marginTop: space.lg }}>
            <AppText variant="h3">Profilin kaydedildi ✓</AppText>
            <AppText muted style={{ marginTop: 4 }}>Bu değerler telefon ve kulaklığa göre değişir; tanı değil, klinisyeninle konuşmayı kolaylaştıran bir not. Bu uygulama tıbbi tanı yerine geçmez.</AppText>
            <Button title="Yeniden eşleştir" variant="secondary" icon="refresh" style={{ marginTop: space.md }} onPress={restart} />
          </Card>
        </Animated.View>
      ) : null}

      <View style={{ marginTop: space.xl, gap: 16 }}>
        <Therapy />
        <History />
        <Tips />
      </View>
    </ScrollView>
  );
}

const shareText = (f: number, t: TinnitusType) => `Çınlamam ${fmtFreq(f)}'de bir ${t} 🎧 Sen çınlamanı buldun mu? aihearX`;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  big: { fontSize: 48, fontWeight: '800', lineHeight: 56, marginVertical: 6 },
});
