import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Card, ProgressBar, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { compute, randomScenario, TRANSDUCER_LABEL, type Inputs, type Result } from '../logic';
import { OptionButton } from './OptionButton';

const TOTAL = 5;
type Scenario = { inp: Inputs; r: Result; levelOptions: number[] };
type Step = 'need' | 'level' | 'feedback';

function makeScenario(): Scenario {
  const inp = randomScenario();
  const r = compute(inp);
  const set = new Set<number>([r.initial]);
  const cands = [r.initial - 10, r.initial + 10, r.initial - 20, r.initial + 20, r.initial + 5, r.initial - 5];
  for (const c of cands) { if (set.size >= 4) break; if (c >= 0) set.add(c); }
  return { inp, r, levelOptions: [...set].sort((a, b) => a - b) };
}

export function Practice({ onFinish }: { onFinish: (correct: number, total: number) => void }) {
  const [sc, setSc] = useState<Scenario>(() => makeScenario());
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<Step>('need');
  const [needPick, setNeedPick] = useState<boolean | null>(null);
  const [levelPick, setLevelPick] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [done, setDone] = useState(false);
  const { inp, r } = sc;
  const maxPoints = TOTAL * 2;

  const answerNeed = (v: boolean) => {
    setNeedPick(v);
    const ok = v === r.needed;
    if (ok) setPoints((p) => p + 1);
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    // Maske gerekmiyorsa seviye sorusu atlanır (tam puan)
    if (!r.needed) { setPoints((p) => p + 1); setStep('feedback'); } else setStep('level');
  };
  const answerLevel = (v: number) => {
    setLevelPick(v);
    const ok = v === r.initial;
    if (ok) setPoints((p) => p + 1);
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    setStep('feedback');
  };
  const next = useCallback(() => {
    if (idx + 1 >= TOTAL) { setDone(true); onFinish(points, maxPoints); return; }
    setIdx(idx + 1); setSc(makeScenario()); setStep('need'); setNeedPick(null); setLevelPick(null);
  }, [idx, points, maxPoints, onFinish]);

  if (done) {
    const ratio = points / maxPoints;
    return (
      <Animated.View entering={FadeInDown.springify()} style={{ gap: space.md }}>
        <Card gradient={ratio >= 0.8 ? gradients.gold : gradients.mint}>
          <AppText variant="tiny" color="rgba(255,255,255,0.8)">PRATİK TAMAMLANDI</AppText>
          <AppText variant="display" color={colors.white}>{points}/{maxPoints}</AppText>
          <AppText variant="body" color="rgba(255,255,255,0.9)">{ratio === 1 ? 'Kusursuz! Kabinde kafadan hesaplayanlardansın.' : ratio >= 0.7 ? 'Sağlam. Oklüzyon etkisini ve IA farkını bir daha gözden geçir.' : 'Formülleri "Hesapla" sekmesindeki adımlardan takip et, tekrar dene.'}</AppText>
        </Card>
        <View style={styles.row}>
          <Stat label="Puan" value={points} icon="trophy" color={colors.amber} />
          <Stat label="Senaryo" value={TOTAL} icon="layers" />
        </View>
        <Button title="Yeni Pratik" icon="refresh" onPress={() => { setIdx(0); setSc(makeScenario()); setStep('need'); setNeedPick(null); setLevelPick(null); setPoints(0); setDone(false); }} />
      </Animated.View>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.row}>
        <AppText variant="small" muted style={{ flex: 1 }}>Senaryo {idx + 1}/{TOTAL}</AppText>
        <AppText variant="small" color={colors.amber}>{points} puan</AppText>
      </View>
      <ProgressBar value={idx / TOTAL} gradient={gradients.mint} />
      <Animated.View key={idx} entering={FadeIn.duration(250)}>
        <Card>
          <AppText variant="tiny" color={colors.accent2}>{inp.test === 'AC' ? 'HAVA YOLU' : 'KEMİK YOLU'} · {inp.freq} Hz · {TRANSDUCER_LABEL[inp.transducer].toUpperCase()} (IA {r.ia})</AppText>
          <View style={styles.grid}>
            <View style={styles.cell}><AppText variant="tiny" color={colors.earRight}>TEST KULAĞI</AppText><AppText variant="body">AC {inp.acTest} · BC {inp.bcTest}</AppText></View>
            <View style={styles.cell}><AppText variant="tiny" color={colors.earLeft}>TEST DIŞI</AppText><AppText variant="body">AC {inp.acNon} · BC {inp.bcNon}</AppText></View>
          </View>
        </Card>
      </Animated.View>

      <AppText variant="h3">{step === 'level' ? 'Başlangıç maske seviyesi?' : 'Maskeleme gerekli mi?'}</AppText>
      {step === 'need' || (step === 'feedback' && needPick != null && levelPick == null) ? (
        <View style={{ gap: space.sm }}>
          {[true, false].map((v, i) => {
            const label = v ? 'Evet, gerekli' : 'Hayır, gerekmez';
            const state = needPick == null ? 'idle' : v === r.needed ? (needPick === v ? 'correct' : 'reveal') : needPick === v ? 'wrong' : 'dim';
            return <OptionButton key={label} label={label} index={i} state={state} onPress={needPick == null ? () => answerNeed(v) : undefined} />;
          })}
        </View>
      ) : null}
      {step === 'level' || levelPick != null ? (
        <View style={{ gap: space.sm }}>
          {sc.levelOptions.map((v, i) => {
            const state = levelPick == null ? 'idle' : v === r.initial ? (levelPick === v ? 'correct' : 'reveal') : levelPick === v ? 'wrong' : 'dim';
            return <OptionButton key={v} label={`${v} dB EM`} index={i} state={state} onPress={levelPick == null ? () => answerLevel(v) : undefined} />;
          })}
        </View>
      ) : null}
      {step === 'feedback' ? (
        <Animated.View entering={FadeInDown.springify()} style={{ gap: space.md }}>
          <Card style={{ borderColor: colors.accent2 }}>
            <AppText variant="bodyStrong" color={colors.accent2}>{r.needed ? `Maske gerekli · başlangıç ${r.initial} dB EM · maks ${r.max}` : 'Maske gerekmez'}</AppText>
            {r.steps.map((s, i) => <AppText key={i} variant="small" muted style={{ marginTop: 4 }}>• {s}</AppText>)}
          </Card>
          <Button title={idx + 1 < TOTAL ? 'Sonraki Senaryo' : 'Bitir'} icon="arrow-forward" onPress={next} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  grid: { flexDirection: 'row', gap: 8, marginTop: space.sm },
  cell: { flex: 1, backgroundColor: colors.surfaceStrong, borderRadius: 12, padding: 10 },
});
