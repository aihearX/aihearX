import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { playTone, type Playback } from '@/core/audio';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { BASE_POINTS, LIVES, ROUNDS, ROUND_SECONDS, TONE_SECONDS, fmtFreq, fmtNum, levelName, makeRound, type Round } from './logic';
import { useFrekansStore } from './store';
import { Hud } from './components/Hud';
import { OptionGrid } from './components/OptionGrid';
import { ScorePop } from './components/ScorePop';

type Phase = 'intro' | 'play' | 'done';

export default function FrekansAvi({ onResult }: MiniAppProps) {
  const { highScore, games, record } = useFrekansStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(1);
  const [current, setCurrent] = useState<Round | null>(null);
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [pop, setPop] = useState<{ n: number; text: string; color: string }>({ n: 0, text: '', color: colors.mint });
  const [isHigh, setIsHigh] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<Playback | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTone = useCallback(() => { playRef.current?.stop(); playRef.current = null; }, []);

  const play = useCallback(async (freq: number) => {
    stopTone();
    setPlaying(true);
    try {
      const p = await playTone({ freq, duration: TONE_SECONDS, amplitude: 0.45, ramp: 0.03 });
      playRef.current = p;
      await p.done;
    } catch { /* ses yoksa oyun devam eder */ }
    setPlaying(false);
  }, [stopTone]);

  const startRound = useCallback((r: number) => {
    const next = makeRound(r);
    setRound(r);
    setCurrent(next);
    setChosen(null);
    setRevealed(false);
    setTimeLeft(ROUND_SECONDS);
    void play(next.freq);
  }, [play]);

  const start = () => {
    setLives(LIVES); setScore(0); setCombo(0); setCorrect(0); setMaxCombo(0); setIsHigh(false);
    setPhase('play');
    startRound(1);
  };

  const finish = useCallback((finalScore: number, finalCorrect: number, finalMaxCombo: number) => {
    stopTone();
    const high = record(finalScore, finalCorrect);
    setIsHigh(high);
    setPhase('done');
    const shareText = `Frekans Avı 🎯 ${fmtNum(finalScore)} puan · ${finalCorrect}/${ROUNDS} · aihearX`;
    onResult({
      score: Math.round((finalCorrect / ROUNDS) * 100),
      points: finalScore,
      xp: 30 + (high ? 10 : 0),
      label: `${finalCorrect}/${ROUNDS} doğru`,
      shareText,
      meta: { maxCombo: finalMaxCombo, high },
    });
  }, [onResult, record, stopTone]);

  const answer = useCallback((f: number | null) => {
    if (!current || revealed) return;
    setChosen(f);
    setRevealed(true);
    const ok = f === current.freq;
    let nextScore = score, nextCorrect = correct, nextLives = lives, nextMax = maxCombo;
    if (ok) {
      const nextCombo = combo + 1;
      const gained = BASE_POINTS * nextCombo;
      nextScore += gained; nextCorrect += 1; nextMax = Math.max(maxCombo, nextCombo);
      setCombo(nextCombo); setScore(nextScore); setCorrect(nextCorrect); setMaxCombo(nextMax);
      setPop({ n: Date.now(), text: `+${gained}`, color: nextCombo >= 3 ? colors.amber : colors.mint });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      nextLives -= 1;
      setCombo(0); setLives(nextLives);
      setPop({ n: Date.now(), text: f == null ? 'Süre doldu' : 'Kombo sıfır', color: colors.red });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    timerRef.current = setTimeout(() => {
      if (nextLives <= 0 || round >= ROUNDS) finish(nextScore, nextCorrect, nextMax);
      else startRound(round + 1);
    }, 1000);
  }, [combo, correct, current, finish, lives, maxCombo, revealed, round, score, startRound]);

  // Tur sayacı: answer kimliği değişse de tik sıfırlanmasın diye ref üzerinden çağrılır
  const answerRef = useRef(answer);
  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => {
    if (phase !== 'play' || revealed) return;
    const t = setTimeout(() => { if (timeLeft <= 0) answerRef.current(null); else setTimeLeft((v) => v - 1); }, timeLeft <= 0 ? 0 : 1000);
    return () => clearTimeout(t);
  }, [phase, revealed, timeLeft]);

  useEffect(() => () => { stopTone(); if (timerRef.current) clearTimeout(timerRef.current); }, [stopTone]);

  if (phase === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown}>
          <Card gradient={gradients.rose}>
            <AppText variant="display" color={colors.white}>Frekans Avı</AppText>
            <AppText variant="body" color="rgba(255,255,255,0.9)" style={{ marginTop: space.sm }}>
              Bir saf ses çalar, 4 seçenekten frekansı yakala. {ROUNDS} tur, {LIVES} can, her tur {ROUND_SECONDS} saniye. Art arda bildikçe kombo çarpanı büyür.
            </AppText>
          </Card>
        </Animated.View>
        <View style={styles.stats}>
          <Stat label="Rekor" value={fmtNum(highScore)} icon="trophy" color={colors.amber} />
          <Stat label="Oyun" value={games} icon="game-controller" />
        </View>
        <View style={styles.chips}>
          <Chip label="Kulaklık öneririz" icon="headset" />
          <Chip label="Ses göreli, kalibre değil" icon="information-circle" />
        </View>
        <Button title="Başla" icon="play" size="lg" onPress={start} style={{ marginTop: space.xl }} />
        <AppText variant="small" faint center style={{ marginTop: space.md }}>Seviye 1-4 oktav frekansları, 5-7 ara frekanslar, 8-10 komşu tuzaklar.</AppText>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    const acc = Math.round((correct / ROUNDS) * 100);
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={ZoomIn}>
          <ShareCard
            title={`${fmtNum(score)} puan`}
            subtitle={`${correct}/${ROUNDS} doğru · en yüksek kombo x${Math.max(1, maxCombo)}${isHigh ? ' · YENİ REKOR 🏆' : ''}`}
            gradient={gradients.rose}
            makerName={SEBAHATTIN.name}
            shareText={`Frekans Avı 🎯 ${fmtNum(score)} puan · ${correct}/${ROUNDS} · aihearX`}
          >
            <AppText variant="h2" color={colors.white}>{Array.from({ length: ROUNDS }, (_, i) => (i < correct ? '🎯' : '⚪')).join('')}</AppText>
          </ShareCard>
        </Animated.View>
        <View style={styles.stats}>
          <Stat label="İsabet" value={`%${acc}`} icon="pulse" />
          <Stat label="Rekor" value={fmtNum(Math.max(highScore, score))} icon="trophy" color={colors.amber} />
        </View>
        <Button title="Tekrar Oyna" icon="refresh" size="lg" onPress={start} style={{ marginTop: space.xl }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
      <Hud round={round} lives={lives} score={score} combo={combo} timeLeft={timeLeft} level={levelName(round)} />
      <View style={styles.stage}>
        <ScorePop text={pop.text} trigger={pop.n} color={pop.color} />
        <AppText variant="tiny" faint center>Hangi frekans?</AppText>
        <AppText variant="h2" center style={{ marginTop: 4 }}>{revealed && current ? fmtFreq(current.freq) : playing ? '🔊 Dinle…' : '🎧 Tahmin et'}</AppText>
        <Button title="Tekrar Dinle" icon="volume-high" variant="secondary" size="sm" disabled={!current || revealed} onPress={() => current && void play(current.freq)} style={{ alignSelf: 'center', marginTop: space.md }} />
      </View>
      {current ? <OptionGrid options={current.options} answer={current.freq} chosen={chosen} revealed={revealed} onPick={answer} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: space.lg },
  stats: { flexDirection: 'row', gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stage: { paddingVertical: space.xl, alignItems: 'center', justifyContent: 'center', minHeight: 130 },
});
