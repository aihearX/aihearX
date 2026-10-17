import React, { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, ProgressBar, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { ROUNDS, fmtNum, pickRounds, scoreFor, type SoundItem } from './data';
import { useDesibelStore } from './store';
import { DbPicker } from './components/DbPicker';
import { Reveal } from './components/Reveal';
import { ScorePop } from './components/ScorePop';

type Phase = 'intro' | 'play' | 'done';
const ROUND_SECONDS = 20;

export default function DesibelDedektifi({ onResult }: MiniAppProps) {
  const { highScore, games, record } = useDesibelStore();
  const [phase, setPhase] = useState<Phase>('intro');
  const [items, setItems] = useState<SoundItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState(60);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gained, setGained] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [pop, setPop] = useState<{ n: number; text: string; color: string }>({ n: 0, text: '', color: colors.mint });
  const [isHigh, setIsHigh] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const start = () => {
    setItems(pickRounds()); setIdx(0); setGuess(60); setRevealed(false);
    setScore(0); setHits(0); setCombo(0); setMaxCombo(0); setIsHigh(false); setTimeLeft(ROUND_SECONDS);
    setPhase('play');
  };

  const finish = useCallback((finalScore: number, finalHits: number, finalMax: number) => {
    const high = record(finalScore, finalHits);
    setIsHigh(high);
    setPhase('done');
    onResult({
      score: Math.round((finalHits / ROUNDS) * 100),
      points: finalScore,
      xp: 30 + (high ? 10 : 0),
      label: `${finalHits}/${ROUNDS} isabet`,
      shareText: `Desibel Dedektifi 🔊 ${fmtNum(finalScore)} puan · ${finalHits}/${ROUNDS} isabet · aihearX`,
      meta: { maxCombo: finalMax, high },
    });
  }, [onResult, record]);

  const submit = useCallback(() => {
    const item = items[idx];
    if (!item || revealed) return;
    const diff = Math.abs(guess - item.db);
    const base = scoreFor(diff);
    const hit = diff <= 5;
    const nextCombo = hit ? combo + 1 : diff <= 10 ? combo : 0;
    const mult = Math.max(1, nextCombo);
    const g = base * mult;
    setGained(g); setCombo(nextCombo); setMaxCombo((m) => Math.max(m, nextCombo));
    setScore((s) => s + g); if (hit) setHits((h) => h + 1);
    setRevealed(true);
    setPop({ n: Date.now(), text: g > 0 ? `+${g}${mult > 1 ? ` (x${mult})` : ''}` : 'Iska', color: hit ? colors.mint : g > 0 ? colors.amber : colors.red });
    Haptics.notificationAsync(hit ? Haptics.NotificationFeedbackType.Success : g > 0 ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Error).catch(() => {});
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [combo, guess, idx, items, revealed]);

  const next = () => {
    if (idx + 1 >= ROUNDS) { finish(score, hits, maxCombo); return; }
    setIdx(idx + 1); setRevealed(false); setGuess(60); setTimeLeft(ROUND_SECONDS);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Tur sayacı: kaydırıcı hareketi submit kimliğini değiştirse de tik sıfırlanmasın
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; }, [submit]);
  useEffect(() => {
    if (phase !== 'play' || revealed) return;
    const t = setTimeout(() => { if (timeLeft <= 0) submitRef.current(); else setTimeLeft((v) => v - 1); }, timeLeft <= 0 ? 0 : 1000);
    return () => clearTimeout(t);
  }, [phase, revealed, timeLeft]);

  if (phase === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown}>
          <Card gradient={gradients.ember}>
            <AppText variant="display" color={colors.white}>Desibel Dedektifi</AppText>
            <AppText variant="body" color="rgba(255,255,255,0.9)" style={{ marginTop: space.sm }}>
              Günlük hayattaki seslerin kaç dB olduğunu tahmin et. ±5 dB tam puan; art arda tam isabetlerde kombo çarpanı. Her cevapta güvenli maruziyet süresini öğrenirsin.
            </AppText>
          </Card>
        </Animated.View>
        <View style={styles.stats}>
          <Stat label="Rekor" value={fmtNum(highScore)} icon="trophy" color={colors.amber} />
          <Stat label="Oyun" value={games} icon="game-controller" />
        </View>
        <View style={styles.chips}>
          <Chip label={`${ROUNDS} tur`} icon="layers" />
          <Chip label={`${ROUND_SECONDS} sn / tur`} icon="timer" />
          <Chip label="dB SPL" icon="speedometer" />
        </View>
        <Button title="Başla" icon="play" size="lg" onPress={start} style={{ marginTop: space.xl }} />
        <AppText variant="small" faint center style={{ marginTop: space.md }}>Değerler yaklaşık ve öğreticidir; ortam ve mesafeye göre değişir.</AppText>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={ZoomIn}>
          <ShareCard
            title={`${fmtNum(score)} puan`}
            subtitle={`${hits}/${ROUNDS} tam isabet · en yüksek kombo x${Math.max(1, maxCombo)}${isHigh ? ' · YENİ REKOR 🏆' : ''}`}
            gradient={gradients.ember}
            makerName={SEBAHATTIN.name}
            shareText={`Desibel Dedektifi 🔊 ${fmtNum(score)} puan · ${hits}/${ROUNDS} isabet · aihearX`}
          >
            <AppText variant="h2" color={colors.white}>{Array.from({ length: ROUNDS }, (_, i) => (i < hits ? '🔊' : '🔈')).join('')}</AppText>
          </ShareCard>
        </Animated.View>
        <Card>
          <AppText variant="bodyStrong">Aklında kalsın</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>85 dB’de 8 saat güvenli; 88 dB’de 4 saat, 91 dB’de 2 saat, 100 dB’de 15 dakika, 110 dB’de 1,5 dakika. Kulaklık sesini %60’ın altında tutmak çoğu durumda yeterli.</AppText>
        </Card>
        <Button title="Tekrar Oyna" icon="refresh" size="lg" onPress={start} />
      </ScrollView>
    );
  }

  const item = items[idx];
  if (!item) return null;
  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
      <View style={styles.hud}>
        <View>
          <AppText variant="tiny" faint>Tur {idx + 1}/{ROUNDS}</AppText>
          <AppText variant="h1">{fmtNum(score)}</AppText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <AppText variant="small" color={combo >= 2 ? colors.amber : colors.textFaint}>x{Math.max(1, combo)} kombo</AppText>
          <AppText variant="tiny" color={timeLeft <= 5 ? colors.red : colors.textFaint}>{timeLeft} sn</AppText>
        </View>
      </View>
      <ProgressBar value={timeLeft / ROUND_SECONDS} gradient={timeLeft <= 5 ? gradients.ember : gradients.gold} height={6} />
      <View style={styles.stage}>
        <ScorePop text={pop.text} trigger={pop.n} color={pop.color} />
        <Animated.View key={idx} entering={ZoomIn} style={{ alignItems: 'center' }}>
          <AppText style={{ fontSize: 64, lineHeight: 76 }}>{item.emoji}</AppText>
          <AppText variant="h2" center>{item.name}</AppText>
          <AppText variant="small" faint>Kaç dB SPL?</AppText>
        </Animated.View>
      </View>
      <DbPicker value={guess} onChange={setGuess} disabled={revealed} />
      {revealed ? (
        <>
          <Reveal item={item} guess={guess} gained={gained} />
          <Button title={idx + 1 >= ROUNDS ? 'Sonucu Gör' : 'Sıradaki'} icon="arrow-forward" size="lg" onPress={next} />
        </>
      ) : (
        <Button title="Tahmin Et" icon="checkmark" size="lg" onPress={submit} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: space.lg },
  stats: { flexDirection: 'row', gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  hud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: space.lg },
  stage: { alignItems: 'center', paddingVertical: space.md, minHeight: 150, justifyContent: 'center' },
});
