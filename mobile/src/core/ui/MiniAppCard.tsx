import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/core/theme';
import { Card } from './Card';
import { AppText } from './AppText';
import { IconBadge } from './IconBadge';
import { isNew } from '@/core/registry/registry';
import type { MiniAppManifest } from '@/core/registry/types';
import { useProgress } from '@/core/store/progress';

/** Tek tip satır: ikon, ad, ne yapar, süre. Her listede aynı görünür. */
export function MiniAppCard({ app, size = 'row' }: { app: MiniAppManifest; size?: 'row' | 'tile' | 'hero' }) {
  const plays = useProgress((s) => s.plays[app.id] ?? 0);
  const go = () => router.push({ pathname: '/uygulama/[id]', params: { id: app.id } });
  if (size === 'tile') {
    return (
      <Card onPress={go} style={styles.tile}>
        <IconBadge icon={app.icon} gradient={app.gradient} size={40} />
        <AppText variant="h3" style={{ marginTop: 10 }} numberOfLines={1}>{app.name}</AppText>
        <AppText variant="small" muted numberOfLines={2}>{app.tagline}</AppText>
      </Card>
    );
  }
  return (
    <Card onPress={go} style={styles.row} padded={false}>
      <IconBadge icon={app.icon} gradient={app.gradient} size={44} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppText variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{app.name}</AppText>
          {isNew(app) ? <View style={styles.newTag}><AppText variant="tiny" color={colors.accent}>Yeni</AppText></View> : null}
        </View>
        <AppText variant="small" muted numberOfLines={2}>{app.tagline}</AppText>
        <AppText variant="tiny" faint style={{ marginTop: 4 }}>{app.minutes} dk{plays > 0 ? ` · ${plays} kez oynadın` : ''}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { width: 160, minHeight: 140 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  newTag: { backgroundColor: colors.accentSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
});
