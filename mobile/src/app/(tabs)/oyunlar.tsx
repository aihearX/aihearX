import React from 'react';
import { View } from 'react-native';
import { Screen, AppText, MiniAppCard, SectionHeader, Card, Stat } from '@/core/ui';
import { colors } from '@/core/theme';
import { appsByCategory } from '@/core/registry';
import { useProgress } from '@/core/store/progress';

export default function Oyunlar() {
  const games = appsByCategory('oyun');
  const comps = appsByCategory('yarisma');
  const { bests, plays } = useProgress();
  const totalPlays = Object.values(plays).reduce((a, b) => a + b, 0);
  const featured = comps[0] ?? games[0];
  return (
    <Screen>
      <AppText variant="h1">Oyna</AppText>
      <AppText variant="body" muted>Önce eğlen, sonra fark et ki öğrenmişsin.</AppText>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Stat label="Toplam oyun" value={totalPlays} icon="game-controller" />
        <Stat label="En iyi skor" value={Math.max(0, ...Object.values(bests).map((v) => Math.round(v)))} icon="trophy" color={colors.amber} />
      </View>
      {featured ? (<><SectionHeader title="Bugünün yarışması" subtitle="Herkes aynı anda, sonuç paylaşılır" /><MiniAppCard app={featured} size="hero" /></>) : null}
      <SectionHeader title="Yarışmalar & Bulmacalar" />
      <View style={{ gap: 10 }}>{comps.map((a) => <MiniAppCard key={a.id} app={a} />)}</View>
      <SectionHeader title="Oyunlar" />
      <View style={{ gap: 10 }}>{games.map((a) => <MiniAppCard key={a.id} app={a} />)}</View>
      {!games.length && !comps.length ? <Card style={{ marginTop: 16 }}><AppText muted>Oyunlar yükleniyor…</AppText></Card> : null}
    </Screen>
  );
}
