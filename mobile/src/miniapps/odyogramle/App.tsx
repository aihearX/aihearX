import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { dayKey } from '@/core/util/day';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { caseById, type Case } from './cases';
import { CATEGORY_NAME, LATERALITY_NAME, dxByKey, type Laterality } from './diagnoses';
import { MAX_GUESSES, dailyCase, emojiAudiogram, evaluate, puzzleNumber, shareText, type Guess } from './logic';
import { useOdyogramleStore, type Play } from './store';
import { CaseView } from './components/CaseView';
import { DiagnosisPicker } from './components/DiagnosisPicker';
import { GuessRows } from './components/GuessRows';
import { Archive } from './components/Archive';

type Mode = 'daily' | 'archive';

const fresh = (caseId: number): Play => ({ caseId, guesses: [], done: false, solved: false });

export default function Odyogramle({ onResult }: MiniAppProps) {
  const today = dayKey();
  const { daily, archive, played, solved, saveDaily, saveArchive, bump } = useOdyogramleStore();
  const todayCase = dailyCase();
  const [mode, setMode] = useState<Mode>('daily');
  const [c, setC] = useState<Case>(todayCase);
  const [browsing, setBrowsing] = useState(false);

  // Oyun durumu doğrudan kalıcı depodan türetilir (günlük: dayKey, arşiv: caseId).
  const play: Play = mode === 'daily' ? (daily[today] ?? fresh(todayCase.id)) : (archive[c.id] ?? fresh(c.id));

  const persist = useCallback((p: Play) => { if (mode === 'daily') saveDaily(today, p); else saveArchive(p); }, [mode, saveArchive, saveDaily, today]);

  const guess = (dx: string, lat: Laterality) => {
    if (play.done) return;
    const mark = evaluate(c, dx, lat);
    const g: Guess = { dx, lat, mark };
    const guesses = [...play.guesses, g];
    const won = mark === 'green';
    const done = won || guesses.length >= MAX_GUESSES;
    const next: Play = { caseId: c.id, guesses, done, solved: won };
    persist(next);
    Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : mark === 'gray' ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (done) {
      bump(won);
      onResult({
        score: won ? Math.round(((MAX_GUESSES + 1 - guesses.length) / MAX_GUESSES) * 100) : 0,
        points: won ? (MAX_GUESSES + 1 - guesses.length) * 100 : 0,
        xp: mode === 'daily' ? (won ? 60 : 25) : won ? 30 : 10,
        label: won ? `${guesses.length}/${MAX_GUESSES} tahminde çözdün` : 'Vaka çözülemedi',
        shareText: shareText(c, guesses, won, mode === 'daily'),
        meta: { caseId: c.id, mode, tries: guesses.length },
      });
    }
  };

  const openDaily = () => { setMode('daily'); setBrowsing(false); setC(todayCase); };
  const openArchiveCase = (id: number) => {
    const found = caseById(id);
    if (!found) return;
    setMode('archive'); setBrowsing(false); setC(found);
  };

  const answerDx = dxByKey(c.answer);
  const title = mode === 'daily' ? `Odyogramle #${puzzleNumber()}` : `Arşiv · Vaka #${c.id}`;
  const unlockedHints = Math.min(5, play.done ? 5 : play.guesses.length);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <AppText variant="h2">{browsing ? 'Arşiv' : title}</AppText>
          <AppText variant="small" muted>{browsing ? 'Geçmiş vakaları çöz' : mode === 'daily' ? 'Günün vakası · herkese aynı' : 'Arşiv vakası'}</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="Günlük" small active={mode === 'daily' && !browsing} onPress={openDaily} icon="calendar" />
          <Chip label="Arşiv" small active={browsing} onPress={() => setBrowsing(true)} icon="albums" color={colors.accent2} />
        </View>
      </View>

      {browsing ? (
        <Animated.View entering={FadeInDown} style={{ gap: space.md }}>
          <View style={styles.stats}>
            <Stat label="Oynanan" value={played} icon="albums" />
            <Stat label="Çözülen" value={solved} icon="trophy" color={colors.amber} />
          </View>
          <Archive archive={archive} todayId={todayCase.id} onPick={openArchiveCase} />
        </Animated.View>
      ) : (
        <>
          <CaseView c={c} unlockedHints={unlockedHints} label={title} />
          <GuessRows guesses={play.guesses} />
          {play.done && answerDx ? (
            <Animated.View entering={ZoomIn} style={{ gap: space.lg }}>
              <ShareCard
                title={play.solved ? `${play.guesses.length}/${MAX_GUESSES} 🎯` : 'Çözülemedi'}
                subtitle={`${answerDx.name} · ${LATERALITY_NAME[c.laterality]}`}
                gradient={play.solved ? gradients.gold : gradients.night}
                makerName={SEBAHATTIN.name}
                shareText={shareText(c, play.guesses, play.solved, mode === 'daily')}
              >
                <AppText variant="h3" color={colors.white} style={{ lineHeight: 26 }}>{emojiAudiogram(c)}</AppText>
                <AppText variant="h3" color={colors.white} style={{ marginTop: 6 }}>{play.guesses.map((g) => (g.mark === 'green' ? '🟩' : g.mark === 'orange' ? '🟧' : g.mark === 'yellow' ? '🟨' : '⬛')).join('')}</AppText>
              </ShareCard>
              <Card>
                <AppText variant="tiny" faint>Cevap · {CATEGORY_NAME[c.category]}</AppText>
                <AppText variant="h3" style={{ marginTop: 2 }}>{answerDx.name}</AppText>
                <AppText variant="body" muted style={{ marginTop: space.sm }}>{c.explanation}</AppText>
                <AppText variant="tiny" faint style={{ marginTop: space.md }}>Kaynak: {c.source}</AppText>
                <AppText variant="tiny" faint style={{ marginTop: 4 }}>Öğretici kompozit vaka; gerçek hasta verisi değildir ve tanı yerine geçmez.</AppText>
              </Card>
              {mode === 'daily' ? (
                <Button title="Arşivden Vaka Çöz" icon="albums" variant="secondary" onPress={() => setBrowsing(true)} />
              ) : (
                <Button title="Arşive Dön" icon="arrow-back" variant="secondary" onPress={() => setBrowsing(true)} />
              )}
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown} style={{ gap: space.md }}>
              <AppText variant="tiny" faint>🟩 tanı+taraf · 🟧 tanı doğru ya da kategori+taraf · 🟨 kategori · ⬛ uzak</AppText>
              <DiagnosisPicker usedKeys={play.guesses.map((g) => g.dx)} onGuess={guess} disabled={play.done} />
            </Animated.View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stats: { flexDirection: 'row', gap: space.md },
});
