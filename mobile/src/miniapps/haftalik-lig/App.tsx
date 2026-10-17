import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Card, Chip, SectionHeader, ShareCard, Stat } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { dayKey } from '@/core/util/day';
import { useProgress } from '@/core/store/progress';
import { useUser } from '@/core/store/user';
import { roleName } from '@/core/registry/roles';
import { SEBAHATTIN } from '@/core/registry/makers';
import type { MiniAppProps } from '@/core/registry/types';
import { daysToReset, fmtNum, playerBoard, universityTable, weekLabel, weekNumber, weeklyPoints } from './logic';
import { LeagueTable } from './components/LeagueTable';
import { PlayerBoard } from './components/PlayerBoard';
import { Tips } from './components/Tips';

export default function HaftalikLig({ onResult, role }: MiniAppProps) {
  const { xp, level, streak, daily, plays, bests } = useProgress();
  const profile = useUser((s) => s.profile);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    onResult({ xp: 5, label: 'Lig görüntülendi' });
  }, [onResult]);

  const name = profile?.name ?? 'Sen';
  const uni = profile?.university && profile.university !== 'Diğer' ? profile.university : undefined;
  const week = weeklyPoints(daily, streak);
  const unis = useMemo(() => universityTable(uni, week.points), [uni, week.points]);
  const board = useMemo(() => playerBoard(name, uni, week.points), [name, uni, week.points]);
  const mine = unis.find((u) => u.you);
  const totalPlays = Object.values(plays).reduce((a, b) => a + b, 0);
  const topBests = Object.entries(bests).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const playedToday = daily[dayKey()] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.gold}>
          <AppText variant="tiny" color="rgba(255,255,255,0.85)">Hafta {weekNumber()} · {weekLabel()}</AppText>
          <AppText variant="display" color={colors.white}>{fmtNum(week.points)} puan</AppText>
          <AppText variant="body" color="rgba(255,255,255,0.9)">Oyuncu sıran #{board.you.rank}{mine ? ` · ${mine.name} #${mine.rank}` : ''}</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.8)" style={{ marginTop: space.sm }}>Lig {daysToReset()} gün sonra sıfırlanır (her pazartesi).</AppText>
        </Card>
      </Animated.View>

      <View style={styles.notice}>
        <AppText variant="small" color={colors.amber}>ℹ️ Sunucu bağlanana kadar lig yerel ve örnek veridir. Senin puanın gerçek; diğer oyuncular ve üniversite puanları haftalık tohumla üretilmiş örneklerdir.</AppText>
      </View>

      <SectionHeader title="Bu hafta sen" subtitle={`${roleName(role)}${uni ? ` · ${uni}` : ''}`} />
      <View style={styles.row}>
        <Stat label="Tamamlanan" value={week.completions} icon="checkmark-done" />
        <Stat label="Seri" value={`${streak} gün`} icon="flame" color={colors.coral} />
        <Stat label="Seviye" value={level} icon="star" color={colors.amber} />
      </View>
      <Card>
        <AppText variant="bodyStrong">Puan nasıl hesaplanır?</AppText>
        <AppText variant="small" muted style={{ marginTop: 4 }}>Bu hafta tamamlanan her mini uygulama 50 puan ({week.completions} × 50 = {fmtNum(week.completions * 50)}) + seri bonusu {fmtNum(week.streakBonus)} (gün başına 20, en fazla 7 gün). Toplam XP: {fmtNum(xp)} · toplam oyun: {totalPlays}.</AppText>
        {topBests.length ? (
          <View style={[styles.chips, { marginTop: space.md }]}>
            {topBests.map(([id, b]) => <Chip key={id} label={`${id}: ${fmtNum(b)}`} small icon="trophy" />)}
          </View>
        ) : null}
      </Card>

      <SectionHeader title="Üniversite ligi" subtitle={uni ? 'Takımın vurgulu' : 'Profilinde üniversite seçersen takımın tabloya eklenir'} />
      <LeagueTable rows={unis} />

      <SectionHeader title="İlk 20 oyuncu" subtitle="Haftalık puana göre" />
      <PlayerBoard top={board.top} you={board.you} />

      <SectionHeader title="Ligde yüksel" subtitle="Bugün oynamadıkların puan bekliyor" />
      <Tips playedToday={playedToday} />

      <ShareCard
        title={`#${board.you.rank}`}
        subtitle={`Hafta ${weekNumber()} · ${fmtNum(week.points)} puan${mine ? ` · ${mine.name} #${mine.rank}` : ''}`}
        gradient={gradients.gold}
        makerName={SEBAHATTIN.name}
        shareText={`Haftalık Lig 🏆 #${board.you.rank} · ${fmtNum(week.points)} puan · ${streak} gün seri · aihearX`}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: space.md },
  row: { flexDirection: 'row', gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  notice: { backgroundColor: 'rgba(255,194,92,0.12)', borderWidth: 1, borderColor: 'rgba(255,194,92,0.35)', borderRadius: 16, padding: space.md },
});
