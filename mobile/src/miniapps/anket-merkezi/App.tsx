import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card, IconBadge } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { dayKey } from '@/core/util/day';
import { gradeFor, QUESTIONNAIRES, type Questionnaire } from './questionnaires';
import { useSurveyStore } from './store';
import { QuestionFlow } from './components/QuestionFlow';
import { ResultView } from './components/ResultView';

type Phase = { kind: 'home' } | { kind: 'flow'; q: Questionnaire } | { kind: 'result'; q: Questionnaire; answers: number[] };

export default function App({ onResult, role }: MiniAppProps) {
  const [phase, setPhase] = useState<Phase>({ kind: 'home' });
  const results = useSurveyStore((s) => s.results);
  const save = useSurveyStore((s) => s.save);
  const isPro = role === 'odyolog' || role === 'odyometrist' || role === 'kbb' || role === 'ogrenci';

  const finish = (q: Questionnaire, answers: number[]) => {
    const score = answers.reduce((s, a) => s + a, 0);
    const g = gradeFor(q, score);
    const prev = results[q.id]?.[0];
    save(q.id, { score, grade: g.label, date: dayKey(), answers });
    onResult({
      label: `${q.name}: ${score}`,
      xp: 20,
      points: 10,
      shareText: `${q.name} anketini tamamladım: ${score}/${q.max} (${g.label}). aihearX`,
      meta: { id: q.id, score, grade: g.label, prev: prev?.score ?? null },
    });
    setPhase({ kind: 'result', q, answers });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {phase.kind === 'home' ? (
        <View style={{ gap: space.md }}>
          <Animated.View entering={FadeInDown}>
            <Card gradient={gradients.mint}>
              <AppText variant="tiny" color="rgba(255,255,255,0.8)">DOĞRULANMIŞ ÖZ-BİLDİRİM ANKETLERİ</AppText>
              <AppText variant="h1" color={colors.white} style={{ marginTop: 4 }}>{isPro ? 'Hastanıza gönderin, puanı kartla alın' : 'Beş dakikada yakınmanızı ölçün'}</AppText>
              <AppText variant="small" color="rgba(255,255,255,0.88)" style={{ marginTop: 4 }}>Evet = 4, Bazen = 2, Hayır = 0 puan. Sonuç kartını klinisyeninize gönderebilirsiniz.</AppText>
            </Card>
          </Animated.View>
          {QUESTIONNAIRES.map((q, i) => {
            const last = results[q.id]?.[0];
            const g = last ? gradeFor(q, last.score) : null;
            return (
              <Animated.View key={q.id} entering={FadeInDown.delay(80 + i * 70)}>
                <Card onPress={() => setPhase({ kind: 'flow', q })}>
                  <View style={styles.row}>
                    <IconBadge icon={q.icon} gradient={q.gradient} size={46} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <AppText variant="h3">{q.name}</AppText>
                        <AppText variant="tiny" faint>· {q.topic}</AppText>
                      </View>
                      <AppText variant="small" muted numberOfLines={1}>{q.full}</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                  </View>
                  <AppText variant="small" muted style={{ marginTop: space.sm }}>{q.intro}</AppText>
                  <View style={[styles.row, { marginTop: space.sm }]}>
                    <AppText variant="tiny" faint>{q.items.length} SORU</AppText>
                    <View style={{ flex: 1 }} />
                    {last && g ? (
                      <View style={styles.row}>
                        <View style={[styles.dot, { backgroundColor: g.color }]} />
                        <AppText variant="small" color={g.color}>Son: {last.score}/{q.max}</AppText>
                        <AppText variant="tiny" faint>{last.date}</AppText>
                      </View>
                    ) : <AppText variant="small" faint>Henüz doldurulmadı</AppText>}
                  </View>
                  {results[q.id] && (results[q.id]?.length ?? 0) > 1 ? (
                    <AppText variant="tiny" faint style={{ marginTop: 6 }}>GEÇMİŞ: {results[q.id]!.slice(0, 5).map((r) => r.score).join(' → ')}</AppText>
                  ) : null}
                </Card>
              </Animated.View>
            );
          })}
          <AppText variant="small" faint center style={{ marginTop: space.sm }}>Sonuçlar yalnızca bu cihazda saklanır. Tanı yerine geçmez.</AppText>
        </View>
      ) : null}
      {phase.kind === 'flow' ? <QuestionFlow q={phase.q} onDone={(a) => finish(phase.q, a)} onCancel={() => setPhase({ kind: 'home' })} /> : null}
      {phase.kind === 'result' ? (
        <ResultView q={phase.q} answers={phase.answers} previous={results[phase.q.id]?.[1]} onAgain={() => setPhase({ kind: 'flow', q: phase.q })} onHome={() => setPhase({ kind: 'home' })} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingBottom: space.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
