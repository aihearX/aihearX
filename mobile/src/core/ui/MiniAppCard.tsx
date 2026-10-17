import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius } from '@/core/theme';
import { Card } from './Card';
import { AppText } from './AppText';
import { IconBadge } from './IconBadge';
import { isNew } from '@/core/registry/registry';
import type { MiniAppManifest } from '@/core/registry/types';
import { useProgress } from '@/core/store/progress';

export function MiniAppCard({ app, size = 'row' }: { app: MiniAppManifest; size?: 'row' | 'tile' | 'hero' }) {
  const plays = useProgress((s) => s.plays[app.id] ?? 0);
  const best = useProgress((s) => s.bests[app.id]);
  const go = () => router.push({ pathname: '/uygulama/[id]', params: { id: app.id } });
  if (size === 'tile') {
    return (
      <Card onPress={go} style={styles.tile} glow={app.gradient[0]}>
        <IconBadge icon={app.icon} gradient={app.gradient} size={44} />
        <AppText variant="h3" style={{ marginTop: 10 }} numberOfLines={1}>{app.name}</AppText>
        <AppText variant="small" muted numberOfLines={2}>{app.tagline}</AppText>
        {isNew(app) ? <View style={styles.newTag}><AppText variant="tiny" color={colors.white}>Yeni</AppText></View> : null}
      </Card>
    );
  }
  if (size === 'hero') {
    return (
      <Card onPress={go} gradient={app.gradient} style={styles.hero} glow={app.gradient[1]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.heroIcon}><Ionicons name={app.icon} size={24} color={colors.white} /></View>
          <AppText variant="tiny" color="rgba(255,255,255,0.85)">{app.minutes} dk</AppText>
        </View>
        <AppText variant="h1" color={colors.white} style={{ marginTop: space.lg }}>{app.name}</AppText>
        <AppText variant="body" color="rgba(255,255,255,0.9)">{app.tagline}</AppText>
        {app.dailyHook ? <AppText variant="small" color="rgba(255,255,255,0.75)" style={{ marginTop: 8 }}>• {app.dailyHook}</AppText> : null}
      </Card>
    );
  }
  return (
    <Card onPress={go} style={styles.row} padded={false}>
      <IconBadge icon={app.icon} gradient={app.gradient} size={48} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppText variant="h3" numberOfLines={1} style={{ flexShrink: 1 }}>{app.name}</AppText>
          {isNew(app) ? <View style={styles.newTagInline}><AppText variant="tiny" color={colors.white}>Yeni</AppText></View> : null}
        </View>
        <AppText variant="small" muted numberOfLines={2}>{app.tagline}</AppText>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <AppText variant="tiny" faint>{app.minutes} dk</AppText>
          {plays > 0 ? <AppText variant="tiny" faint>{plays} kez</AppText> : null}
          {typeof best === 'number' && best > 0 ? <AppText variant="tiny" color={colors.accent2}>En iyi {Math.round(best)}</AppText> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { width: 164, minHeight: 150 },
  hero: { minHeight: 180 },
  heroIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.22)', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  newTag: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.coral, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.pill },
  newTagInline: { backgroundColor: colors.coral, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
});
