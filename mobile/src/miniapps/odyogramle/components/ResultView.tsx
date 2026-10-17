import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, type Href } from 'expo-router';
import { AppText, Button, Card, ShareCard, useToast } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { Case } from '../cases';
import { CATEGORY_NAME, LATERALITY_NAME, dxByKey } from '../diagnoses';
import { MAX_GUESSES, discussText, emojiAudiogram, marksLine, pointsFor, shareText } from '../logic';
import type { Play } from '../store';
import { CATEGORY_COLOR } from './DiagnosisPicker';

type Props = { c: Case; play: Play; daily: boolean; onArchive: () => void; onDrill: () => void; children?: React.ReactNode };

const verdict = (p: Play): { emoji: string; title: string; sub: string } => {
  if (!p.solved) return { emoji: '📚', title: 'Bu sefer olmadı', sub: 'Açıklamayı oku; aynı tablo bir gün karşına çıkacak.' };
  const n = p.guesses.length;
  if (n === 1) return { emoji: '🐚', title: 'İlk bakışta!', sub: 'Odyogram artık ana dilin.' };
  if (n <= 2) return { emoji: '🏆', title: 'Harika', sub: 'Tek ipucuyla çözdün.' };
  if (n <= 4) return { emoji: '🎯', title: 'Çözdün', sub: 'İpuçlarını iyi okudun.' };
  return { emoji: '👂', title: 'Son anda', sub: 'Zor vakaydı; ipuçları seni taşıdı.' };
};

/** Adım 5: sonuç. Paylaşım kartı, cevap ve öğretici noktalar, tartış butonu. */
export function ResultView({ c, play, daily, onArchive, onDrill, children }: Props) {
  const toast = useToast((s) => s.show);
  const dx = dxByKey(c.answer);
  const v = verdict(play);
  const points = pointsFor(play.guesses.length, play.solved);

  const discuss = async () => {
    await Clipboard.setStringAsync(discussText(c, play.guesses, play.solved, daily));
    toast('Metin kopyalandı · Ağ\'a yapıştır', 'chatbubbles');
    router.push('/(tabs)/akis' as Href);
  };

  return (
    <View style={{ gap: space.lg }}>
      <Animated.View entering={ZoomIn.duration(320)} style={styles.verdict}>
        <AppText style={{ fontSize: 52, lineHeight: 62 }}>{v.emoji}</AppText>
        <AppText variant="h1" center>{v.title}</AppText>
        <AppText variant="small" muted center>{v.sub}</AppText>
        <View style={styles.pointsRow}>
          <AppText variant="h3" color={play.solved ? colors.mint : colors.textFaint}>{play.solved ? `${play.guesses.length}/${MAX_GUESSES} tahmin` : `X/${MAX_GUESSES}`}</AppText>
          <View style={styles.sep} />
          <AppText variant="h3" color={colors.amber}>+{points} puan</AppText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120)}>
        <ShareCard
          title={play.solved ? `${play.guesses.length}/${MAX_GUESSES} 🎯` : 'Çözülemedi'}
          subtitle={`${dx?.name ?? c.answer} · ${LATERALITY_NAME[c.laterality]}`}
          gradient={play.solved ? gradients.gold : gradients.night}
          makerName={SEBAHATTIN.name}
          shareText={shareText(c, play.guesses, play.solved, daily)}
        >
          <AppText variant="h3" color={colors.white} style={{ lineHeight: 26 }}>{emojiAudiogram(c)}</AppText>
          <AppText variant="h3" color={colors.white} style={{ marginTop: 6 }}>{marksLine(play.guesses)}</AppText>
        </ShareCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)}>
        <Card>
          <View style={styles.catRow}>
            <View style={[styles.catDot, { backgroundColor: CATEGORY_COLOR[c.category] }]} />
            <AppText variant="tiny" color={CATEGORY_COLOR[c.category]}>Cevap · {CATEGORY_NAME[c.category]} · {LATERALITY_NAME[c.laterality]}</AppText>
          </View>
          <AppText variant="h2" style={{ marginTop: 4 }}>{dx?.name ?? c.answer}</AppText>
          <AppText variant="body" muted style={{ marginTop: space.sm, lineHeight: 23 }}>{c.explanation}</AppText>
          <View style={styles.teachHead}>
            <Ionicons name="school" size={14} color={colors.accent} />
            <AppText variant="tiny" color={colors.accent}>Öğretici nokta</AppText>
          </View>
          {c.teaching.map((t, i) => (
            <View key={i} style={styles.bullet}>
              <View style={styles.num}><AppText variant="tiny" color={colors.white}>{i + 1}</AppText></View>
              <AppText variant="body" style={{ flex: 1, lineHeight: 22 }}>{t}</AppText>
            </View>
          ))}
          <AppText variant="tiny" faint style={{ marginTop: space.md }}>Kaynak: {c.source}</AppText>
          <AppText variant="tiny" faint style={{ marginTop: 4 }}>Öğretici kompozit vaka; gerçek hasta verisi değildir ve tanı yerine geçmez.</AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260)} style={{ gap: space.sm }}>
        <Button title="Bu vakayı tartış" icon="chatbubbles" size="lg" gradient={gradients.ocean} onPress={discuss} />
        <View style={styles.row}>
          <Button title={daily ? 'Arşivden Çöz' : 'Arşive Dön'} icon="albums" variant="secondary" onPress={onArchive} style={{ flex: 1 }} />
          <Button title="Antrenman" icon="barbell" variant="secondary" onPress={onDrill} style={{ flex: 1 }} />
        </View>
      </Animated.View>

      {children ? <Animated.View entering={FadeInDown.delay(320)}>{children}</Animated.View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  verdict: { alignItems: 'center', gap: 4, paddingTop: space.sm },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm },
  sep: { width: 1, height: 18, backgroundColor: colors.border },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  teachHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.lg, marginBottom: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', marginTop: 6 },
  num: { width: 20, height: 20, borderRadius: 6, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  row: { flexDirection: 'row', gap: space.sm },
});
