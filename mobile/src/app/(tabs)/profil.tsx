import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Screen, AppText, Card, Avatar, Stat, Button, Chip, useToast, ShareCard } from '@/core/ui';
import { colors, gradients, space, radius } from '@/core/theme';
import { useUser } from '@/core/store/user';
import { useProgress } from '@/core/store/progress';
import { roleName } from '@/core/registry/roles';
import { allApps } from '@/core/registry';

/** Ben: kimlik, üç sayı, rozetler, oynadıkların, paylaşım kartı. Ayarlar sağ üstte. */
export default function Profil() {
  const profile = useUser((s) => s.profile)!;
  const { xp, level, streak, badges, plays } = useProgress();
  const toast = useToast((s) => s.show);
  const played = allApps().filter((a) => (plays[a.id] ?? 0) > 0);
  const link = `aihear.app/${profile.code.toLowerCase()}`;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="h1">Ben</AppText>
        <Pressable onPress={() => router.push('/ayarlar')} style={styles.gear}><Ionicons name="settings-outline" size={20} color={colors.text} /></Pressable>
      </View>

      <View style={styles.head}>
        <Avatar name={profile.name} seed={profile.id} size={64} />
        <View style={{ flex: 1 }}>
          <AppText variant="h2">{profile.name}</AppText>
          <AppText variant="small" muted>{roleName(profile.role)}{profile.university ? ` · ${profile.university}` : ''}{profile.city ? ` · ${profile.city}` : ''}</AppText>
          <AppText variant="small" color={colors.accent}>@{profile.handle}</AppText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
        <Stat label="Seviye" value={level} icon="ribbon" color={colors.accent} />
        <Stat label="XP" value={xp} icon="flash" color={colors.accent2} />
        <Stat label="Seri" value={`${streak} gün`} icon="flame" color={colors.amber} />
      </View>

      <Pressable onPress={async () => { await Clipboard.setStringAsync(link); toast('Davet linkin kopyalandı', 'link'); }} style={styles.code}>
        <Ionicons name="link" size={16} color={colors.accent} />
        <AppText variant="mono">{link}</AppText>
        <AppText variant="tiny" faint style={{ marginLeft: 'auto' }}>Kopyala</AppText>
      </Pressable>

      <AppText variant="tiny" faint style={styles.section}>Rozetler</AppText>
      {badges.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{badges.map((b) => <Chip key={b.id} label={`${b.icon} ${b.name}`} />)}</View>
      ) : <AppText variant="small" muted>İlk mini uygulamayı bitirince ilk rozetin gelir.</AppText>}

      <AppText variant="tiny" faint style={styles.section}>Oynadıkların · {played.length}</AppText>
      <View style={{ gap: 8 }}>
        {played.map((a) => (
          <Card key={a.id} onPress={() => router.push({ pathname: '/uygulama/[id]', params: { id: a.id } })} padded={false} style={styles.row}>
            <Ionicons name={a.icon} size={18} color={a.gradient[0]} />
            <AppText variant="bodyStrong" style={{ flex: 1 }}>{a.name}</AppText>
            <AppText variant="small" muted>{plays[a.id]} kez</AppText>
          </Card>
        ))}
        {!played.length ? <AppText variant="small" muted>Henüz bir şey oynamadın. Keşfet'ten başla.</AppText> : null}
      </View>

      <AppText variant="tiny" faint style={styles.section}>Profil kartın</AppText>
      <ShareCard title={profile.name} subtitle={`${roleName(profile.role)} · Seviye ${level} · 🔥 ${streak} gün`} gradient={gradients.violet} shareText={`aihearX'teyim: ${profile.name}, seviye ${level}. Sen de gel: ${link}`}>
        <AppText variant="body" color="rgba(255,255,255,0.9)">{badges.map((b) => b.icon).join(' ') || 'Yeni başladım'} · {played.length} uygulama</AppText>
      </ShareCard>

      <Button title="Yapımcı Ol" icon="bulb" variant="secondary" onPress={() => router.push('/yapimci-ol')} style={{ marginTop: space.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gear: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  head: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: space.lg },
  code: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.md, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border },
  section: { marginTop: space.xl, marginBottom: 10 },
  row: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
});
