import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { FeedbackFlash, sfx } from '@/core/game';
import { useSettings } from '@/core/store/settings';
import { dayKey } from '@/core/util/day';
import type { MiniAppProps } from '@/core/registry/types';
import { caseById, type Case } from './cases';
import type { Laterality } from './diagnoses';
import { MAX_GUESSES, dailyCase, evaluate, pointsFor, puzzleNumber, shareText, type Guess } from './logic';
import { liveStreak, useOdyogramleStore, type Play } from './store';
import { ModeBar, type Mode } from './components/ModeBar';
import { CaseView } from './components/CaseView';
import { HintCards } from './components/HintCards';
import { GuessRows } from './components/GuessRows';
import { DiagnosisPicker } from './components/DiagnosisPicker';
import { ResultView } from './components/ResultView';
import { StatsPanel } from './components/StatsPanel';
import { Archive } from './components/Archive';
import { Drill } from './components/Drill';

const fresh = (caseId: number): Play => ({ caseId, guesses: [], done: false, solved: false });

export default function Odyogramle({ onResult }: MiniAppProps) {
  const today = dayKey();
  const store = useOdyogramleStore();
  const haptics = useSettings((s) => s.haptics);
  const todayCase = dailyCase();
  const [mode, setMode] = useState<Mode>('daily');
  const [c, setC] = useState<Case>(todayCase);
  const [browsing, setBrowsing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [drillActive, setDrillActive] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'good' | 'bad' | null; trigger: number }>({ kind: null, trigger: 0 });

  const daily = mode === 'daily';
  // Oyun durumu doğrudan kalıcı depodan türetilir (günlük: dayKey, arşiv: caseId).
  const play: Play = daily ? (store.daily[today] ?? fresh(todayCase.id)) : (store.archive[c.id] ?? fresh(c.id));
  const streak = liveStreak(store);

  const persist = useCallback((p: Play) => { if (daily) store.saveDaily(today, p); else store.saveArchive(p); }, [daily, store, today]);

  const guess = (dx: string, lat: Laterality) => {
    if (play.done) return;
    const mark = evaluate(c, dx, lat);
    const g: Guess = { dx, lat, mark };
    const guesses = [...play.guesses, g];
    const won = mark === 'green';
    const done = won || guesses.length >= MAX_GUESSES;
    const next: Play = { caseId: c.id, guesses, done, solved: won };
    persist(next);
    setPickerOpen(false);
    setFlash((f) => ({ kind: won ? 'good' : mark === 'gray' ? 'bad' : null, trigger: f.trigger + 1 }));
    if (haptics) Haptics.notificationAsync(won ? Haptics.NotificationFeedbackType.Success : mark === 'gray' ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (won) sfx('levelUp'); else if (done) sfx('gameOver'); else sfx(mark === 'gray' ? 'buzz' : 'ding', 0.6);
    if (done) {
      store.finish(next, daily, today);
      onResult({
        score: won ? Math.round(((MAX_GUESSES + 1 - guesses.length) / MAX_GUESSES) * 100) : 0,
        points: pointsFor(guesses.length, won),
        xp: daily ? (won ? 60 : 25) : won ? 30 : 10,
        label: won ? `${guesses.length}/${MAX_GUESSES} tahminde çözdün` : 'Vaka çözülemedi',
        shareText: shareText(c, guesses, won, daily),
        meta: { caseId: c.id, mode, tries: guesses.length },
      });
    }
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    if (m === 'daily') { setBrowsing(false); setC(todayCase); }
    if (m === 'archive') setBrowsing(true);
  };
  const openArchiveCase = (id: number) => {
    const found = caseById(id);
    if (!found) return;
    setMode('archive'); setBrowsing(false); setC(found);
  };
  const toArchive = () => { setMode('archive'); setBrowsing(true); };
  const onDrillActive = useCallback((a: boolean) => setDrillActive(a), []);

  const title = daily ? `Odyogramle #${puzzleNumber()}` : `Arşiv · Vaka #${c.id}`;
  const unlockedHints = Math.min(5, play.done ? 5 : play.guesses.length);
  const dateLabel = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

  const stats = <StatsPanel streak={streak} bestStreak={store.bestStreak} played={store.played} solved={store.solved} dist={store.dist} drillBest={store.drill.best} highlight={play.done && play.solved ? play.guesses.length : undefined} />;

  return (
    <View style={{ flex: 1 }}>
      {!drillActive ? (
        <View style={styles.modeWrap}><ModeBar mode={mode} onChange={changeMode} /></View>
      ) : null}

      {mode === 'drill' ? (
        <Drill onResult={onResult} onActive={onDrillActive} onDaily={() => changeMode('daily')} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.top}>
            <View style={{ flex: 1 }}>
              <AppText variant="h2">{browsing ? 'Arşiv' : title}</AppText>
              <AppText variant="small" muted>{browsing ? 'Geçmiş vakaları çöz, dağılımını büyüt' : daily ? `Günün vakası · ${dateLabel} · herkese aynı` : 'Arşiv vakası · puan ve dağılım sayılır'}</AppText>
            </View>
            <View style={[styles.streak, streak > 0 && styles.streakOn]}>
              <Ionicons name="flame" size={14} color={streak > 0 ? colors.amber : colors.textFaint} />
              <AppText variant="small" color={streak > 0 ? colors.amber : colors.textFaint}>{streak}</AppText>
            </View>
          </View>

          {browsing ? (
            <Animated.View entering={FadeInDown} style={{ gap: space.lg }}>
              {stats}
              <Archive archive={store.archive} todayId={todayCase.id} onPick={openArchiveCase} />
            </Animated.View>
          ) : (
            <>
              <CaseView c={c} label={title} />
              <HintCards hints={c.hints} unlocked={unlockedHints} />
              <GuessRows guesses={play.guesses} />
              {play.done ? (
                <ResultView c={c} play={play} daily={daily} onArchive={toArchive} onDrill={() => changeMode('drill')}>
                  {stats}
                </ResultView>
              ) : (
                <Animated.View entering={FadeInDown} style={{ gap: space.sm }}>
                  <Button title={`Tahmin Et · ${MAX_GUESSES - play.guesses.length} hak`} icon="flask" size="lg" gradient={gradients.gold} onPress={() => setPickerOpen(true)} />
                  <Card>
                    <AppText variant="tiny" faint>Renk kodu</AppText>
                    <AppText variant="small" muted style={{ marginTop: 4 }}>🟩 tanı + taraf doğru · 🟧 tanı doğru ya da kategori + taraf · 🟨 kategori doğru · ⬛ uzak</AppText>
                  </Card>
                </Animated.View>
              )}
              {!daily ? <Button title="Arşive Dön" icon="arrow-back" variant="ghost" onPress={toArchive} /> : null}
            </>
          )}
        </ScrollView>
      )}

      <DiagnosisPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} usedKeys={play.guesses.map((g) => g.dx)} onGuess={guess} remaining={MAX_GUESSES - play.guesses.length} />
      <FeedbackFlash kind={flash.kind} trigger={flash.trigger} />
    </View>
  );
}

const styles = StyleSheet.create({
  modeWrap: { paddingHorizontal: 16, paddingTop: 12 },
  content: { padding: 16, paddingBottom: 40, gap: space.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  streakOn: { backgroundColor: colors.bg, borderColor: colors.amber },
});
