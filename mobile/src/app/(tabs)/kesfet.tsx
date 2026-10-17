import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Chip, MiniAppCard, Card, IconBadge, SectionHeader } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { CATEGORIES, allApps, type CategoryId } from '@/core/registry';
import { useUser } from '@/core/store/user';

export default function Kesfet() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryId | 'hepsi' | 'bana'>('hepsi');
  const role = useUser((s) => s.profile?.role ?? 'diger');
  const apps = allApps();
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (cat === 'bana' && !a.audience.includes(role)) return false;
      if (cat !== 'hepsi' && cat !== 'bana' && a.category !== cat) return false;
      if (!needle) return true;
      return [a.name, a.tagline, a.description, ...a.tags].join(' ').toLowerCase().includes(needle);
    });
  }, [apps, q, cat, role]);

  return (
    <Screen>
      <AppText variant="h1">Keşfet</AppText>
      <AppText variant="body" muted>{apps.length} mini uygulama, tek üyelik.</AppText>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput value={q} onChangeText={setQ} placeholder="Ara: maskeleme, çınlama, vaka..." placeholderTextColor={colors.textFaint} style={styles.input} autoCorrect={false} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
        <Chip label="Hepsi" active={cat === 'hepsi'} onPress={() => setCat('hepsi')} />
        <Chip label="Bana uygun" icon="person" active={cat === 'bana'} onPress={() => setCat('bana')} />
        {CATEGORIES.map((c) => <Chip key={c.id} label={c.short} icon={c.icon} active={cat === c.id} color={c.gradient[0]} onPress={() => setCat(c.id)} />)}
      </ScrollView>

      {cat === 'hepsi' && !q ? (
        CATEGORIES.map((c) => {
          const items = apps.filter((a) => a.category === c.id);
          if (!items.length) return null;
          return (
            <View key={c.id}>
              <SectionHeader title={c.name} subtitle={c.description} action="Tümü" onAction={() => setCat(c.id)} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {items.map((a) => <MiniAppCard key={a.id} app={a} size="tile" />)}
              </ScrollView>
            </View>
          );
        })
      ) : (
        <View style={{ gap: 10, marginTop: 4 }}>
          {cat !== 'hepsi' && cat !== 'bana' ? (
            <Card gradient={CATEGORIES.find((c) => c.id === cat)!.gradient} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <IconBadge icon={CATEGORIES.find((c) => c.id === cat)!.icon} gradient={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.25)']} />
                <View style={{ flex: 1 }}>
                  <AppText variant="h2" color={colors.white}>{CATEGORIES.find((c) => c.id === cat)!.name}</AppText>
                  <AppText variant="small" color="rgba(255,255,255,0.85)">{CATEGORIES.find((c) => c.id === cat)!.description}</AppText>
                </View>
              </View>
            </Card>
          ) : null}
          {list.map((a) => <MiniAppCard key={a.id} app={a} />)}
          {!list.length ? <AppText muted center style={{ marginTop: space.xl }}>Sonuç yok. Belki sen yaparsın? Yapımcı Ol'a göz at.</AppText> : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, height: 46 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
});
