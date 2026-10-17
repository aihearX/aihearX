import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Card, ProgressBar, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import { classify, randomTymp, TYPES, TYPE_HINT, type JergerType, type Tymp } from '../logic';
import { OptionButton } from './OptionButton';
import { TympCurve } from './TympCurve';

const TOTAL = 10;
type Q = { tymp: Tymp; type: JergerType };

export function Quiz({ width, onFinish }: { width: number; onFinish: (correct: number, total: number, best: number) => void }) {
  const [q, setQ] = useState<Q>(() => randomTymp());
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<JergerType | null>(null);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(false);
  const cls = classify(q.tymp);

  const choose = (t: JergerType) => {
    if (picked) return;
    setPicked(t);
    const ok = t === q.type;
    if (ok) { setCorrect((c) => c + 1); const s = streak + 1; setStreak(s); setBest((b) => Math.max(b, s)); } else setStreak(0);
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
  };
  const next = () => {
    if (idx + 1 >= TOTAL) { setDone(true); onFinish(correct, TOTAL, best); return; }
    setIdx(idx + 1); setQ(randomTymp()); setPicked(null);
  };
  const restart = () => { setIdx(0); setQ(randomTymp()); setPicked(null); setCorrect(0); setStreak(0); setBest(0); setDone(false); };

  if (done) {
    return (
      <Animated.View entering={FadeInDown.springify()} style={{ gap: space.md }}>
        <ShareCard title={`${correct}/${TOTAL}`} subtitle="Timpanogram Atlası · Tahmin Et" gradient={correct === TOTAL ? gradients.gold : gradients.violet} makerName={SEBAHATTIN.name} shareText={`Timpanogram Atlası'nda ${correct}/${TOTAL} Jerger tipini doğru bildim. aihearX`}>
          <AppText variant="body" color="rgba(255,255,255,0.9)">{correct === TOTAL ? 'Kusursuz! Orta kulak senin için şeffaf.' : correct >= 7 ? 'Çok iyi. Tip As ile B arasındaki sınıra dikkat.' : 'Keşfet sekmesinde kaydırıcılarla oyna, sonra tekrar dene.'}</AppText>
        </ShareCard>
        <View style={styles.row}>
          <Stat label="Doğru" value={correct} icon="checkmark-circle" color={colors.mint} />
          <Stat label="Seri" value={best} icon="flame" color={colors.amber} />
        </View>
        <Button title="Tekrar Oyna" icon="refresh" onPress={restart} />
      </Animated.View>
    );
  }

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.row}>
        <AppText variant="small" muted style={{ flex: 1 }}>Soru {idx + 1}/{TOTAL}</AppText>
        <AppText variant="small" color={colors.amber}>🔥 {streak}</AppText>
        <AppText variant="small" color={colors.mint}>{correct} doğru</AppText>
      </View>
      <ProgressBar value={(idx + (picked ? 1 : 0)) / TOTAL} gradient={gradients.violet} />
      <Animated.View key={idx} entering={FadeIn.duration(250)}>
        <Card style={{ alignItems: 'center' }}>
          <AppText variant="h3" style={{ alignSelf: 'flex-start', marginBottom: space.sm }}>Bu timpanogram hangi Jerger tipi?</AppText>
          <TympCurve t={q.tymp} width={width} height={Math.round(width * 0.62)} color={picked ? cls.color : colors.accent2} />
        </Card>
      </Animated.View>
      <View key={`o${idx}`} style={{ gap: space.sm }}>
        {TYPES.map((t, i) => {
          const state = !picked ? 'idle' : t === q.type ? (picked === t ? 'correct' : 'reveal') : picked === t ? 'wrong' : 'dim';
          return <OptionButton key={t} label={`Tip ${t} · ${TYPE_HINT[t]}`} index={i} state={state} onPress={picked ? undefined : () => choose(t)} />;
        })}
      </View>
      {picked ? (
        <Animated.View entering={FadeInDown.springify()} style={{ gap: space.md }}>
          <Card style={{ borderColor: picked === q.type ? colors.mint : colors.red }}>
            <AppText variant="bodyStrong" color={picked === q.type ? colors.mint : colors.red}>{picked === q.type ? 'Doğru!' : `Doğru cevap: ${cls.title}`}</AppText>
            <AppText variant="body" muted style={{ marginTop: 4 }}>{cls.summary} Olası bulgu: {cls.findings[0]}.</AppText>
            <AppText variant="small" faint style={{ marginTop: 4 }}>Tepe {q.tymp.pressure} daPa · komplians {q.tymp.compliance.toFixed(2)} ml · ECV {q.tymp.volume.toFixed(1)} ml</AppText>
          </Card>
          <Button title={idx + 1 < TOTAL ? 'Sonraki' : 'Sonucu Gör'} icon="arrow-forward" onPress={next} />
        </Animated.View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: space.sm, alignItems: 'center' } });
