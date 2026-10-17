import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Audiogram, Button, Card, IconBadge, ProgressBar } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { makeRound, LEVEL_META, type Level, type Question } from './cases';
import { OptionButton } from './components/OptionButton';
import { RoundResult } from './components/RoundResult';

const TOTAL = 10;
type Phase = 'menu' | 'play' | 'done';

export default function App({ onResult }: MiniAppProps) {
  const { width } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('menu');
  const [level, setLevel] = useState<Level>('tip');
  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const start = useCallback((l: Level) => {
    setLevel(l); setQs(makeRound(l, TOTAL)); setIdx(0); setPicked(null); setCorrect(0); setStreak(0); setBest(0); setPhase('play');
  }, []);

  const q = qs[idx];
  const choose = (opt: string) => {
    if (!q || picked) return;
    setPicked(opt);
    const ok = opt === q.answer;
    if (ok) {
      const s = streak + 1; setStreak(s); setBest((b) => Math.max(b, s)); setCorrect((c) => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setStreak(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const next = () => {
    if (idx + 1 < qs.length) { setIdx(idx + 1); setPicked(null); return; }
    const score = Math.round((correct / TOTAL) * 100);
    const title = LEVEL_META[level].title;
    onResult({ score, label: `${correct}/${TOTAL} · ${title}`, points: correct * 10 + best * 2, xp: 30, shareText: shareText(correct, best, title) });
    setPhase('done');
  };

  const shareText = (c: number, b: number, t: string) => `Odyogram Okulu'nda ${t} seviyesinde ${c}/${TOTAL} yaptım, en uzun serim ${b}. Sen de dene: aihearX`;
  const agWidth = useMemo(() => Math.min(width - 2 * space.lg - 2 * space.lg, 360), [width]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {phase === 'menu' ? (
        <View style={{ gap: space.md }}>
          <Animated.View entering={FadeInDown}>
            <Card gradient={gradients.ocean}>
              <AppText variant="tiny" color="rgba(255,255,255,0.8)">10 SORU · ANINDA AÇIKLAMA</AppText>
              <AppText variant="h1" color={colors.white} style={{ marginTop: 6 }}>Odyogramı bakışta oku</AppText>
              <AppText variant="body" color="rgba(255,255,255,0.88)" style={{ marginTop: 6 }}>Bir seviye seç. Her soruda rastgele üretilmiş yeni bir odyogram, her cevapta kısa bir ders.</AppText>
            </Card>
          </Animated.View>
          {(Object.keys(LEVEL_META) as Level[]).map((l, i) => (
            <Animated.View key={l} entering={FadeInDown.delay(80 + i * 70)}>
              <Card onPress={() => start(l)}>
                <View style={styles.levelRow}>
                  <IconBadge icon={LEVEL_META[l].icon} gradient={l === 'karisik' ? gradients.gold : gradients.ocean} size={44} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="h3">{LEVEL_META[l].title}</AppText>
                    <AppText variant="small" muted>{LEVEL_META[l].desc}</AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </View>
              </Card>
            </Animated.View>
          ))}
          <AppText variant="small" faint center style={{ marginTop: space.sm }}>Sağ kulak O kırmızı, sol kulak X mavi; kemik yolu {'<'} {'>'} işaretleri.</AppText>
        </View>
      ) : null}

      {phase === 'play' && q ? (
        <View style={{ gap: space.md }}>
          <View style={styles.topRow}>
            <AppText variant="small" muted>Soru {idx + 1}/{TOTAL}</AppText>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={14} color={streak > 0 ? colors.amber : colors.textFaint} />
              <AppText variant="small" color={streak > 0 ? colors.amber : colors.textFaint}>{streak}</AppText>
            </View>
            <AppText variant="small" color={colors.mint}>{correct} doğru</AppText>
          </View>
          <ProgressBar value={(idx + (picked ? 1 : 0)) / TOTAL} gradient={gradients.ocean} />
          <Animated.View key={idx} entering={FadeIn.duration(250)}>
            <Card style={{ alignItems: 'center' }}>
              <AppText variant="tiny" color={colors.accent2} style={{ alignSelf: 'flex-start' }}>{LEVEL_META[q.level].title.toUpperCase()}</AppText>
              <AppText variant="h3" style={{ alignSelf: 'flex-start', marginTop: 4, marginBottom: space.sm }}>{q.prompt}</AppText>
              <Audiogram data={q.data} width={agWidth} height={Math.round(agWidth * 0.78)} highlightFreqs={q.highlightFreqs} />
            </Card>
          </Animated.View>
          <View key={`opts${idx}`} style={{ gap: space.sm }}>
            {q.options.map((o, i) => {
              const state = !picked ? 'idle' : o === q.answer ? (picked === o ? 'correct' : 'reveal') : picked === o ? 'wrong' : 'dim';
              return <OptionButton key={o} label={o} index={i} state={state} onPress={picked ? undefined : () => choose(o)} />;
            })}
          </View>
          {picked ? (
            <Animated.View entering={FadeInDown.springify()} style={{ gap: space.md }}>
              <Card style={{ borderColor: picked === q.answer ? colors.mint : colors.red }}>
                <AppText variant="bodyStrong" color={picked === q.answer ? colors.mint : colors.red}>{picked === q.answer ? 'Doğru!' : `Doğru cevap: ${q.answer}`}</AppText>
                <AppText variant="body" muted style={{ marginTop: 4 }}>{q.explain}</AppText>
              </Card>
              <Button title={idx + 1 < TOTAL ? 'Sonraki' : 'Sonucu Gör'} icon="arrow-forward" onPress={next} />
            </Animated.View>
          ) : null}
        </View>
      ) : null}

      {phase === 'done' ? (
        <RoundResult correct={correct} total={TOTAL} bestStreak={best} levelTitle={LEVEL_META[level].title} shareText={shareText(correct, best, LEVEL_META[level].title)} onAgain={() => start(level)} onMenu={() => setPhase('menu')} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
