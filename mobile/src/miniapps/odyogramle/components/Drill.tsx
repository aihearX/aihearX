import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Audiogram, Button, Card, Stat } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { Countdown, FeedbackFlash, GameHud, GameResult, ScorePop, rankFor, sfx, useGameTimer } from '@/core/game';
import { useSettings } from '@/core/store/settings';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { KIND_META, LIVES, TOTAL_ROUNDS, levelForRound, makeQuestion, scoreFor, secondsForRound, type DrillKind, type DrillQuestion } from '../drill';
import { useOdyogramleStore } from '../store';
import { OptionButton, type OptionState } from './OptionButton';

type Phase = 'menu' | 'countdown' | 'play' | 'done';
type Props = { onResult: MiniAppProps['onResult']; onActive: (active: boolean) => void; onDaily: () => void };

const TIMEOUT = '__timeout__';
const KINDS: DrillKind[] = ['tip', 'derece', 'konfig', 'kulak', 'pta'];

/** Antrenman modu: süreli, 3 canlı, kombolu odyogram okuma drili. */
export function Drill({ onResult, onActive, onDaily }: Props) {
  const { width } = useWindowDimensions();
  const haptics = useSettings((s) => s.haptics);
  const { drill, recordDrill } = useOdyogramleStore();
  const [phase, setPhase] = useState<Phase>('menu');
  const [round, setRound] = useState(1);
  const [q, setQ] = useState<DrillQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [flash, setFlash] = useState<{ kind: 'good' | 'bad' | null; trigger: number }>({ kind: null, trigger: 0 });
  const [pop, setPop] = useState<{ text: string; key: number; color: string }>({ text: '', key: 0, color: colors.mint });
  const finished = useRef(false);
  const stateRef = useRef({ picked, q });
  stateRef.current = { picked, q };

  const buzz = useCallback((t: Haptics.NotificationFeedbackType) => { if (haptics) Haptics.notificationAsync(t).catch(() => {}); }, [haptics]);

  const miss = useCallback((chosen: string) => {
    setPicked(chosen);
    setLives((l) => l - 1);
    setCombo(0);
    setFlash((f) => ({ kind: 'bad', trigger: f.trigger + 1 }));
    sfx('buzz');
    buzz(Haptics.NotificationFeedbackType.Error);
  }, [buzz]);

  const onExpire = useCallback(() => {
    // Sayaç güncelleyicisinin içinden çağrılır; durum değişikliğini bir sonraki döngüye ertele.
    setTimeout(() => { if (!stateRef.current.picked && stateRef.current.q) miss(TIMEOUT); }, 0);
  }, [miss]);

  const timer = useGameTimer(30, onExpire);
  const { start: timerStart, stop: timerStop } = timer;
  const seconds = secondsForRound(round);
  const secLeft = Math.ceil(timer.left);

  useEffect(() => { onActive(phase === 'countdown' || phase === 'play'); }, [phase, onActive]);
  useEffect(() => () => onActive(false), [onActive]);
  useEffect(() => { if (phase === 'play' && timer.running && !picked && secLeft <= 5 && secLeft > 0) sfx('tick', 0.5); }, [secLeft, phase, timer.running, picked]);

  const beginRound = useCallback((n: number) => {
    setRound(n); setQ(makeQuestion(n)); setPicked(null);
    timerStart(secondsForRound(n));
  }, [timerStart]);

  const start = () => {
    finished.current = false;
    setScore(0); setCorrect(0); setLives(LIVES); setCombo(0); setBestCombo(0); setPicked(null); setQ(null);
    setPhase('countdown');
  };
  const onCountdownDone = useCallback(() => { setPhase('play'); beginRound(1); }, [beginRound]);

  const choose = (opt: string) => {
    if (!q || picked) return;
    timerStop();
    if (opt === q.answer) {
      const c = combo + 1;
      const gained = scoreFor(timer.left, c);
      setPicked(opt); setCombo(c); setBestCombo((b) => Math.max(b, c)); setCorrect((v) => v + 1); setScore((s) => s + gained);
      setFlash((f) => ({ kind: 'good', trigger: f.trigger + 1 }));
      setPop((p) => ({ text: `+${gained}`, key: p.key + 1, color: c >= 3 ? colors.amber : colors.mint }));
      sfx(c >= 3 ? 'combo' : 'ding');
      buzz(Haptics.NotificationFeedbackType.Success);
    } else {
      miss(opt);
    }
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    timerStop();
    recordDrill(score, bestCombo);
    const ratio = correct / TOTAL_ROUNDS;
    const rank = rankFor(ratio);
    onResult({ score: Math.round(ratio * 100), points: score, xp: 35, label: `Antrenman · ${rank.name}`, shareText: shareLine(score, correct, rank.name), meta: { mode: 'drill', correct, rounds: round, bestCombo } });
    setPhase('done');
  };

  const next = () => {
    if (lives <= 0 || round >= TOTAL_ROUNDS) { finish(); return; }
    beginRound(round + 1);
  };

  const agWidth = Math.min(360, width - 32 - space.lg * 2);

  if (phase === 'done') {
    const ratio = correct / TOTAL_ROUNDS;
    return (
      <GameResult
        title="Antrenman"
        score={score}
        ratio={ratio}
        best={Math.max(drill.best, score)}
        stats={[{ label: 'Doğru', value: `${correct}/${TOTAL_ROUNDS}` }, { label: 'En iyi kombo', value: `x${bestCombo}` }, { label: 'Tur', value: round }]}
        gradient={gradients.ocean}
        shareText={shareLine(score, correct, rankFor(ratio).name)}
        makerName={SEBAHATTIN.name}
        onReplay={start}
        extra={<Button title="Günün Vakasına Dön" icon="calendar" variant="secondary" onPress={onDaily} />}
      />
    );
  }

  if (phase === 'menu') {
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown}>
          <Card gradient={gradients.ocean}>
            <AppText variant="tiny" color={colors.white} style={{ opacity: 0.85 }}>{TOTAL_ROUNDS} tur · {LIVES} can · süre baskısı</AppText>
            <AppText variant="h1" color={colors.white} style={{ marginTop: 6 }}>Odyogramı bakışta oku</AppText>
            <AppText variant="body" color={colors.white} style={{ marginTop: 6, opacity: 0.9 }}>Her turda rastgele üretilmiş yeni bir odyogram. Süre dolmadan cevapla; seri yaptıkça kombo çarpanı büyür, yanlışta can gider.</AppText>
          </Card>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80)} style={styles.kinds}>
          {KINDS.map((k) => (
            <View key={k} style={styles.kind}>
              <Ionicons name={KIND_META[k].icon} size={14} color={colors.accent2} />
              <AppText variant="small" muted>{KIND_META[k].title}</AppText>
            </View>
          ))}
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(140)} style={styles.statsRow}>
          <Stat label="Rekor" value={drill.best.toLocaleString('tr-TR')} icon="trophy" color={colors.amber} />
          <Stat label="En iyi kombo" value={`x${drill.bestCombo}`} icon="flame" color={colors.coral} />
          <Stat label="Oyun" value={drill.games} icon="barbell" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)} style={{ gap: space.sm }}>
          <Button title="Başla" icon="play" size="lg" gradient={gradients.ocean} onPress={start} />
          <AppText variant="tiny" faint center>Tur 6'dan sonra 25 sn, tur 11'den sonra 20 sn. PTA soruları 3. seviyede gelir.</AppText>
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <GameHud score={score} lives={lives} maxLives={LIVES} combo={combo} round={round} totalRounds={TOTAL_ROUNDS} level={levelForRound(round)} timerPct={Math.max(0, Math.min(1, timer.left / seconds))} timerLabel={picked ? 'Süre durdu' : `${secLeft} sn`} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {q ? (
          <>
            <Animated.View key={`q${round}`} entering={FadeIn.duration(250)}>
              <Card style={{ alignItems: 'center' }}>
                <View style={styles.kindRow}>
                  <Ionicons name={KIND_META[q.kind].icon} size={13} color={colors.accent2} />
                  <AppText variant="tiny" color={colors.accent2}>{KIND_META[q.kind].title}</AppText>
                </View>
                <AppText variant="h3" style={{ alignSelf: 'flex-start', marginTop: 4, marginBottom: space.sm }}>{q.prompt}</AppText>
                <Audiogram data={q.data} width={agWidth} height={Math.round(agWidth * 0.74)} highlightFreqs={q.highlightFreqs} />
              </Card>
            </Animated.View>
            <View key={`o${round}`} style={{ gap: space.sm }}>
              {q.options.map((o, i) => <OptionButton key={o} label={o} index={i} state={optionState(q, picked, o)} onPress={picked ? undefined : () => choose(o)} />)}
            </View>
            {picked ? (
              <Animated.View entering={FadeInDown.springify()} style={{ gap: space.md }}>
                <Card style={{ borderColor: picked === q.answer ? colors.mint : colors.red }}>
                  <AppText variant="bodyStrong" color={picked === q.answer ? colors.mint : colors.red}>{picked === q.answer ? 'Doğru!' : picked === TIMEOUT ? `Süre doldu · Doğru cevap: ${q.answer}` : `Doğru cevap: ${q.answer}`}</AppText>
                  <AppText variant="body" muted style={{ marginTop: 4 }}>{q.explain}</AppText>
                </Card>
                <Button title={lives <= 0 ? 'Sonucu Gör' : round >= TOTAL_ROUNDS ? 'Sonucu Gör' : 'Sonraki'} icon="arrow-forward" onPress={next} />
              </Animated.View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
      <FeedbackFlash kind={flash.kind} trigger={flash.trigger} />
      <ScorePop text={pop.text} popKey={pop.key} color={pop.color} />
      {phase === 'countdown' ? <Countdown onDone={onCountdownDone} /> : null}
    </View>
  );
}

function optionState(q: DrillQuestion, picked: string | null, o: string): OptionState {
  if (!picked) return 'idle';
  if (o === q.answer) return picked === o ? 'correct' : 'reveal';
  return picked === o ? 'wrong' : 'dim';
}

const shareLine = (score: number, correct: number, rank: string) => `Odyogramle Antrenman 🏋️ ${score.toLocaleString('tr-TR')} puan · ${correct}/${TOTAL_ROUNDS} · ${rank} · aihearX`;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: space.md },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  statsRow: { flexDirection: 'row', gap: space.sm },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
});
