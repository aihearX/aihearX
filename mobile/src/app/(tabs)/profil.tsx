import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Screen, AppText, Card, Avatar, Stat, SectionHeader, Button, Chip, useToast, ShareCard } from '@/core/ui';
import { colors, gradients, space, radius } from '@/core/theme';
import { useUser } from '@/core/store/user';
import { useProgress } from '@/core/store/progress';
import { roleName } from '@/core/registry/roles';
import { allApps } from '@/core/registry';

export default function Profil() {
  const profile = useUser((s) => s.profile)!;
  const { xp, level, streak, badges, plays, bests } = useProgress();
  const toast = useToast((s) => s.show);
  const apps = allApps();
  const played = apps.filter((a) => (plays[a.id] ?? 0) > 0);
  const link = `aihear.app/${profile.code.toLowerCase()}`;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="h1">Ben</AppText>
        <Pressable onPress={() => router.push('/ayarlar')} style={styles.gear}><Ionicons name="settings-outline" size={20} color={colors.text} /></Pressable>
      </View>
      <Card style={{ marginTop: space.lg }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Avatar name={profile.name} seed={profile.id} size={64} ring />
          <View style={{ flex: 1 }}>
            <AppText variant="h2">{profile.name}</AppText>
            <AppText variant="small" muted>{roleName(profile.role)}{profile.university ? ` · ${profile.university}` : ''}{profile.city ? ` · ${profile.city}` : ''}</AppText>
            <AppText variant="small" color={colors.accent2}>@{profile.handle}</AppText>
          </View>
        </View>
        <Pressable onPress={async () => { await Clipboard.setStringAsync(link); toast('Davet linkin kopyalandı', 'link'); }} style={styles.code}>
          <Ionicons name="qr-code" size={16} color={colors.accent2} />
          <AppText variant="mono" color={colors.text}>{link}</AppText>
          <AppText variant="tiny" faint style={{ marginLeft: 'auto' }}>Kopyala</AppText>
        </Pressable>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Stat label="Seviye" value={level} icon="ribbon" />
        <Stat label="XP" value={xp} icon="flash" color={colors.accent} />
        <Stat label="Seri" value={`${streak}`} icon="flame" color={colors.amber} />
      </View>

      <SectionHeader title="Rozetler" subtitle={badges.length ? `${badges.length} rozet` : 'Henüz rozet yok, ilk mini uygulamayla gelir'} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {badges.map((b) => <Chip key={b.id} label={`${b.icon} ${b.name}`} />)}
      </View>

      <SectionHeader title="Oynadıkların" subtitle={`${played.length} uygulama`} />
      <View style={{ gap: 8 }}>
        {played.map((a) => (
          <Card key={a.id} onPress={() => router.push({ pathname: '/uygulama/[id]', params: { id: a.id } })} padded={false} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={a.icon} size={18} color={a.gradient[0]} />
            <AppText variant="bodyStrong" style={{ flex: 1 }}>{a.name}</AppText>
            <AppText variant="small" muted>{plays[a.id]} kez{typeof bests[a.id] === 'number' && bests[a.id]! > 0 ? ` · en iyi ${Math.round(bests[a.id]!)}` : ''}</AppText>
          </Card>
        ))}
      </View>

      <SectionHeader title="Profil kartın" subtitle="Instagram'da paylaş, meslektaşlarını davet et" />
      <ShareCard title={profile.name} subtitle={`${roleName(profile.role)} · Seviye ${level} · 🔥 ${streak} gün`} gradient={gradients.violet} shareText={`aihearX'teyim: ${profile.name}, seviye ${level}. Sen de gel: ${link}`}>
        <AppText variant="body" color="rgba(255,255,255,0.9)">{badges.map((b) => b.icon).join(' ') || 'Yeni başladım'} · {played.length} uygulama</AppText>
      </ShareCard>

      <Button title="Yapımcı Ol: fikrini gönder" icon="bulb" variant="secondary" onPress={() => router.push('/yapimci-ol')} style={{ marginTop: space.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gear: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  code: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.md, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border },
});
