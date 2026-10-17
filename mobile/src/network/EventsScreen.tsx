import React, { useMemo, useState } from 'react';
import { View, ScrollView, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, AppText, Card, Chip, Button, useToast } from '@/core/ui';
import { colors, gradients, radius, space, type Gradient } from '@/core/theme';
import { useSettings } from '@/core/store/settings';
import type { NetEvent, EventKind } from './types';
import { EVENT_KIND_LABEL } from './types';
import { useEnsureNetData, useNetData, countdown, formatDate } from './hooks';
import { useNetwork } from './store';
import { BackBar } from './components/BackBar';

const KINDS: EventKind[] = ['kongre', 'webinar', 'kurs', 'buluşma'];
const KIND_META: Record<EventKind, { icon: keyof typeof Ionicons.glyphMap; gradient: Gradient }> = {
  kongre: { icon: 'mic', gradient: gradients.rose },
  webinar: { icon: 'laptop', gradient: gradients.ocean },
  kurs: { icon: 'school', gradient: gradients.violet },
  buluşma: { icon: 'cafe', gradient: gradients.sunset },
};
const MONTHS = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];

/** Etkinlikler: yaklaşanlar tarihe göre, geri sayım, Katılacağım (kalıcı). */
export function EventsScreen() {
  useEnsureNetData();
  const events = useNetData((s) => s.events);
  const attending = useNetwork((s) => s.attending);
  const [kind, setKind] = useState<EventKind | 'hepsi'>('hepsi');
  const [onlyMine, setOnlyMine] = useState(false);

  const list = useMemo(() => {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    return events
      .filter((e) => new Date(e.date).getTime() >= todayStart.getTime())
      .filter((e) => (kind === 'hepsi' || e.kind === kind) && (!onlyMine || attending.includes(e.id)))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, kind, onlyMine, attending]);

  return (
    <Screen>
      <BackBar title="Etkinlikler" subtitle="Kongre, webinar, kurs ve buluşmalar" />
      <ScrollView horizontal showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="Hepsi" active={kind === 'hepsi' && !onlyMine} onPress={() => { setKind('hepsi'); setOnlyMine(false); }} />
        <Chip label={`Katılacaklarım · ${attending.length}`} icon="checkmark-circle" color={colors.accent2} active={onlyMine} onPress={() => setOnlyMine((v) => !v)} />
        {KINDS.map((k) => <Chip key={k} label={EVENT_KIND_LABEL[k]} icon={KIND_META[k].icon} color={KIND_META[k].gradient[0]} active={kind === k} onPress={() => setKind(kind === k ? 'hepsi' : k)} />)}
      </ScrollView>
      <AppText variant="small" muted style={{ marginTop: 12, marginBottom: 8 }}>{list.length} yaklaşan etkinlik</AppText>
      <View style={{ gap: 10 }}>
        {list.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
        {!list.length ? (
          <Card style={{ alignItems: 'center', gap: 4 }}>
            <AppText style={{ fontSize: 28 }}>📅</AppText>
            <AppText variant="h3">{onlyMine ? 'Henüz katılım işaretlemedin' : 'Yaklaşan etkinlik yok'}</AppText>
            <AppText variant="small" muted center>{onlyMine ? 'Bir etkinlikte "Katılacağım" de, burada toplansın.' : 'Yeni duyurular geldikçe burada görünecek.'}</AppText>
          </Card>
        ) : null}
      </View>
      <AppText variant="tiny" faint center style={{ marginTop: space.xl }}>Etkinlik bilgileri düzenleyen kurumlara aittir; tarihleri kayıt sayfasından doğrula.</AppText>
    </Screen>
  );
}

function EventCard({ event, index }: { event: NetEvent; index: number }) {
  const toast = useToast((s) => s.show);
  const haptics = useSettings((s) => s.haptics);
  const going = useNetwork((s) => s.attending.includes(event.id));
  const toggleAttend = useNetwork((s) => s.toggleAttend);
  const meta = KIND_META[event.kind];
  const d = new Date(event.date);
  const left = countdown(event.date);
  const soon = left === 'bugün' || left === 'yarın';

  const toggle = () => {
    const next = toggleAttend(event.id);
    if (haptics) Haptics.impactAsync(next ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toast(next ? 'Katılım işaretlendi' : 'Katılım kaldırıldı', next ? 'checkmark-circle' : 'close-circle');
  };
  const openUrl = async () => {
    if (!event.url) return;
    await Linking.openURL(event.url).catch(() => toast('Bağlantı açılamadı', 'alert-circle'));
  };

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(300)}>
      <Card glow={going ? meta.gradient[0] : undefined}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.date, { borderColor: meta.gradient[0] }]}>
            <AppText variant="tiny" color={meta.gradient[0]}>{MONTHS[d.getMonth()]}</AppText>
            <AppText variant="h1">{d.getDate()}</AppText>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Chip label={EVENT_KIND_LABEL[event.kind]} icon={meta.icon} small />
              <AppText variant="tiny" color={soon ? colors.amber : colors.accent2}>{left}</AppText>
            </View>
            <AppText variant="h3" style={{ marginTop: 6 }}>{event.title}</AppText>
            <AppText variant="small" muted>{event.org}</AppText>
            <View style={styles.metaRow}>
              <Ionicons name={event.online ? 'wifi' : 'location-outline'} size={12} color={colors.textFaint} />
              <AppText variant="tiny" faint>{event.online ? 'Online' : event.city} · {formatDate(event.date)}</AppText>
            </View>
          </View>
        </View>
        <AppText variant="body" muted style={{ marginTop: 10 }}>{event.description}</AppText>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button title={going ? 'Katılacağım ✓' : 'Katılacağım'} icon={going ? undefined : 'hand-right'} variant={going ? 'secondary' : 'primary'} gradient={meta.gradient} size="sm" onPress={toggle} haptic={false} style={{ flex: 1 }} />
          <Button title="Takvime ekle" icon="calendar-outline" variant="secondary" size="sm" onPress={() => toast('Takvim entegrasyonu yakında', 'calendar')} />
          {event.url ? <Button title="Kayıt" icon="open-outline" variant="ghost" size="sm" onPress={openUrl} /> : null}
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  date: { width: 58, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
});
