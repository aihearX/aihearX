import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppText, useToast } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import type { MiniAppProps } from '@/core/registry/types';
import { useDiary, type Episode } from './store';
import { EpisodeForm } from './components/EpisodeForm';
import { Timeline } from './components/Timeline';
import { Summary } from './components/Summary';

type Tab = 'ekle' | 'zaman' | 'ozet';
const TABS: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'ekle', label: 'Ekle', icon: 'add-circle' },
  { id: 'zaman', label: 'Zaman çizgisi', icon: 'list' },
  { id: 'ozet', label: '30 gün özeti', icon: 'stats-chart' },
];

export default function App({ onResult }: MiniAppProps) {
  const [tab, setTab] = useState<Tab>('ekle');
  const add = useDiary((s) => s.add);
  const count = useDiary((s) => s.episodes.length);
  const toast = useToast((s) => s.show);

  const save = (e: Omit<Episode, 'id'>) => {
    add(e);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onResult({ label: 'Kayıt eklendi', xp: 10, meta: { type: e.type, severity: e.severity } });
    toast('Atak kaydedildi', 'checkmark-circle');
    setTab('zaman');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={[styles.tab, tab === t.id && styles.tabActive]}>
            <Ionicons name={t.icon} size={16} color={tab === t.id ? colors.white : colors.textMuted} />
            <AppText variant="small" color={tab === t.id ? colors.white : colors.textMuted}>{t.label}{t.id === 'zaman' && count ? ` (${count})` : ''}</AppText>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab === 'ekle' ? (
          <View>
            <AppText variant="h1">Atak kaydet</AppText>
            <AppText muted style={{ marginTop: 4, marginBottom: space.lg }}>Ne kadar taze kaydedersen o kadar değerli. 30 saniye sürer.</AppText>
            <EpisodeForm onSave={save} />
          </View>
        ) : null}
        {tab === 'zaman' ? (
          <View>
            <AppText variant="h1" style={{ marginBottom: space.lg }}>Zaman çizgisi</AppText>
            <Timeline />
          </View>
        ) : null}
        {tab === 'ozet' ? (
          <View>
            <AppText variant="h1" style={{ marginBottom: space.lg }}>Son 30 gün</AppText>
            <Summary />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 6, padding: 12, paddingBottom: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  content: { padding: 16, paddingBottom: 32 },
});
