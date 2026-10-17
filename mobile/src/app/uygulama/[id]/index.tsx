import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, AppText, Button, Card, Chip, Avatar, Stat } from '@/core/ui';
import { colors, space, radius } from '@/core/theme';
import { appById, categoryById } from '@/core/registry';
import { useProgress } from '@/core/store/progress';
import { roleName } from '@/core/registry/roles';

/**
 * Mini uygulama giriş ekranı: önce yapımcı ve bilgi, sonra "Başla".
 * Her mini uygulama aynı kapıdan girer; alt uygulamada ayrı üyelik yok.
 */
export default function UygulamaGiris() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = appById(id);
  const plays = useProgress((s) => (app ? s.plays[app.id] ?? 0 : 0));
  const best = useProgress((s) => (app ? s.bests[app.id] : undefined));
  const last = useProgress((s) => (app ? s.results[app.id]?.[0] : undefined));
  if (!app) {
    return <Screen><AppText variant="h2">Uygulama bulunamadı</AppText><Button title="Geri" onPress={() => router.back()} style={{ marginTop: 16 }} /></Screen>;
  }
  const cat = categoryById(app.category);
  return (
    <Screen padded={false} topInset={false}>
      <LinearGradient colors={[app.gradient[0], app.gradient[1], colors.bg]} locations={[0, 0.55, 1]} style={styles.hero}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={22} color={colors.white} /></Pressable>
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: 'center', marginTop: 40 }}>
          <View style={styles.bigIcon}><Ionicons name={app.icon} size={44} color={colors.white} /></View>
          <AppText variant="display" color={colors.white} center style={{ marginTop: 14 }}>{app.name}</AppText>
          <AppText variant="bodyStrong" color="rgba(255,255,255,0.9)" center style={{ marginTop: 4, paddingHorizontal: 24 }}>{app.tagline}</AppText>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label={cat.name} icon={cat.icon} small />
            <Chip label={`${app.minutes} dk`} icon="time" small />
            {app.shareable ? <Chip label="Paylaşılabilir" icon="share-social" small /> : null}
            <Chip label={`v${app.version}`} small />
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={{ paddingHorizontal: space.lg, marginTop: -24 }}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card>
            <AppText variant="tiny" faint>Yapımcı</AppText>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
              <Avatar name={app.maker.name} size={44} />
              <View style={{ flex: 1 }}>
                <AppText variant="h3">{app.maker.name}</AppText>
                <AppText variant="small" muted>{app.maker.title}{app.maker.community ? ' · Topluluk yapımcısı' : ''}</AppText>
              </View>
            </View>
            <AppText variant="body" style={{ marginTop: 12 }}>"{app.maker.note}"</AppText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180)}>
          <Card style={{ marginTop: 12 }}>
            <AppText variant="h3">Ne yapar?</AppText>
            <AppText variant="body" muted style={{ marginTop: 6 }}>{app.description}</AppText>
            {app.dailyHook ? <View style={styles.hook}><Ionicons name="repeat" size={14} color={colors.accent2} /><AppText variant="small" color={colors.accent2}>{app.dailyHook}</AppText></View> : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {app.tags.map((t) => <Chip key={t} label={t} small />)}
            </View>
            <AppText variant="tiny" faint style={{ marginTop: 12 }}>Kimler için: {app.audience.map(roleName).join(', ')}</AppText>
          </Card>
        </Animated.View>

        {plays > 0 ? (
          <Animated.View entering={FadeInDown.delay(260)} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Stat label="Oynama" value={plays} icon="repeat" />
            {typeof best === 'number' && best > 0 ? <Stat label="En iyi" value={Math.round(best)} icon="trophy" color={colors.amber} /> : null}
            {last?.label ? <Stat label="Son" value={last.label} icon="time" color={colors.mint} /> : null}
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(320)} style={{ marginTop: space.xl }}>
          <Button title={plays > 0 ? 'Tekrar Başla' : 'Başla'} size="lg" icon="play" gradient={app.gradient} onPress={() => router.push({ pathname: '/uygulama/[id]/calistir', params: { id: app.id } })} />
          <AppText variant="tiny" faint center style={{ marginTop: 10 }}>Bu uygulama tıbbi tanı yerine geçmez. Sonuçları bir uzmanla değerlendir.</AppText>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 56, paddingBottom: 48, paddingHorizontal: space.lg },
  back: { position: 'absolute', top: 54, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center' },
  bigIcon: { width: 88, height: 88, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  hook: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, padding: 10, borderRadius: radius.sm, backgroundColor: colors.accent2Soft },
});
