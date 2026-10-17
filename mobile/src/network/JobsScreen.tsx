import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, AppText, Card, Chip, Button, IconBadge, useToast } from '@/core/ui';
import { colors, gradients, space, type Gradient } from '@/core/theme';
import type { Job, JobType } from './types';
import { useEnsureNetData, useNetData, timeAgo } from './hooks';
import { BackBar } from './components/BackBar';

const TYPES: JobType[] = ['tam zamanlı', 'yarı zamanlı', 'staj', 'gönüllü'];
const TYPE_META: Record<JobType, { icon: keyof typeof Ionicons.glyphMap; gradient: Gradient }> = {
  'tam zamanlı': { icon: 'briefcase', gradient: gradients.mint },
  'yarı zamanlı': { icon: 'time', gradient: gradients.ocean },
  staj: { icon: 'school', gradient: gradients.violet },
  gönüllü: { icon: 'heart', gradient: gradients.sunset },
};

/** İş ve staj ilanları: şehir/tür filtresi, açılır detay, Başvur. */
export function JobsScreen() {
  useEnsureNetData();
  const jobs = useNetData((s) => s.jobs);
  const [city, setCity] = useState<string | 'hepsi'>('hepsi');
  const [type, setType] = useState<JobType | 'hepsi'>('hepsi');
  const [openId, setOpenId] = useState<string | null>(null);

  const cities = useMemo(() => [...new Set(jobs.map((j) => j.city))].sort((a, b) => a.localeCompare(b, 'tr')), [jobs]);
  const list = useMemo(() => jobs.filter((j) => (city === 'hepsi' || j.city === city) && (type === 'hepsi' || j.type === type)).sort((a, b) => b.postedAt.localeCompare(a.postedAt)), [jobs, city, type]);

  return (
    <Screen>
      <BackBar title="İlanlar" subtitle="İş, staj ve gönüllü fırsatları" right={<Button title="İlan ver" icon="add" size="sm" onPress={() => router.push('/gonderi/yeni')} />} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="Tüm türler" active={type === 'hepsi'} onPress={() => setType('hepsi')} />
        {TYPES.map((t) => <Chip key={t} label={t} icon={TYPE_META[t].icon} color={TYPE_META[t].gradient[0]} active={type === t} onPress={() => setType(type === t ? 'hepsi' : t)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
        <Chip label="Tüm şehirler" icon="location" color={colors.accent2} active={city === 'hepsi'} onPress={() => setCity('hepsi')} />
        {cities.map((c) => <Chip key={c} label={c} color={colors.accent2} active={city === c} onPress={() => setCity(city === c ? 'hepsi' : c)} />)}
      </ScrollView>
      <AppText variant="small" muted style={{ marginTop: 12, marginBottom: 8 }}>{list.length} ilan</AppText>
      <View style={{ gap: 10 }}>
        {list.map((j, i) => <JobCard key={j.id} job={j} index={i} open={openId === j.id} onToggle={() => setOpenId(openId === j.id ? null : j.id)} />)}
        {!list.length ? (
          <Card style={{ alignItems: 'center', gap: 4 }}>
            <AppText style={{ fontSize: 28 }}>📭</AppText>
            <AppText variant="h3">Bu filtrede ilan yok</AppText>
            <AppText variant="small" muted center>Filtreleri kaldır ya da kendi ilanını ver.</AppText>
          </Card>
        ) : null}
      </View>
      <AppText variant="tiny" faint center style={{ marginTop: space.xl }}>İlanlar topluluk tarafından paylaşılır; başvuru öncesi kurumu doğrula.</AppText>
    </Screen>
  );
}

function JobCard({ job, index, open, onToggle }: { job: Job; index: number; open: boolean; onToggle: () => void }) {
  const toast = useToast((s) => s.show);
  const meta = TYPE_META[job.type];
  const apply = async () => {
    if (job.url) {
      const ok = await Linking.canOpenURL(job.url).catch(() => false);
      if (ok) { await Linking.openURL(job.url).catch(() => toast('Bağlantı açılamadı', 'alert-circle')); return; }
    }
    toast(job.email ? `Başvuru e-posta ile: ${job.email}` : 'Başvuru bilgisi için kurumla iletişime geç', 'mail');
  };
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(300)}>
      <Card onPress={onToggle} padded={false} style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconBadge icon={meta.icon} gradient={meta.gradient} size={44} />
          <View style={{ flex: 1 }}>
            <AppText variant="h3" numberOfLines={2}>{job.title}</AppText>
            <AppText variant="small" muted numberOfLines={1}>{job.org}</AppText>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color={colors.textFaint} />
              <AppText variant="tiny" faint>{job.city}</AppText>
              <AppText variant="tiny" faint>· {job.type}</AppText>
              <AppText variant="tiny" faint>· {timeAgo(job.postedAt)}</AppText>
            </View>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textFaint} />
        </View>
        {open ? (
          <Animated.View entering={FadeInDown.duration(220)} style={{ marginTop: 12, gap: 10 }}>
            <AppText variant="body" muted>{job.description}</AppText>
            {job.salaryHint ? (
              <View style={styles.metaRow}><Ionicons name="cash-outline" size={14} color={colors.mint} /><AppText variant="small" color={colors.mint}>{job.salaryHint}</AppText></View>
            ) : null}
            {job.tags.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{job.tags.map((t) => <Chip key={t} label={t} small />)}</View> : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Başvur" icon={job.url ? 'open-outline' : 'mail'} onPress={apply} style={{ flex: 1 }} />
              <Pressable onPress={() => toast('Kaydedildi', 'bookmark')} style={styles.save}><Ionicons name="bookmark-outline" size={20} color={colors.text} /></Pressable>
            </View>
          </Animated.View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  save: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
});
