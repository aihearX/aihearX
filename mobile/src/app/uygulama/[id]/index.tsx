import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Button, Card, Avatar, IconBadge } from '@/core/ui';
import { colors, space, radius } from '@/core/theme';
import { appById, categoryById, howItWorks } from '@/core/registry';
import { useProgress } from '@/core/store/progress';
import { roleName } from '@/core/registry/roles';

/**
 * Mini uygulama giriş ekranı. Sıra: ne yapar → nasıl çalışır → yapımcı → Başla.
 * Kullanıcı başlamadan önce ne olacağını bilir.
 */
export default function UygulamaGiris() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = appById(id);
  const plays = useProgress((s) => (app ? s.plays[app.id] ?? 0 : 0));
  const best = useProgress((s) => (app ? s.bests[app.id] : undefined));
  if (!app) {
    return <Screen><AppText variant="h2">Uygulama bulunamadı</AppText><Button title="Geri" onPress={() => router.back()} style={{ marginTop: 16 }} /></Screen>;
  }
  const cat = categoryById(app.category);
  const steps = howItWorks(app.id);
  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={20} color={colors.text} /><AppText variant="small">{cat.name}</AppText></Pressable>

      <View style={styles.head}>
        <IconBadge icon={app.icon} gradient={app.gradient} size={64} />
        <View style={{ flex: 1 }}>
          <AppText variant="h1">{app.name}</AppText>
          <AppText variant="body" muted>{app.tagline}</AppText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Meta icon="time" text={`${app.minutes} dk`} />
        <Meta icon="people" text={app.audience.length >= 6 ? 'Herkes' : app.audience.slice(0, 2).map(roleName).join(', ')} />
        {app.shareable ? <Meta icon="share-social" text="Paylaşılır" /> : null}
      </View>

      <Card style={{ marginTop: space.xl }}>
        <AppText variant="tiny" faint>Ne yapar?</AppText>
        <AppText variant="body" style={{ marginTop: 6 }}>{app.description}</AppText>
        {app.dailyHook ? <AppText variant="small" color={colors.accent2} style={{ marginTop: 8 }}>↻ {app.dailyHook}</AppText> : null}
      </Card>

      {steps ? (
        <Card style={{ marginTop: 12 }}>
          <AppText variant="tiny" faint>Nasıl çalışır?</AppText>
          <View style={{ gap: 10, marginTop: 10 }}>
            {steps.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={styles.stepNo}><AppText variant="small" color={colors.accent}>{i + 1}</AppText></View>
                <AppText variant="body" style={{ flex: 1 }}>{s}</AppText>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <View style={styles.maker}>
        <Avatar name={app.maker.name} size={36} />
        <View style={{ flex: 1 }}>
          <AppText variant="small"><AppText variant="small" muted>Yapımcı: </AppText>{app.maker.name}{app.maker.community ? ' · Topluluk' : ''}</AppText>
          <AppText variant="small" muted numberOfLines={3}>"{app.maker.note}"</AppText>
        </View>
      </View>

      {plays > 0 ? <AppText variant="small" faint center style={{ marginTop: space.lg }}>{plays} kez oynadın{typeof best === 'number' && best > 0 ? ` · en iyi ${Math.round(best)}` : ''}</AppText> : null}

      <Button title={plays > 0 ? 'Tekrar Başla' : 'Başla'} size="lg" icon="play" gradient={app.gradient} onPress={() => router.push({ pathname: '/uygulama/[id]/calistir', params: { id: app.id } })} style={{ marginTop: space.lg }} />
      <AppText variant="tiny" faint center style={{ marginTop: 10 }}>Tıbbi tanı yerine geçmez.</AppText>
    </Screen>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={colors.textMuted} />
      <AppText variant="small" muted>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surface },
  stepNo: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  maker: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: space.lg, padding: 12, borderRadius: radius.md, backgroundColor: colors.bg2 },
});
