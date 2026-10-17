import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { Countdown, FeedbackFlash, GameHud, GameResult, ScorePop } from '@/core/game';
import { SEBAHATTIN } from '@/core/registry/makers';
import { dayKey } from '@/core/util/day';
import type { MiniAppProps } from '@/core/registry/types';
import { MAX_LIVES, TOTAL_ROUNDS } from './logic';
import { useGurultuStore } from './store';
import { useNoiseGame } from './useNoiseGame';
import { Intro } from './components/Intro';
import { Keypad } from './components/Keypad';
import { NoiseMeter } from './components/NoiseMeter';
import { SkillCard } from './components/SkillCard';

/**
 * Gürültü Avcısı: gürültü içinde okunan rakam üçlülerini yakala (digits-in-noise oyunu).
 * Akış: intro → 3-2-1 → 20 tur (uyarlanır SNR) → sonuç.
 */
export default function App({ onResult }: MiniAppProps) {
  const g = useNoiseGame(onResult);
  const best = useGurultuStore((s) => s.best);
  const games = useGurultuStore((s) => s.games);
  const bestSnrDb = useGurultuStore((s) => s.bestSnrDb);
  const dailyScore = useGurultuStore((s) => s.daily[dayKey()] ?? null);

  if (g.phase === 'intro') {
    return <Intro best={best} games={games} bestSnrDb={bestSnrDb} dailyScore={dailyScore} voice={g.voice} onPlay={g.start} />;
  }

  if (g.phase === 'result' && g.result) {
    return (
      <GameResult
        title={g.mode === 'daily' ? 'Günün Avı' : 'Gürültü Avcısı'}
        score={g.result.score}
        ratio={g.result.ratio}
        best={g.result.prevBest}
        stats={g.result.stats}
        gradient={gradients.ocean}
        shareText={g.result.shareText}
        makerName={SEBAHATTIN.name}
        onReplay={g.toIntro}
      >
        <SkillCard sentence={g.result.skill} daily={g.mode === 'daily'} />
      </GameResult>
    );
  }

  const lives = Math.max(0, MAX_LIVES - g.game.wrongStreak);
  return (
    <View style={styles.root}>
      <GameHud score={g.game.score} lives={lives} maxLives={MAX_LIVES} combo={Math.min(5, g.game.combo)} round={Math.min(TOTAL_ROUNDS, g.game.round + 1)} totalRounds={TOTAL_ROUNDS} level={g.game.step + 1} />
      <Animated.View entering={FadeIn} style={styles.body}>
        {g.mode === 'daily' ? <AppText variant="tiny" faint center>Günün avı · {dayKey()}</AppText> : null}
        <NoiseMeter listening={g.listening} accepting={g.accepting} snrDb={g.levels.snrDb} step={g.game.step} text={g.feedback.text} kind={g.feedback.kind} />
        <View style={{ flex: 1 }} />
        <Keypad value={g.input} onDigit={g.pressDigit} onBackspace={g.backspace} disabled={!g.accepting} />
        <AppText variant="tiny" faint center style={{ marginTop: space.sm }}>Üst üste 3 yanlış oyunu bitirir.</AppText>
      </Animated.View>
      <ScorePop text={g.pop.text} popKey={g.pop.key} />
      <FeedbackFlash kind={g.feedback.kind} trigger={g.feedback.trigger} />
      {g.phase === 'countdown' ? <Countdown onDone={g.beginRounds} label="Dinle!" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: space.lg, paddingBottom: space.xxl },
});
