import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, Button } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { Countdown, FeedbackFlash, GameHud, GameResult, ScorePop } from '@/core/game';
import { dayKey } from '@/core/util/day';
import type { MiniAppProps } from '@/core/registry/types';
import { DAILY_ROUNDS, LIVES, REPLAY_COST, paramsFor, type Mode } from './engine';
import { SOUNDS } from './sounds';
import { useDedektifStore } from './store';
import { useGame } from './useGame';
import { Intro } from './components/Intro';
import { Visualizer } from './components/Visualizer';
import { OptionGrid } from './components/OptionGrid';
import { LevelBanner } from './components/LevelBanner';

const TITLE = 'Ses Dedektifi';

export default function App({ onResult }: MiniAppProps) {
  const { g, left, start, beginPlay, toIntro, replay, pick } = useGame(onResult);
  const best = useDedektifStore((s) => s.best);
  const highLevel = useDedektifStore((s) => s.highLevel);
  const gamesPlayed = useDedektifStore((s) => s.gamesPlayed);
  const daily = useDedektifStore((s) => s.daily);
  const todayDaily = daily[dayKey()] ?? null;
  const [mode, setMode] = useState<Mode>(todayDaily ? 'free' : 'daily');

  if (g.phase === 'result' && g.result) {
    const r = g.result;
    return (
      <GameResult
        title={g.mode === 'daily' ? `${TITLE} · Günün Serisi` : TITLE}
        score={r.score}
        ratio={r.ratio}
        best={r.prevBest}
        stats={r.stats}
        gradient={gradients.violet}
        shareText={r.shareText}
        makerName="Sebahattin Ünlü"
        onReplay={() => { if (g.mode === 'daily') { setMode('free'); toIntro('free'); } else start('free'); }}
        extra={<Button title="Ana ekran" variant="ghost" icon="home" onPress={() => toIntro()} />}
      >
        {g.mode === 'daily' ? <AppText variant="small" muted center>Günün Serisi tamamlandı. Yarın herkese yeni 10 ses.</AppText> : null}
      </GameResult>
    );
  }

  if (g.phase === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Intro mode={mode} onMode={setMode} onPlay={() => start(mode)} best={best} highLevel={highLevel} gamesPlayed={gamesPlayed} todayDaily={todayDaily} soundCount={SOUNDS.length} />
      </ScrollView>
    );
  }

  const p = paramsFor(g.level);
  const ok = g.answer ? g.answer.chosenId === g.answer.correctId : null;
  const label = g.playing ? 'Dinle…' : ok === null ? 'Bu ne sesi?' : ok ? 'Doğru!' : g.answer?.chosenId ? 'Yanlış' : 'Süre doldu';
  const sublabel = `Seviye ${g.level} · ${p.clip.toFixed(1)} sn klip${p.noise > 0 ? ' · gürültülü' : ''}${p.sameCategory ? ' · benzer sesler' : ''}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GameHud
        score={g.score}
        lives={g.lives}
        maxLives={LIVES}
        combo={g.combo}
        level={g.level}
        round={g.mode === 'daily' ? Math.max(1, g.round) : undefined}
        totalRounds={g.mode === 'daily' ? DAILY_ROUNDS : undefined}
        timerPct={g.phase === 'play' ? Math.max(0, Math.min(1, left / p.seconds)) : 1}
        timerLabel={g.phase === 'play' ? `Kalan ${Math.ceil(left)} sn` : undefined}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Visualizer playing={g.playing} label={label} sublabel={sublabel} />
        <View style={styles.row}>
          <Button title={`Tekrar dinle (−${REPLAY_COST})`} variant="secondary" icon="refresh" size="sm" disabled={!!g.answer || g.playing || !g.plan} onPress={replay} />
          <AppText variant="small" faint style={{ flex: 1 }} numberOfLines={2}>{g.answer ? '' : 'Emin olunca dokun; hız puan getirir.'}</AppText>
        </View>
        {g.plan ? <OptionGrid options={g.plan.options} answer={g.answer} onPick={pick} roundKey={g.round} /> : null}
        {g.answer && g.plan ? (
          <Animated.View entering={FadeIn.duration(200)} style={{ marginTop: space.md }}>
            <AppText center color={ok ? colors.mint : colors.red} variant="bodyStrong">
              {ok ? `${g.plan.sound.emoji} ${g.plan.sound.name} — kombo x${Math.max(1, g.combo)}` : `Cevap: ${g.plan.sound.emoji} ${g.plan.sound.name}`}
            </AppText>
          </Animated.View>
        ) : null}
      </ScrollView>
      {g.phase === 'countdown' ? <Countdown onDone={beginPlay} /> : null}
      <FeedbackFlash kind={g.flash.kind} trigger={g.flash.trigger} />
      <ScorePop text={g.pop.text} popKey={g.pop.key} color={colors.accent} />
      {g.banner ? <LevelBanner key={g.banner.key} level={g.banner.level} hint={g.banner.hint} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: space.md, marginBottom: space.md },
});
