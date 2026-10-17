import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Countdown, FeedbackFlash, GameHud, ScorePop, sfx, useGameTimer } from '@/core/game';
import { AppText, Button } from '@/core/ui';
import { colors } from '@/core/theme';
import { MAX_LIVES, SOLO_SECONDS, basePoints, fmtPct, grow, levelForP, makeTrial, multiplier, shrink, START_P, type Trial } from '../logic';
import { badHaptic, goodHaptic, tapHaptic } from '../haptics';
import { usePairPlayer } from '../usePairPlayer';
import { ToneZones } from './ToneZones';

export type SoloSummary = { score: number; trials: number; correct: number; minCorrect: number | null; minReliable: number | null; bestStreak: number; level: number };

type G = { p: number; streak: number; bestStreak: number; lives: number; score: number; trials: number; correct: number; minCorrect: number | null; minReliable: number | null; lastCorrect: boolean; level: number; trial: Trial | null; answerable: boolean; alive: boolean };
const fresh = (): G => ({ p: START_P, streak: 0, bestStreak: 0, lives: MAX_LIVES, score: 0, trials: 0, correct: 0, minCorrect: null, minReliable: null, lastCorrect: false, level: 1, trial: null, answerable: false, alive: false });

/** Tek kişilik 60 saniyelik düello: aralık daraldıkça puan artar. */
export function SoloGame({ onFinish, onQuit }: { onFinish: (s: SoloSummary) => void; onQuit: () => void }) {
  const { sounding, playPair, stop: stopPlayer } = usePairPlayer();
  const g = useRef<G>(fresh());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState({ score: 0, lives: MAX_LIVES, combo: 0, level: 1, p: START_P });
  const [answerable, setAnswerable] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'good' | 'bad' | null; n: number }>({ kind: null, n: 0 });
  const [pop, setPop] = useState({ text: '', n: 0 });

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const finish = useCallback(() => {
    const s = g.current;
    if (!s.alive) return;
    s.alive = false;
    timers.current.forEach(clearTimeout);
    stopPlayer();
    finishRef.current({ score: s.score, trials: s.trials, correct: s.correct, minCorrect: s.minCorrect, minReliable: s.minReliable, bestStreak: s.bestStreak, level: s.level });
  }, [stopPlayer]);
  const timer = useGameTimer(SOLO_SECONDS, () => { later(finish, 0); });
  const { start: startTimer, stop: stopTimer } = timer;

  const next = useCallback(async () => {
    const s = g.current;
    if (!s.alive) return;
    const t = makeTrial(s.p, s.level);
    s.trial = t;
    s.answerable = false;
    setAnswerable(false);
    await playPair(t, () => { if (s.alive && s.trial === t) { s.answerable = true; setAnswerable(true); } });
  }, [playPair]);

  const answer = useCallback((choice: 1 | 2) => {
    const s = g.current;
    if (!s.alive || !s.answerable || !s.trial) return;
    s.answerable = false;
    setAnswerable(false);
    tapHaptic();
    const correct = (choice === 1) === s.trial.higherFirst;
    s.trials += 1;
    if (correct) {
      s.streak += 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      const gain = Math.round(basePoints(s.p) * multiplier(s.streak));
      s.score += gain;
      s.correct += 1;
      s.minCorrect = s.minCorrect === null ? s.p : Math.min(s.minCorrect, s.p);
      if (s.lastCorrect) s.minReliable = s.minReliable === null ? s.p : Math.min(s.minReliable, s.p);
      s.lastCorrect = true;
      s.p = shrink(s.p);
      setPop((v) => ({ text: `+${gain}`, n: v.n + 1 }));
      setFlash((f) => ({ kind: 'good', n: f.n + 1 }));
      goodHaptic();
      sfx(s.streak > 0 && s.streak % 4 === 0 ? 'combo' : 'ding');
    } else {
      s.streak = 0;
      s.lives -= 1;
      s.lastCorrect = false;
      s.p = grow(s.p);
      setFlash((f) => ({ kind: 'bad', n: f.n + 1 }));
      badHaptic();
      sfx('buzz');
    }
    const lvl = levelForP(s.p);
    if (lvl > s.level) later(() => { sfx('levelUp'); }, 250);
    s.level = lvl;
    setHud({ score: s.score, lives: s.lives, combo: s.streak, level: s.level, p: s.p });
    if (s.lives <= 0) { later(finish, 600); return; }
    later(() => { next().catch(() => {}); }, 550);
  }, [finish, next]);

  const begin = useCallback(() => {
    g.current = { ...fresh(), alive: true };
    setReady(true);
    startTimer();
    next().catch(() => {});
  }, [startTimer, next]);

  useEffect(() => () => { g.current.alive = false; timers.current.forEach(clearTimeout); }, []);

  return (
    <View style={styles.root}>
      <GameHud score={hud.score} lives={hud.lives} maxLives={MAX_LIVES} combo={multiplier(hud.combo) > 1 ? multiplier(hud.combo) : undefined} level={hud.level} timerPct={ready ? timer.pct : 1} timerLabel={`${Math.ceil(timer.left)} sn · fark ${fmtPct(hud.p)}`} />
      <View style={styles.body}>
        <AppText variant="h2" center style={{ marginBottom: 12 }}>{answerable ? 'Hangisi daha tiz?' : sounding ? `${sounding}. ses çalıyor…` : 'Dinle…'}</AppText>
        <ToneZones sounding={sounding} enabled={answerable} onPick={answer} />
        <AppText variant="small" faint center style={{ marginTop: 12 }}>Sol: 1. ses · Sağ: 2. ses. Fark küçüldükçe puan artar.</AppText>
      </View>
      <View style={styles.foot}><Button title="Bırak" variant="ghost" size="sm" icon="close" haptic={false} onPress={() => { g.current.alive = false; stopPlayer(); stopTimer(); onQuit(); }} /></View>
      <FeedbackFlash kind={flash.kind} trigger={flash.n} />
      <ScorePop text={pop.text} popKey={pop.n} />
      {!ready ? <Countdown onDone={begin} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: 16 },
  foot: { alignItems: 'center', paddingBottom: 12 },
});
