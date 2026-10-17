import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Countdown, FeedbackFlash, GameHud, GameResult, ScorePop, rankFor } from '@/core/game';
import { AppText, Button } from '@/core/ui';
import { colors, gradients } from '@/core/theme';
import { dayKey } from '@/core/util/day';
import type { MiniAppProps } from '@/core/registry/types';
import { DAILY_CAP, MAX_LIVES, shareTextFor, type Mode } from './logic';
import { useTonStore } from './store';
import { useTonGame, type Summary } from './useTonGame';
import { Intro } from './components/Intro';
import { PadGrid } from './components/PadGrid';
import { StatusLine } from './components/StatusLine';

type Phase = 'intro' | 'countdown' | 'play' | 'result';

export default function App({ onResult }: MiniAppProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('free');
  const [summary, setSummary] = useState<Summary | null>(null);
  const store = useTonStore();
  const reported = useRef(false);
  const todayKey = dayKey();

  const handleFinish = useCallback((s: Summary) => {
    if (reported.current) return;
    reported.current = true;
    const rank = rankFor(Math.min(1, s.rounds / DAILY_CAP));
    const shareText = shareTextFor(s.rounds, rank.name);
    useTonStore.getState().record({ round: s.rounds, score: s.score, level: s.level, dailyKey: s.mode === 'daily' ? dayKey() : null });
    setSummary(s);
    setPhase('result');
    onResult({ score: s.score, points: s.score, label: rank.name, xp: 35, shareText, meta: { mode: s.mode, rounds: s.rounds, level: s.level } });
  }, [onResult]);

  const game = useTonGame(handleFinish);
  const { start, begin, abort } = game;
  useEffect(() => () => abort(), [abort]);

  const play = useCallback((m: Mode) => {
    reported.current = false;
    setMode(m);
    setSummary(null);
    start(m);
    setPhase('countdown');
  }, [start]);
  const onCountdownDone = useCallback(() => { setPhase('play'); begin(); }, [begin]);
  const quit = useCallback(() => { abort(); setPhase('intro'); }, [abort]);

  if (phase === 'intro') {
    return <Intro bestRound={store.bestRound} bestScore={store.bestScore} bestLevel={store.bestLevel} daily={store.daily} todayKey={todayKey} onPlay={play} />;
  }

  if (phase === 'result' && summary) {
    const ratio = Math.min(1, summary.rounds / DAILY_CAP);
    const rank = rankFor(ratio);
    const silentAcc = summary.silentTotal ? `%${Math.round((summary.silentOk / summary.silentTotal) * 100)}` : '—';
    return (
      <GameResult
        title={summary.mode === 'daily' ? 'Günün Dizisi' : 'Ton Hafızası'}
        score={summary.score}
        ratio={ratio}
        best={store.bestScore}
        gradient={gradients.violet}
        shareText={shareTextFor(summary.rounds, rank.name)}
        makerName="Sebahattin Ünlü"
        stats={[
          { label: 'En uzun dizi', value: `${summary.rounds} nota` },
          { label: 'Seviye', value: summary.level },
          { label: 'Sessiz doğruluk', value: silentAcc },
        ]}
        onReplay={() => play('free')}
        extra={<Button title="Ana ekran" variant="secondary" icon="home" onPress={quit} />}
      >
        {summary.won ? <AppText variant="bodyStrong" color={colors.mint} center>Günün dizisini sonuna kadar çaldın. Kulak tam yerinde.</AppText> : null}
        {summary.mode === 'daily' ? <AppText variant="small" muted center style={{ marginTop: 4 }}>Günün skoru kaydedildi. Yarın yeni dizi.</AppText> : null}
      </GameResult>
    );
  }

  const padsEnabled = phase === 'play' && game.turn === 'input';
  return (
    <View style={styles.root}>
      <GameHud score={game.score} lives={game.lives} maxLives={MAX_LIVES} level={game.level} round={mode === 'daily' ? game.seq.length : undefined} totalRounds={mode === 'daily' ? DAILY_CAP : undefined} />
      <StatusLine turn={game.turn} info={game.info} round={game.seq.length} progress={game.progress} />
      <View style={styles.pads}>
        <PadGrid order={game.order} lit={game.lit} enabled={padsEnabled} onTap={game.tap} />
      </View>
      <View style={styles.foot}>
        <Button title="Bırak" variant="ghost" size="sm" icon="close" haptic={false} onPress={quit} />
      </View>
      <FeedbackFlash kind={game.flash.kind} trigger={game.flash.n} />
      <ScorePop text={game.pop.text} popKey={game.pop.n} />
      {phase === 'countdown' ? <Countdown onDone={onCountdownDone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  pads: { flex: 1, paddingHorizontal: 16, paddingBottom: 8 },
  foot: { alignItems: 'center', paddingBottom: 12 },
});
