import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card, Chip, SectionHeader, ShareCard } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { playTone, type Playback } from '@/core/audio';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { PROFILES, SENTENCES, degrade, lostPhonemes, type Phoneme, type ProfileId } from './data';
import { BananaMap } from './components/BananaMap';
import { PhonemeInfo } from './components/PhonemeInfo';

export default function App({ onResult }: MiniAppProps) {
  const [profileId, setProfileId] = useState<ProfileId>('none');
  const [selected, setSelected] = useState<Phoneme | null>(null);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [shared, setShared] = useState(false);
  const playback = useRef<Playback | null>(null);
  useEffect(() => () => { playback.current?.stop(); }, []);

  const profile = PROFILES.find((p) => p.id === profileId) ?? PROFILES[0]!;
  const lost = useMemo(() => lostPhonemes(profile), [profile]);
  const lostIds = useMemo(() => new Set(lost.map((p) => p.id)), [lost]);
  const sentence = SENTENCES[sentenceIdx % SENTENCES.length]!;
  const degraded = useMemo(() => degrade(sentence, lost), [sentence, lost]);
  const lostLabel = lost.length ? lost.flatMap((p) => p.letters.slice(0, 1)).join(', ') : '—';

  const select = useCallback(async (p: Phoneme) => {
    setSelected(p);
    playback.current?.stop();
    try {
      playback.current = await playTone({ freq: p.freq, duration: 0.5, amplitude: 0.5, ramp: 0.03 });
    } catch { /* ses yok */ }
  }, []);

  const shareText = `"${degraded}" — ${profile.id === 'none' ? 'normal işitmeyle böyle duyulur' : `${profile.name.toLocaleLowerCase('tr')} olan biri konuşmayı böyle duyar`}. Kaybolan sesler: ${lostLabel}. aihearX`;

  const makeCard = () => {
    if (!shared) onResult({ label: profile.name, xp: 20, shareText, meta: { profile: profile.id, lost: lost.map((p) => p.id) } });
    setShared(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppText variant="h1">Konuşma Muzu 🍌</AppText>
      <AppText muted style={{ marginTop: 4 }}>Konuşma sesleri odyogramda muz şeklinde bir bölgede yaşar. Harfe dokun, sesini dinle.</AppText>

      <Card padded={false} style={{ marginTop: space.lg, paddingVertical: space.md, alignItems: 'center' }}>
        <BananaMap profile={profile} selected={selected} lostIds={lostIds} onSelect={select} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
          <Legend color={colors.amber} text="Duyulan ses" />
          <Legend color={colors.bg3} text="Kaybolan ses" />
          {profile.thresholds ? <Legend color={colors.earLeft} text="İşitme eşiği" /> : null}
        </View>
      </Card>

      <PhonemeInfo phoneme={selected} lost={selected ? lostIds.has(selected.id) : false} />

      <SectionHeader title="İşitme kaybı profili" subtitle="Eşik çizgisinin üstünde (daha sessiz) kalan sesler duyulmaz" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PROFILES.map((p) => (
          <Chip key={p.id} label={p.short} active={p.id === profileId} onPress={() => { setProfileId(p.id); setShared(false); }} color={colors.accent} />
        ))}
      </View>

      <Animated.View key={profile.id} entering={FadeInDown.duration(300)}>
        <Card style={{ marginTop: space.md }}>
          <AppText variant="h3">{profile.name}</AppText>
          <AppText muted style={{ marginTop: 4 }}>{profile.explain}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.md, flexWrap: 'wrap' }}>
            <AppText variant="bodyStrong">Kaybolan sesler:</AppText>
            {lost.length ? lost.map((p) => <Chip key={p.id} label={p.label} small active color={colors.red} />) : <Chip label="Hiçbiri 🎉" small active color={colors.mint} />}
          </View>
        </Card>

        <Card gradient={gradients.night} style={{ marginTop: space.md }}>
          <AppText variant="tiny" faint>Bir cümle böyle duyulur</AppText>
          <AppText variant="h2" style={{ marginTop: 6, letterSpacing: 0.5 }}>{degraded}</AppText>
          <AppText variant="small" muted style={{ marginTop: 6 }}>Aslı: {sentence}</AppText>
          <Button title="Başka cümle" variant="ghost" size="sm" icon="shuffle" style={{ alignSelf: 'flex-start', marginTop: 6 }} onPress={() => setSentenceIdx((i) => i + 1)} />
        </Card>
      </Animated.View>

      <Card style={{ marginTop: space.md }}>
        <AppText variant="h3">Aileler için not 💛</AppText>
        <AppText muted style={{ marginTop: 4 }}>
          "Duyuyor ama anlamıyor" çoğu zaman tam olarak budur: kalın sesler gelir, tiz ve sessiz harfler gelmez. Yüksek sesle değil, yavaş ve yüzüne bakarak konuşmak; gürültüyü azaltmak en çok işe yarayan şeylerdir.
        </AppText>
        <AppText variant="small" faint style={{ marginTop: space.sm }}>Profiller temsilidir. Bu uygulama tıbbi tanı yerine geçmez; gerçek odyogram için bir odyoloğa başvur.</AppText>
      </Card>

      {shared ? (
        <View style={{ marginTop: space.xl }}>
          <ShareCard
            title={profile.id === 'none' ? 'Konuşma böyle duyulur' : 'Annem konuşmanın bu kısmını duymuyor'}
            subtitle={profile.name}
            gradient={gradients.gold}
            shareText={shareText}
            makerName={SEBAHATTIN.name}
          >
            <AppText variant="h2" color={colors.white}>{degraded}</AppText>
            <AppText variant="small" color="rgba(255,255,255,0.85)" style={{ marginTop: 6 }}>Kaybolan sesler: {lostLabel}</AppText>
          </ShareCard>
        </View>
      ) : (
        <Button title="Paylaşım kartı oluştur" size="lg" icon="share-social" gradient={gradients.gold} style={{ marginTop: space.xl }} onPress={makeCard} />
      )}
    </ScrollView>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, borderWidth: 1, borderColor: colors.borderStrong }} />
      <AppText variant="small" faint>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 32 } });
