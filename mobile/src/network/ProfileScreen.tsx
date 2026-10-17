import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, AppText, Card, Avatar, Stat, Button, Chip, SectionHeader, MiniAppCard, useToast, gradientFor } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { roleName, isClinician } from '@/core/registry/roles';
import { allApps } from '@/core/registry';
import { useUser } from '@/core/store/user';
import { seededRandom } from '@/core/util/day';
import { useAllPosts, useEnsureNetData, useResolveUser } from './hooks';
import { useNetwork } from './store';
import { BackBar } from './components/BackBar';
import { FollowButton } from './components/FollowButton';
import { PostCard } from './components/PostCard';

const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

/** Kullanıcı profili: benimki (useUser) ya da ağdaki bir kullanıcı. */
export function ProfileScreen({ userId }: { userId: string }) {
  useEnsureNetData();
  const me = useUser((s) => s.profile);
  const resolve = useResolveUser();
  const toast = useToast((s) => s.show);
  const following = useNetwork((s) => s.following);
  const all = useAllPosts();
  const user = resolve(userId);
  const isMe = me?.id === userId;
  const posts = useMemo(() => all.filter((p) => p.authorId === userId), [all, userId]);
  const tools = useMemo(() => {
    const apps = allApps();
    if (!apps.length) return [];
    const rnd = seededRandom(hash(userId));
    const arr = [...apps];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = arr[i]!; arr[i] = arr[j]!; arr[j] = t; }
    return arr.slice(0, 3);
  }, [userId]);

  if (!user) {
    return (
      <Screen>
        <BackBar title="Profil" />
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <AppText style={{ fontSize: 32 }}>🔍</AppText>
          <AppText variant="h3">Kullanıcı bulunamadı</AppText>
          <AppText variant="small" muted center>Bu profil dizinde görünmüyor olabilir.</AppText>
        </Card>
      </Screen>
    );
  }

  const g = gradientFor(user.id);
  const sub = [user.title, user.university, user.city].filter(Boolean).join(' · ');

  return (
    <Screen>
      <BackBar />
      <Animated.View entering={FadeInDown.duration(320)}>
        <Card gradient={g} glow={g[0]}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <Avatar name={user.name} seed={user.id} size={76} ring={user.verified} />
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <AppText variant="h1" color={colors.white} numberOfLines={2} style={{ flexShrink: 1 }}>{user.name}</AppText>
                {user.verified ? <Ionicons name="checkmark-circle" size={20} color={colors.white} /> : null}
              </View>
              <AppText variant="small" color="rgba(255,255,255,0.85)">@{user.handle}</AppText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            <View style={styles.rolePill}><AppText variant="tiny" color={colors.white}>{roleName(user.role)}</AppText></View>
            {isMe ? <View style={styles.rolePill}><AppText variant="tiny" color={colors.white}>Sen</AppText></View> : null}
          </View>
          {sub ? <AppText variant="small" color="rgba(255,255,255,0.9)" style={{ marginTop: 8 }}>{sub}</AppText> : null}
          {user.bio ? <AppText variant="body" color="rgba(255,255,255,0.95)" style={{ marginTop: 6 }}>{user.bio}</AppText> : null}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(320)} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Stat label="Gönderi" value={posts.length} icon="document-text" />
        <Stat label="Takipçi" value={user.followers} icon="people" color={colors.accent} />
        <Stat label="Takip" value={isMe ? following.length : user.following} icon="person-add" color={colors.amber} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(320)} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        {isMe ? (
          <>
            <Button title="Yeni gönderi" icon="create" onPress={() => router.push('/gonderi/yeni')} style={{ flex: 1 }} />
            <Button title="Ayarlar" icon="settings-outline" variant="secondary" onPress={() => router.push('/ayarlar')} />
          </>
        ) : (
          <>
            <View style={{ flex: 1 }}><FollowButton userId={user.id} size="md" full name={user.name.split(' ')[0]} /></View>
            <Button title="Mesaj" icon="chatbubble-ellipses-outline" variant="secondary" onPress={() => toast('Mesajlaşma yakında', 'time')} />
          </>
        )}
      </Animated.View>

      {isClinician(user.role) ? (
        <Animated.View entering={FadeInDown.delay(180).duration(320)}>
          <SectionHeader title="Odyolog kartı" subtitle="Hastalarıma önerdiğim araçlar" />
          {tools.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {tools.map((a) => <MiniAppCard key={a.id} app={a} size="tile" />)}
            </ScrollView>
          ) : (
            <Card style={{ alignItems: 'center', gap: 4 }}>
              <Ionicons name="apps-outline" size={22} color={colors.textFaint} />
              <AppText variant="small" muted center>Araç önerileri yakında burada görünecek.</AppText>
            </Card>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            <Chip label="Hasta kabul ediyor" icon="checkmark-circle" small />
            {user.city ? <Chip label={user.city} icon="location" small /> : null}
          </View>
        </Animated.View>
      ) : null}

      <SectionHeader title="Gönderiler" subtitle={posts.length ? `${posts.length} paylaşım` : 'Henüz paylaşım yok'} />
      {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} hideAuthorLink />)}
      {!posts.length && isMe ? <Button title="İlk gönderini paylaş" icon="create" variant="secondary" onPress={() => router.push('/gonderi/yeni')} /> : null}
      <AppText variant="tiny" faint center style={{ marginTop: space.xl }}>Profiller kullanıcının kendi onayıyla görünür.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.25)' },
});
