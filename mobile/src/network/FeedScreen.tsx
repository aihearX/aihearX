import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { router, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, AppText, Card, Chip, IconBadge, Button, useToast } from '@/core/ui';
import { colors, gradients, radius, space, type Gradient } from '@/core/theme';
import { useSettings } from '@/core/store/settings';
import { useUser } from '@/core/store/user';
import type { Post, PostKind } from './types';
import { useNetwork } from './store';
import { useAllPosts, useEnsureNetData, useNetData } from './hooks';
import { PostCard } from './components/PostCard';
import { Segmented } from './components/Segmented';
import { EndCard } from './components/EndCard';
import { UserRow } from './components/UserRow';
import { KIND_META } from './components/KindBadge';

type KindFilter = 'hepsi' | Extract<PostKind, 'vaka' | 'soru' | 'ilan' | 'etkinlik'>;
const FILTERS: { id: KindFilter; label: string }[] = [
  { id: 'hepsi', label: 'Hepsi' },
  { id: 'vaka', label: 'Vakalar' },
  { id: 'soru', label: 'Sorular' },
  { id: 'ilan', label: 'İlanlar' },
  { id: 'etkinlik', label: 'Etkinlikler' },
];

const QUICK: { title: string; sub: string; icon: keyof typeof Ionicons.glyphMap; gradient: Gradient; href: string }[] = [
  { title: 'Dizin', sub: 'Odyolog haritası', icon: 'map', gradient: gradients.ocean, href: '/ag/dizin' },
  { title: 'İlanlar', sub: 'İş & staj', icon: 'briefcase', gradient: gradients.mint, href: '/ag/ilanlar' },
  { title: 'Etkinlikler', sub: 'Kongre & kurs', icon: 'calendar', gradient: gradients.sunset, href: '/ag/etkinlikler' },
];

/** Ağ sekmesi: Arkadaşlar | Herkes, tür filtresi, sonlu akış. */
export function FeedScreen() {
  useEnsureNetData();
  const scope = useSettings((s) => s.feedScope);
  const feedLimit = useSettings((s) => s.feedLimit);
  const setSettings = useSettings((s) => s.set);
  const me = useUser((s) => s.profile?.id);
  const following = useNetwork((s) => s.following);
  const users = useNetData((s) => s.users);
  const load = useNetData((s) => s.load);
  const toast = useToast((s) => s.show);
  const posts = useAllPosts();
  const [kind, setKind] = useState<KindFilter>('hepsi');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (scope === 'friends' && !(following.includes(p.authorId) || p.authorId === me)) return false;
      if (kind !== 'hepsi' && p.kind !== kind) return false;
      return true;
    });
  }, [posts, scope, following, me, kind]);
  const visible = useMemo(() => filtered.slice(0, feedLimit), [filtered, feedLimit]);
  const suggestions = useMemo(() => users.filter((u) => u.verified && !following.includes(u.id)).slice(0, 4), [users, following]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
    toast('Güncel', 'checkmark-circle');
  }, [load, toast]);

  const header = (
    <View>
      <View style={styles.titleRow}>
        <View>
          <AppText variant="h1">Ağ</AppText>
          <AppText variant="small" muted>Odyolojinin buluşma noktası</AppText>
        </View>
        <Segmented value={scope} options={[{ value: 'friends', label: 'Arkadaşlar' }, { value: 'all', label: 'Herkes' }]} onChange={(v) => setSettings({ feedScope: v })} />
      </View>

      <View style={styles.quickRow}>
        {QUICK.map((q, i) => (
          <Animated.View key={q.title} entering={FadeInDown.delay(i * 60).duration(300)} style={{ flex: 1 }}>
            <Card onPress={() => router.push(q.href as Href)} padded={false} style={styles.quick} glow={q.gradient[0]}>
              <IconBadge icon={q.icon} gradient={q.gradient} size={36} />
              <AppText variant="bodyStrong" style={{ marginTop: 8 }} numberOfLines={1}>{q.title}</AppText>
              <AppText variant="tiny" faint numberOfLines={1}>{q.sub}</AppText>
            </Card>
          </Animated.View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        {FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} active={kind === f.id} onPress={() => setKind(f.id)} icon={f.id === 'hepsi' ? 'layers' : KIND_META[f.id].icon} color={f.id === 'hepsi' ? colors.accent : KIND_META[f.id].color} />
        ))}
      </ScrollView>
    </View>
  );

  const empty = (
    <View style={{ gap: 10 }}>
      {scope === 'friends' && following.length === 0 ? (
        <>
          <Card style={{ alignItems: 'center', gap: 6 }}>
            <AppText style={{ fontSize: 32 }}>👋</AppText>
            <AppText variant="h3" center>Arkadaş akışın henüz boş</AppText>
            <AppText variant="small" muted center>Takip ettiğin kişilerin gönderileri burada toplanır. Başlamak için birkaç meslektaş öneriyoruz.</AppText>
            <Button title="Şimdilik herkesi göster" variant="secondary" size="sm" onPress={() => setSettings({ feedScope: 'all' })} style={{ marginTop: 6 }} />
          </Card>
          {suggestions.map((u) => <UserRow key={u.id} user={u} />)}
          <Button title="Dizinde daha fazlasını bul" icon="map" variant="ghost" onPress={() => router.push('/ag/dizin' as Href)} />
        </>
      ) : (
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <AppText style={{ fontSize: 32 }}>🌱</AppText>
          <AppText variant="h3" center>Bu filtrede gönderi yok</AppText>
          <AppText variant="small" muted center>{scope === 'friends' ? 'Takip ettiklerin bu türde henüz paylaşım yapmamış.' : 'İlk paylaşımı sen yapabilirsin.'}</AppText>
          <Button title="Paylaşım yap" icon="create" size="sm" onPress={() => router.push('/gonderi/yeni')} style={{ marginTop: 6 }} />
        </Card>
      )}
    </View>
  );

  const renderItem = useCallback(({ item, index }: { item: Post; index: number }) => <PostCard post={item} index={index} />, []);

  return (
    <Screen scroll={false} padded={false} bottomInset={false} contentStyle={{ paddingBottom: 0 }}>
      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={visible.length > 0 ? <EndCard hidden={filtered.length - visible.length} /> : undefined}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent2} colors={[colors.accent2]} />}
        initialNumToRender={6}
        windowSize={7}
      />
      <Pressable onPress={() => router.push('/gonderi/yeni')} style={({ pressed }) => [styles.fab, { transform: [{ scale: pressed ? 0.94 : 1 }] }]} accessibilityLabel="Yeni gönderi">
        <LinearGradient colors={[...gradients.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
          <Ionicons name="add" size={30} color={colors.white} />
        </LinearGradient>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: space.lg },
  quick: { padding: 12, minHeight: 96 },
  fab: { position: 'absolute', right: space.lg, bottom: 100, shadowColor: colors.accent, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  fabInner: { width: 58, height: 58, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
