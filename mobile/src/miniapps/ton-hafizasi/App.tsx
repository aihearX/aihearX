import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Countdown, FeedbackFlash, GameHud, GameResult, ScorePop, rankFor } from '@/core/game';
import { AppText, Button } from '@/core/ui';
import { colors, gradients } from '@/core/theme';
import { dayKey } from '@/core/util/day';
import type { MiniAppProps } from '@/core/registry/types';
import { DAILY_CAP, MAX_LIVES, SONG_TARGET, shareTextFor, type Mode } from './logic';
import { useTonStore } from './store';
import { useTonGame, type Summary } from './useTonGame';
import { Intro } from './components/Intro';
import { PadGrid } from './components/PadGrid';
import { StatusLine } from './components/StatusLine';
import { RevealCard } from './components/RevealCard';
import { Confetti } from './components/Confetti';
import { NoteBurst } from './components/NoteBurst';

type Phase = 'intro' | 'countdown' | 'play' | 'result';

/** Rütbe oranı: günlük → şarkının notası, serbest ezgi → hedef nota, rastgele → 20 tur. */
function ratioFor(s: Summary): number {
  if (s.mode === 'daily') return s.songTotal ? Math.min(1, s.songNotes / s.songTotal) : 0;
  if (s.mode === 'song') return Math.min(1, (s.rounds + s.songsDone * 6) / SONG_TARGET);
  return Math.min(1, s.rounds / DAILY_CAP);
}
const shareFor = (s: Summary, rank: string) => shareTextFor({ mode: s.mode, notes: s.rounds, rank, song: s.song, songNotes: s.songNotes, songsDone: s.songsDone });

export default function App({ onResult }: MiniAppProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [mode, setMode] = useState<Mode>('song');
  const [summary, setSummary] = useState<Summary | null>(null);
  const store = useTonStore();
  const reported = useRef(false);
  const todayKey = dayKey();

  const handleFinish = useCallback((s: Summary) => {
    if (reported.current) return;
    reported.current = true;
    const rank = rankFor(ratioFor(s));
    const shareText = shareFor(s, rank.name);
    const st = useTonStore.getState();
    st.record({
      round: s.rounds, score: s.score, level: s.level, songsDone: s.songsDone,
      nextCursor: s.mode === 'song' ? st.songCursor + s.songsDone + 1 : null,
      dailyKey: s.mode === 'daily' ? dayKey() : null, songId: s.song?.id ?? null,
    });
    setSummary(s);
    setPhase('result');
    onResult({ score: s.score, points: s.score, label: rank.name, xp: s.mode === 'daily' ? 45 : 35, shareText, meta: { mode: s.mode, rounds: s.rounds, level: s.level, song: s.song?.id, songsDone: s.songsDone } });
  }, [onResult]);

  const game = useTonGame(handleFinish);
  const { start, begin, abort } = game;
  useEffect(() => () => abort(), [abort]);

  const play = useCallback((m: Mode) => {
    reported.current = false;
    setMode(m);
    setSummary(null);
    start(m, useTonStore.getState().songCursor);
    setPhase('countdown');
  }, [start]);
  const onCountdownDone = useCallback(() => { setPhase('play'); begin(); }, [begin]);
  const quit = useCallback(() => { abort(); setPhase('intro'); }, [abort]);

  if (phase === 'intro') {
    return <Intro bestRound={store.bestRound} bestScore={store.bestScore} songsDone={store.songsDone} daily={store.daily} todayKey={todayKey} onPlay={play} />;
  }

  if (phase === 'result' && summary) {
    const ratio = ratioFor(summary);
    const rank = rankFor(ratio);
    const silentAcc = summary.silentTotal ? `%${Math.round((summary.silentOk / summary.silentTotal) * 100)}` : '—';
    const isSong = summary.mode !== 'random' && summary.song;
    return (
      <GameResult
        title={summary.mode === 'daily' ? 'Günün Ezgisi' : summary.mode === 'song' ? 'Gizli Ezgi' : 'Rastgele'}
        score={summary.score}
        ratio={ratio}
        best={store.bestScore}
        gradient={gradients.violet}
        shareText={shareFor(summary, rank.name)}
        makerName="Sebahattin Ünlü"
        stats={[
          { label: 'Nota', value: isSong ? `${summary.songNotes}/${summary.songTotal}` : summary.rounds },
          { label: 'Şarkı', value: summary.mode === 'daily' ? (summary.won ? '1/1' : '0/1') : summary.songsDone },
          { label: 'Sessiz tur doğruluğu', value: silentAcc },
        ]}
        onReplay={() => play(summary.mode)}
        extra={<Button title="Ana ekran" variant="secondary" icon="home" onPress={quit} />}
      >
        {isSong ? (
          <AppText variant="bodyStrong" center>
            🎵 {summary.song!.title}{summary.won ? ' — baştan sona çaldın!' : ` · ${summary.songNotes}. notaya kadar geldin`}
          </AppText>
        ) : null}
        {isSong && !summary.won ? <AppText variant="small" muted center style={{ marginTop: 4 }}>“{summary.song!.lyricHint}”</AppText> : null}
        {summary.mode === 'daily' ? <AppText variant="small" muted center style={{ marginTop: 4 }}>Günün skoru kaydedildi. Yarın yeni ezgi.</AppText> : null}
      </GameResult>
    );
  }

  const padsEnabled = phase === 'play' && game.turn === 'input';
  const sp = game.songProgress;
  return (
    <View style={styles.root}>
      <GameHud
        score={game.score} lives={game.lives} maxLives={MAX_LIVES} level={game.level}
        round={mode === 'daily' && sp ? sp.notes : undefined} totalRounds={mode === 'daily' && sp ? sp.total : undefined}
      />
      <StatusLine turn={game.turn} info={game.info} round={game.seq.length} progress={game.progress} quip={game.quip} song={sp} />
      <View style={styles.pads}>
        <PadGrid pads={game.pads} order={game.order} lit={game.lit} enabled={padsEnabled} onTap={game.tap} />
        {game.reveal ? <RevealCard key={game.reveal.n} reveal={game.reveal} isDaily={mode === 'daily'} onContinue={game.continueGame} /> : null}
      </View>
      <View style={styles.foot}>
        <Button title="Bırak" variant="ghost" size="sm" icon="close" haptic={false} onPress={quit} />
      </View>
      <FeedbackFlash kind={game.flash.kind} trigger={game.flash.n} />
      <ScorePop text={game.pop.text} popKey={game.pop.n} />
      <NoteBurst trigger={game.reveal?.n ?? 0} />
      <Confetti trigger={game.reveal?.kind === 'song' ? game.reveal.n : 0} />
      {phase === 'countdown' ? <Countdown onDone={onCountdownDone} label={mode === 'random' ? 'Başla!' : 'Dinle!'} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  pads: { flex: 1, paddingHorizontal: 16, paddingBottom: 8 },
  foot: { alignItems: 'center', paddingBottom: 12 },
});
