import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { AppText, Button, Card, ProgressBar, ShareCard, useToast } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import { gradeFor, subscales, type Questionnaire } from '../questionnaires';
import type { SavedResult } from '../store';

export function buildClinicianNote(q: Questionnaire, score: number, answers: number[], date: string): string {
  const g = gradeFor(q, score);
  const subs = subscales(q, answers).map((s) => `${s.label} ${s.score}/${s.max}`).join(', ');
  const high = answers.map((a, i) => (a === 4 ? i + 1 : null)).filter((x): x is number => x != null);
  return `${q.full} (${q.name}) · ${date}\nToplam: ${score}/${q.max} → ${g.label}\nAlt ölçekler: ${subs}\n"Evet" yanıtlanan maddeler: ${high.length ? high.join(', ') : 'yok'}\nÖz-bildirim anketidir; tanı yerine geçmez. aihearX`;
}

export function ResultView({ q, answers, previous, onAgain, onHome }: { q: Questionnaire; answers: number[]; previous?: SavedResult; onAgain: () => void; onHome: () => void }) {
  const toast = useToast((s) => s.show);
  const score = answers.reduce((s, a) => s + a, 0);
  const g = gradeFor(q, score);
  const date = new Date().toLocaleDateString('tr-TR');
  const note = buildClinicianNote(q, score, answers, date);
  const delta = previous ? score - previous.score : null;

  return (
    <View style={{ gap: space.md }}>
      <Animated.View entering={FadeInDown.springify()}>
        <ShareCard title={`${q.name}: ${score}`} subtitle={`${g.label} · ${score}/${q.max}`} gradient={q.gradient} makerName={SEBAHATTIN.name} shareText={note} footer={`aihearX · ${date}`}>
          <AppText variant="body" color="rgba(255,255,255,0.92)">{g.text}</AppText>
          {delta != null ? <AppText variant="small" color="rgba(255,255,255,0.8)" style={{ marginTop: 6 }}>Önceki sonuca göre {delta === 0 ? 'değişim yok' : delta > 0 ? `+${delta} puan (artış)` : `${delta} puan (azalma)`}</AppText> : null}
        </ShareCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100)}>
        <Card>
          <AppText variant="tiny" faint>ALT ÖLÇEKLER</AppText>
          {subscales(q, answers).map((s) => (
            <View key={s.label} style={{ marginTop: 10 }}>
              <View style={styles.row}><AppText variant="small" muted style={{ flex: 1 }}>{s.label}</AppText><AppText variant="small" color={g.color}>{s.score}/{s.max}</AppText></View>
              <View style={{ marginTop: 4 }}><ProgressBar value={s.score / s.max} gradient={q.gradient} height={6} /></View>
            </View>
          ))}
          <AppText variant="tiny" faint style={{ marginTop: space.md }}>DERECELENDİRME</AppText>
          {q.grades.map((gr) => (
            <View key={gr.label} style={[styles.row, { marginTop: 6 }]}>
              <View style={[styles.dot, { backgroundColor: gr.color, opacity: gr.label === g.label ? 1 : 0.35 }]} />
              <AppText variant="small" muted={gr.label !== g.label} style={{ flex: 1 }}>{gr.label}</AppText>
              <AppText variant="small" faint>{gr.min}–{gr.max}</AppText>
            </View>
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160)}>
        <Card style={{ borderColor: colors.accent2 }}>
          <AppText variant="tiny" color={colors.accent2}>KLİNİSYENE NOT</AppText>
          <AppText variant="small" style={{ marginTop: 6, lineHeight: 20 }}>{note}</AppText>
          <Button title="Notu Kopyala" icon="copy" variant="secondary" size="sm" style={{ marginTop: space.md, alignSelf: 'flex-start' }} onPress={async () => { await Clipboard.setStringAsync(note); toast('Not kopyalandı', 'copy'); }} />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220)}>
        <Card>
          <AppText variant="small" faint>Bu anket bir öz-bildirim aracıdır; puan, yakınmanızın sizi ne kadar etkilediğini gösterir, tanı yerine geçmez. Sonucu bir odyolog veya KBB uzmanıyla paylaşın.</AppText>
        </Card>
      </Animated.View>
      <View style={styles.row}>
        <Button title="Anketler" icon="clipboard" onPress={onHome} style={{ flex: 1 }} />
        <Button title="Tekrarla" variant="secondary" icon="refresh" onPress={onAgain} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
