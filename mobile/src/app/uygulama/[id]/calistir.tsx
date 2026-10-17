import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText, Button, Screen, ErrorBoundary } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import { appById } from '@/core/registry';
import { useProgress } from '@/core/store/progress';
import { useUser } from '@/core/store/user';
import { useSettings } from '@/core/store/settings';
import type { MiniAppResult } from '@/core/registry/types';

type Reward = { xp: number; leveledUp: boolean; streak: number; badges: string[] };

/** Mini uygulamayı çalıştıran kabuk: üst çubuk + sonuç ödülü (XP, seri, rozet). */
export default function UygulamaCalistir() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = appById(id);
  const insets = useSafeAreaInsets();
  const complete = useProgress((s) => s.complete);
  const role = useUser((s) => s.profile?.role ?? 'diger');
  const calm = useSettings((s) => s.calmMode);
  const [reward, setReward] = useState<Reward | null>(null);

  const onResult = useCallback((r: Omit<MiniAppResult, 'appId'>) => {
    if (!app) return;
    const res = complete({ ...r, appId: app.id });
    if (!calm) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setReward({ xp: res.xpGained, leveledUp: res.leveledUp, streak: res.streak, badges: res.newBadges.map((b) => `${b.icon} ${b.name}`) });
    setTimeout(() => setReward(null), calm ? 1600 : 2800);
  }, [app, complete, calm]);

  if (!app) return <Screen><AppText>Uygulama bulunamadı</AppText><Button title="Geri" onPress={() => router.back()} /></Screen>;
  const Component = app.component;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} style={styles.btn}><Ionicons name="close" size={20} color={colors.text} /></Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <AppText variant="bodyStrong" numberOfLines={1}>{app.name}</AppText>
          <AppText variant="tiny" faint>{app.maker.name}</AppText>
        </View>
        <View style={[styles.btn, { opacity: 0 }]} />
      </View>
      <View style={{ flex: 1 }}>
        <ErrorBoundary title={app.name}>
          <Component onResult={onResult} role={role} />
        </ErrorBoundary>
      </View>
      {reward ? (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp} pointerEvents="none" style={[styles.reward, { top: insets.top + 60 }]}>
          <AppText variant="h3" color={colors.white}>+{reward.xp} XP{reward.leveledUp ? ' · Seviye atladın!' : ''}</AppText>
          <AppText variant="small" color="rgba(255,255,255,0.85)">🔥 {reward.streak} gün seri{reward.badges.length ? ` · ${reward.badges.join(', ')}` : ''}</AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg },
  btn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  reward: { position: 'absolute', alignSelf: 'center', backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', shadowColor: colors.accent, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
});
