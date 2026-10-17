import React from 'react';
import { View, Switch, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Card, Button } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { useSettings } from '@/core/store/settings';
import { useProgress } from '@/core/store/progress';
import { signOut } from '@/core/auth/actions';

export default function Ayarlar() {
  const s = useSettings();
  const resetProgress = useProgress((p) => p.reset);
  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}><Ionicons name="chevron-back" size={20} color={colors.text} /><AppText>Geri</AppText></Pressable>
      <AppText variant="h1">Ayarlar</AppText>
      <AppText variant="small" muted>Dopamin dengesi: uygulama dikkatini çeksin ama seni tüketmesin.</AppText>
      <Card style={{ marginTop: space.lg, gap: 16 }}>
        <Row title="Sakin mod" sub="Seri baskısı ve kutlama animasyonları azalır" value={s.calmMode} onChange={(v) => s.set({ calmMode: v })} />
        <Row title="Dokunsal geri bildirim" sub="Haptik titreşimler" value={s.haptics} onChange={(v) => s.set({ haptics: v })} />
        <Row title="Sessiz saatler (23:00-07:00)" sub="Bu saatlerde bildirim yok" value={s.quietHours != null} onChange={(v) => s.set({ quietHours: v ? { from: 23, to: 7 } : null })} />
      </Card>
      <Card style={{ marginTop: 12 }}>
        <AppText variant="h3">Akış sınırı</AppText>
        <AppText variant="small" muted>Bir oturumda en fazla {s.feedLimit} gönderi gösterilir; sonra "bugünlük bu kadar" kartı gelir. Sonsuz akış yok.</AppText>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[15, 30, 60].map((n) => <Button key={n} title={`${n}`} size="sm" variant={s.feedLimit === n ? 'primary' : 'secondary'} onPress={() => s.set({ feedLimit: n })} />)}
        </View>
      </Card>
      <Button title="İlerlemeyi sıfırla" variant="danger" onPress={resetProgress} style={{ marginTop: space.xl }} />
      <Button title="Çıkış yap" variant="secondary" onPress={signOut} style={{ marginTop: 10 }} />
      <AppText variant="tiny" faint center style={{ marginTop: space.xl }}>aihearX v1.0.0 · aiHear</AppText>
    </Screen>
  );
}

function Row({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}><AppText variant="bodyStrong">{title}</AppText><AppText variant="small" muted>{sub}</AppText></View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent, false: colors.surfaceStrong }} />
    </View>
  );
}
