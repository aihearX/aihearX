import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, ShareCard, Stat, useToast } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { dayKey } from '@/core/util/day';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { MAX_TRIES, WORD_LEN, dailyWord, evaluate, keyStates, puzzleNumber, randomWord, shareText, type Row } from './logic';
import { isAllowed } from './words';
import { useKelimeStore, type DailyEntry } from './store';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';

type Mode = 'daily' | 'practice';
type Practice = DailyEntry & { target: string };
const freshPractice = (): Practice => ({ target: randomWord(), rows: [], done: false, won: false });
const EMPTY: DailyEntry = { rows: [], done: false, won: false };

export default function OdyoKelime({ onResult }: MiniAppProps) {
  const today = dayKey();
  const { daily, stats, saveDaily, finishDaily } = useKelimeStore();
  const [mode, setMode] = useState<Mode>('daily');
  const [practice, setPractice] = useState<Practice>(freshPractice);
  const [current, setCurrent] = useState('');
  const toast = useToast((s) => s.show);

  // Günlük oyun doğrudan kalıcı depodan okunur; pratik yerel.
  const target = mode === 'daily' ? dailyWord() : practice.target;
  const entry: DailyEntry = mode === 'daily' ? (daily[today] ?? EMPTY) : practice;
  const { rows, done, won } = entry;
  const states = useMemo(() => keyStates(rows), [rows]);

  const switchMode = (m: Mode) => {
    setMode(m); setCurrent('');
    if (m === 'practice') setPractice(freshPractice());
  };

  const finish = useCallback((finalRows: Row[], didWin: boolean) => {
    const tries = finalRows.length;
    if (mode === 'daily') finishDaily(today, didWin, tries);
    Haptics.notificationAsync(didWin ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    onResult({
      score: didWin ? Math.round(((MAX_TRIES + 1 - tries) / MAX_TRIES) * 100) : 0,
      points: didWin ? (MAX_TRIES + 1 - tries) * 100 : 0,
      xp: mode === 'daily' ? (didWin ? 50 : 20) : didWin ? 25 : 10,
      label: didWin ? `${tries}/${MAX_TRIES} denemede bildin` : `Bilemedin: ${target}`,
      shareText: shareText(finalRows, didWin, mode === 'daily'),
      meta: { mode, target, tries },
    });
  }, [finishDaily, mode, onResult, target, today]);

  const submit = () => {
    if (done) return;
    if (current.length < WORD_LEN) { toast('5 harf gerekli', 'alert-circle'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); return; }
    if (!isAllowed(current)) { toast('Sözlükte yok', 'alert-circle'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); return; }
    const marks = evaluate(current, target);
    const nextRows = [...rows, { word: current, marks }];
    const didWin = marks.every((m) => m === 'green');
    const isDone = didWin || nextRows.length >= MAX_TRIES;
    const next: DailyEntry = { rows: nextRows, done: isDone, won: didWin };
    if (mode === 'daily') saveDaily(today, next); else setPractice((p) => ({ ...p, ...next }));
    setCurrent('');
    if (isDone) setTimeout(() => finish(nextRows, didWin), WORD_LEN * 120 + 200);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const onKey = (k: string) => { if (!done && current.length < WORD_LEN) setCurrent(current + k); };
  const onDelete = () => setCurrent(current.slice(0, -1));

  const winRate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  const title = mode === 'daily' ? `OdyoKelime #${puzzleNumber()}` : 'Pratik';

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <AppText variant="h2">{title}</AppText>
          <AppText variant="small" muted>{mode === 'daily' ? 'Günün odyoloji kelimesi · herkese aynı' : 'Rastgele kelime, sınırsız'}</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="Günlük" small active={mode === 'daily'} onPress={() => switchMode('daily')} icon="calendar" />
          <Chip label="Pratik" small active={mode === 'practice'} onPress={() => switchMode('practice')} icon="infinite" color={colors.accent2} />
        </View>
      </View>

      <Grid rows={rows} current={current} />

      {done ? (
        <Animated.View entering={ZoomIn} style={{ gap: space.lg }}>
          <ShareCard
            title={won ? `${rows.length}/${MAX_TRIES} 🎉` : 'Olmadı 😶'}
            subtitle={`Kelime: ${target}${mode === 'daily' ? ` · #${puzzleNumber()}` : ''}`}
            gradient={won ? gradients.mint : gradients.night}
            makerName={SEBAHATTIN.name}
            shareText={shareText(rows, won, mode === 'daily')}
          >
            <AppText variant="h3" color={colors.white} style={{ lineHeight: 26 }}>{rows.map((r) => r.marks.map((m) => (m === 'green' ? '🟩' : m === 'yellow' ? '🟨' : '⬛')).join('')).join('\n')}</AppText>
          </ShareCard>
          {mode === 'daily' ? (
            <>
              <View style={styles.stats}>
                <Stat label="Oynanan" value={stats.played} icon="grid" />
                <Stat label="Kazanma" value={`%${winRate}`} icon="trophy" color={colors.amber} />
                <Stat label="Seri" value={stats.streak} icon="flame" color={colors.coral} />
              </View>
              <Card>
                <AppText variant="bodyStrong">Yarın yeni kelime</AppText>
                <AppText variant="small" muted style={{ marginTop: 4 }}>Günlük kelime gece yarısı değişir. Beklemek istemezsen Pratik modunda rastgele kelimelerle devam et.</AppText>
              </Card>
              <Button title="Pratik Yap" icon="infinite" variant="secondary" onPress={() => switchMode('practice')} />
            </>
          ) : (
            <Button title="Yeni Kelime" icon="refresh" size="lg" onPress={() => switchMode('practice')} />
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown} style={{ gap: space.md }}>
          <Keyboard states={states} onKey={onKey} onEnter={submit} onDelete={onDelete} disabled={done} />
          <AppText variant="tiny" faint center>🟩 yerinde · 🟨 kelimede var · ⬛ yok · {MAX_TRIES - rows.length} hak kaldı</AppText>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stats: { flexDirection: 'row', gap: space.md },
});
