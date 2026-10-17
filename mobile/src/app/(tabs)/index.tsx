import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Card, SectionHeader, MiniAppCard, Stat, ProgressBar, Avatar } from '@/core/ui';
import { colors, gradients, space, radius } from '@/core/theme';
import { useUser } from '@/core/store/user';
import { useProgress, xpForLevel } from '@/core/store/progress';
import { allApps, appsForRole, isNew } from '@/core/registry';
import { dayKey, pickDaily } from '@/core/util/day';
import { roleName } from '@/core/registry/roles';

const greet = () => { const h = new Date().getHours(); return h < 6 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar'; };

/** "Bugün" sekmesi: günlük ritüel. Sonlu, kısa, kişisel. Dopamin dengesi: küçük hedef, net bitiş. */
export default function Bugun() {
  const profile = useUser((s) => s.profile)!;
  const { xp, level, streak, daily, dailyGoal } = useProgress();
  const todayDone = daily[dayKey()] ?? [];
  const apps = allApps();
  const forMe = appsForRole(profile.role);
  const daily3 = useMemo(() => {
    const pool = forMe.length >= 3 ? forMe : apps;
    const picks: typeof pool = [];
    for (let i = 0; picks.length < Math.min(3, pool.length) && i < pool.length * 2; i++) {
      const a = pickDaily(pool, i * 7);
      if (!picks.includes(a)) picks.push(a);
    }
    return picks;
  }, [forMe, apps]);
  const hero = daily3[0];
  const newest = [...apps].filter(isNew).sort((a, b) => b.releasedAt.localeCompare(a.releasedAt)).slice(0, 6);
  const lvlNow = xpForLevel(level), lvlNext = xpForLevel(level + 1);
  const lvlPct = (xp - lvlNow) / Math.max(1, lvlNext - lvlNow);
  const goalPct = Math.min(1, todayDone.length / dailyGoal);

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={() => router.push('/(tabs)/profil')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Avatar name={profile.name} seed={profile.id} size={44} ring={streak > 0} />
          <View style={{ flex: 1 }}>
            <AppText variant="small" muted>{greet()}, {roleName(profile.role).toLowerCase()}</AppText>
            <AppText variant="h2" numberOfLines={1}>{profile.name.split(' ')[0]}</AppText>
          </View>
        </Pressable>
        <View style={styles.streak}>
          <AppText variant="h3" color={streak > 0 ? colors.amber : colors.textFaint}>🔥 {streak}</AppText>
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(400)}>
        <Card style={{ marginTop: space.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="h3">Bugünün hedefi</AppText>
            <AppText variant="small" color={goalPct >= 1 ? colors.mint : colors.textMuted}>{todayDone.length}/{dailyGoal} {goalPct >= 1 ? '· Tamam ✓' : ''}</AppText>
          </View>
          <View style={{ marginTop: 10 }}><ProgressBar value={goalPct} gradient={goalPct >= 1 ? gradients.mint : gradients.brand} /></View>
          <AppText variant="small" faint style={{ marginTop: 8 }}>
            {goalPct >= 1 ? 'Bugünlük bu kadar yeter. Kulaklarını dinlendir.' : 'Küçük hedef, her gün. İki mini uygulama, 5 dakika.'}
          </AppText>
        </Card>
      </Animated.View>

      {hero ? (
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <SectionHeader title="Bugün sana özel" subtitle="Her gün 00:00'da yenilenir" />
          <MiniAppCard app={hero} size="hero" />
          <View style={{ gap: 10, marginTop: 10 }}>{daily3.slice(1).map((a) => <MiniAppCard key={a.id} app={a} />)}</View>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(160).duration(400)}>
        <SectionHeader title="Seviye" subtitle={`Seviye ${level} · ${xp} XP`} />
        <Card>
          <ProgressBar value={lvlPct} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Stat label="XP" value={xp} icon="flash" />
            <Stat label="Seri" value={`${streak} gün`} icon="flame" color={colors.amber} />
            <Stat label="Sonraki" value={`${Math.max(0, lvlNext - xp)}`} icon="trending-up" color={colors.mint} />
          </View>
        </Card>
      </Animated.View>

      {newest.length ? (
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <SectionHeader title="Yeni çıkanlar" action="Tümü" onAction={() => router.push('/(tabs)/kesfet')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {newest.map((a) => <MiniAppCard key={a.id} app={a} size="tile" />)}
          </ScrollView>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(320).duration(400)}>
        <Card onPress={() => router.push('/yapimci-ol')} gradient={gradients.night} style={{ marginTop: space.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.ideaIcon}><Ionicons name="bulb" size={22} color={colors.amber} /></View>
            <View style={{ flex: 1 }}>
              <AppText variant="h3">Aklındaki yazılım fikri çürümesin</AppText>
              <AppText variant="small" muted>Başvur, değerlendirelim, uygunsa ücretsiz kodlayıp adınla yayınlayalım.</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </View>
        </Card>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streak: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  ideaIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,194,92,0.14)', alignItems: 'center', justifyContent: 'center' },
});
