import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';
import { AppText, Button, Card, Chip } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import type { Reveal } from '../useTonGame';

type Props = { reveal: Reveal; onContinue: () => void; isDaily: boolean };

/**
 * Cümle sonu perdesi: "Bu ezgiyi tanıdın mı?" → dokununca başlık + söz satırı.
 * Şarkı sonunda başlık doğrudan görünür: "Şarkıyı tamamladın!". Her reveal için `key={reveal.n}` ile taze kurulur.
 */
export function RevealCard({ reveal, onContinue, isDaily }: Props) {
  const songDone = reveal.kind === 'song';
  const [open, setOpen] = useState(songDone);
  const { song } = reveal;
  return (
    <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOut.duration(150)} style={styles.wrap} pointerEvents="box-none">
      <Card gradient={songDone ? gradients.gold : gradients.violet} style={styles.card}>
        <AppText variant="tiny" color="rgba(255,255,255,0.85)">{songDone ? `${song.lines.length}. cümle · son` : `${reveal.phrase + 1}. cümle tamam`}</AppText>
        <AppText variant="h2" color={colors.white} style={{ marginTop: 2 }}>{songDone ? 'Şarkıyı tamamladın! 🎉' : 'Bir cümle çaldın ♪'}</AppText>
        <AppText variant="small" color="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>{reveal.quip}</AppText>
        {open ? (
          <Animated.View entering={ZoomIn.duration(220)} style={styles.answer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <AppText variant="h3">{song.title}</AppText>
              <Chip label={song.origin} small />
            </View>
            <AppText variant="body" muted style={{ marginTop: 4 }}>“{reveal.line}… 🎵”</AppText>
            {song.unverified ? <AppText variant="tiny" faint style={{ marginTop: 4 }}>Ezgi kulaktan aktarıldı; küçük farklar olabilir.</AppText> : null}
          </Animated.View>
        ) : (
          <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.ask, pressed && { opacity: 0.85 }]}>
            <AppText variant="bodyStrong" color={colors.accent}>Bu ezgiyi tanıdın mı?</AppText>
            <AppText variant="tiny" faint>Dokun, cevabı gör</AppText>
          </Pressable>
        )}
        <Button
          title={songDone ? (isDaily ? 'Sonucu gör' : 'Sıradaki şarkı') : 'Devam'}
          icon={songDone ? (isDaily ? 'trophy' : 'play-skip-forward') : 'arrow-forward'}
          variant="secondary"
          style={{ marginTop: space.md }}
          onPress={onContinue}
        />
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 12, zIndex: 8 },
  card: { gap: 2 },
  answer: { backgroundColor: colors.bg, borderRadius: radius.md, padding: space.md, marginTop: space.sm },
  ask: { backgroundColor: colors.bg, borderRadius: radius.md, padding: space.md, marginTop: space.sm, alignItems: 'center', gap: 2 },
});
