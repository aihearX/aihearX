import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Card, MiniAppCard, IconBadge, Avatar } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { CATEGORIES, allApps, appById } from '@/core/registry';
import { useUser } from '@/core/store/user';
import { useProgress } from '@/core/store/progress';
import { dayKey } from '@/core/util/day';

/**
 * Keşfet (ana sayfa): sade ve kategori odaklı.
 * 1) Arama  2) Bugün için tek satır  3) Beş kategori kartı  4) Yapımcı Ol
 */
export default function Kesfet() {
  const [q, setQ] = useState('');
  const profile = useUser((s) => s.profile)!;
  const streak = useProgress((s) => s.streak);
  const todayDone = useProgress((s) => s.daily[dayKey()]?.length ?? 0);
  const apps = allApps();
  const daily = appById('odyogramle');
  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return [];
    return apps.filter((a) => [a.name, a.tagline, a.description, ...a.tags].join(' ').toLowerCase().includes(n));
  }, [q, apps]);

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <AppText variant="h1">aihear<AppText variant="h1" color={colors.accent}>X</AppText></AppText>
          <AppText variant="small" muted>Odyolojinin tamamı, tek uygulamada</AppText>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profil' as Href)}>
          <Avatar name={profile.name} seed={profile.id} size={40} />
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput value={q} onChangeText={setQ} placeholder="Ne arıyorsun? (maskeleme, çınlama, vaka…)" placeholderTextColor={colors.textFaint} style={styles.input} autoCorrect={false} />
        {q ? <Pressable onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={colors.textFaint} /></Pressable> : null}
      </View>

      {q ? (
        <View style={{ gap: 10, marginTop: space.lg }}>
          <AppText variant="tiny" faint>{results.length} sonuç</AppText>
          {results.map((a) => <MiniAppCard key={a.id} app={a} />)}
          {!results.length ? <AppText muted>Bulunamadı. Başka bir kelime dene.</AppText> : null}
        </View>
      ) : (
        <>
          {daily ? (
            <Card onPress={() => router.push({ pathname: '/uygulama/[id]', params: { id: daily.id } })} padded={false} style={styles.today}>
              <IconBadge icon="calendar" gradient={daily.gradient} size={40} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">Günün vakası</AppText>
                <AppText variant="small" muted>{todayDone > 0 ? `Bugün ${todayDone} uygulama tamamladın` : 'Herkes aynı vakayı çözüyor; 6 tahmin hakkın var'}</AppText>
              </View>
              <View style={styles.streak}><AppText variant="small" color={streak > 0 ? colors.amber : colors.textFaint}>🔥 {streak}</AppText></View>
            </Card>
          ) : null}

          <AppText variant="tiny" faint style={{ marginTop: space.xl, marginBottom: 10 }}>Kategoriler</AppText>
          <View style={{ gap: 10 }}>
            {CATEGORIES.map((c) => {
              const count = apps.filter((a) => a.category === c.id).length;
              return (
                <Card key={c.id} onPress={() => router.push({ pathname: '/kategori/[id]', params: { id: c.id } })} padded={false} style={styles.cat}>
                  <IconBadge icon={c.icon} gradient={c.gradient} size={48} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="h3">{c.name}</AppText>
                    <AppText variant="small" muted numberOfLines={2}>{c.what}</AppText>
                    <AppText variant="tiny" faint style={{ marginTop: 4 }}>{count} uygulama</AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </Card>
              );
            })}
          </View>

          <Card onPress={() => router.push('/yapimci-ol')} padded={false} style={styles.idea}>
            <View style={styles.ideaIcon}><Ionicons name="bulb" size={22} color={colors.amber} /></View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">Yapımcı Ol</AppText>
              <AppText variant="small" muted>Fikrini gönder; uygunsa ücretsiz kodlayıp senin adınla yayınlayalım.</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, height: 46 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  today: { marginTop: space.lg, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  streak: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surface },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  idea: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: space.xl, backgroundColor: colors.bg2 },
  ideaIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#FFF4DB', alignItems: 'center', justifyContent: 'center' },
});
