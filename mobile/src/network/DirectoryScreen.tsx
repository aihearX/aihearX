import React, { useMemo, useState, useCallback } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, AppText, Chip, Card } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { ROLES, roleName } from '@/core/registry/roles';
import type { Role } from '@/core/registry/types';
import type { NetUser } from './types';
import { useEnsureNetData, useNetData } from './hooks';
import { useNetwork } from './store';
import { BackBar } from './components/BackBar';
import { SearchBox } from './components/SearchBox';
import { UserRow } from './components/UserRow';

const norm = (s: string) => s.toLocaleLowerCase('tr-TR');

/** Odyolog Dizini: isim/şehir/üniversite araması, rol ve şehir filtreleri. */
export function DirectoryScreen() {
  useEnsureNetData();
  const users = useNetData((s) => s.users);
  const following = useNetwork((s) => s.following);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | 'hepsi'>('hepsi');
  const [city, setCity] = useState<string | 'hepsi'>('hepsi');

  const cityCounts = useMemo(() => {
    const m = new Map<string, number>();
    users.forEach((u) => { if (u.city) m.set(u.city, (m.get(u.city) ?? 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'));
  }, [users]);
  const roles = useMemo(() => ROLES.filter((r) => users.some((u) => u.role === r.id)), [users]);

  const list = useMemo(() => {
    const needle = norm(q.trim());
    return users
      .filter((u) => (role === 'hepsi' || u.role === role) && (city === 'hepsi' || u.city === city))
      .filter((u) => !needle || norm([u.name, u.handle, u.city ?? '', u.university ?? '', u.title ?? '', roleName(u.role)].join(' ')).includes(needle))
      .sort((a, b) => Number(b.verified ?? false) - Number(a.verified ?? false) || b.followers - a.followers);
  }, [users, q, role, city]);

  const header = (
    <View style={{ gap: 12 }}>
      <BackBar title="Odyolog Dizini" subtitle="Türkiye'nin odyoloji haritası" />
      <SearchBox value={q} onChange={setQ} placeholder="İsim, şehir ya da üniversite ara" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="Tüm roller" active={role === 'hepsi'} onPress={() => setRole('hepsi')} />
        {roles.map((r) => <Chip key={r.id} label={`${r.emoji} ${r.name}`} active={role === r.id} onPress={() => setRole(role === r.id ? 'hepsi' : r.id)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="Tüm şehirler" icon="location" active={city === 'hepsi'} color={colors.accent2} onPress={() => setCity('hepsi')} />
        {cityCounts.map(([c, n]) => <Chip key={c} label={`${c} · ${n}`} active={city === c} color={colors.accent2} onPress={() => setCity(city === c ? 'hepsi' : c)} />)}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="small" muted>{list.length} kişi{city !== 'hepsi' ? ` · ${city}` : ''}</AppText>
        <AppText variant="small" color={colors.accent2}>{following.length} takip</AppText>
      </View>
    </View>
  );

  const renderItem = useCallback(({ item, index }: { item: NetUser; index: number }) => (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 10) * 35).duration(280)} style={{ marginBottom: 8 }}>
      <UserRow user={item} />
    </Animated.View>
  ), []);

  return (
    <Screen scroll={false} padded={false} bottomInset={false} contentStyle={{ paddingBottom: 0 }}>
      <FlatList
        data={list}
        keyExtractor={(u) => u.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: 12 }}
        ListEmptyComponent={
          <Card style={{ alignItems: 'center', gap: 4 }}>
            <AppText style={{ fontSize: 28 }}>🗺️</AppText>
            <AppText variant="h3">Sonuç yok</AppText>
            <AppText variant="small" muted center>Aramayı sadeleştir ya da filtreleri kaldır.</AppText>
          </Card>
        }
        ListFooterComponent={<AppText variant="tiny" faint center style={{ marginTop: space.lg }}>Dizin, kullanıcıların kendi onayıyla görünür.</AppText>}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
      />
    </Screen>
  );
}
