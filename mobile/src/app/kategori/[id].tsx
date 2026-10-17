import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, MiniAppCard, IconBadge } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { CATEGORIES, appsByCategory, type CategoryId } from '@/core/registry';

/** Kategori ekranı: başlık, tek cümle açıklama, uygulama listesi. Başka hiçbir şey yok. */
export default function Kategori() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return <Screen><AppText>Kategori bulunamadı</AppText></Screen>;
  const apps = appsByCategory(cat.id as CategoryId);
  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={20} color={colors.text} /><AppText variant="small">Keşfet</AppText></Pressable>
      <View style={styles.head}>
        <IconBadge icon={cat.icon} gradient={cat.gradient} size={56} />
        <View style={{ flex: 1 }}>
          <AppText variant="h1">{cat.name}</AppText>
          <AppText variant="small" muted>{apps.length} uygulama</AppText>
        </View>
      </View>
      <AppText variant="body" muted style={{ marginTop: 10 }}>{cat.description}</AppText>
      <View style={{ gap: 10, marginTop: space.xl }}>
        {apps.map((a) => <MiniAppCard key={a.id} app={a} />)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
