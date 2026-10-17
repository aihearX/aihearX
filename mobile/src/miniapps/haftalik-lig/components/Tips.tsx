import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, IconBadge } from '@/core/ui';
import { colors, gradients, radius, space, type Gradient } from '@/core/theme';

type Tip = { id: string; name: string; icon: 'pulse' | 'speedometer' | 'grid' | 'flask' | 'flash'; gradient: Gradient; why: string };

const TIPS: Tip[] = [
  { id: 'odyogramle', name: 'Odyogramle', icon: 'flask', gradient: gradients.gold, why: 'Günlük vaka en çok XP veren oyun; her gün +50 puan.' },
  { id: 'odyo-kelime', name: 'OdyoKelime', icon: 'grid', gradient: gradients.mint, why: 'Günlük kelime 3 dakikada +50 puan ve seri bonusu.' },
  { id: 'frekans-avi', name: 'Frekans Avı', icon: 'pulse', gradient: gradients.rose, why: 'Kombo çarpanı yüksek skor demek; rekorunu kır.' },
  { id: 'kulak-refleksi', name: 'Kulak Refleksi', icon: 'flash', gradient: gradients.ocean, why: 'Hızlı tur, 20 deneme; ortalama süreni düşür.' },
  { id: 'desibel-dedektifi', name: 'Desibel Dedektifi', icon: 'speedometer', gradient: gradients.ember, why: 'Tam isabet serisi kombo yakar.' },
];

/** "Ligde yüksel" önerileri: oyunlara derin bağlantı. */
export function Tips({ playedToday }: { playedToday: string[] }) {
  return (
    <View style={{ gap: space.sm }}>
      {TIPS.map((t) => {
        const done = playedToday.includes(t.id);
        return (
          <Pressable key={t.id} onPress={() => router.push({ pathname: '/uygulama/[id]', params: { id: t.id } })} style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}>
            <IconBadge icon={t.icon} gradient={t.gradient} size={40} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{t.name}{done ? ' ✓' : ''}</AppText>
              <AppText variant="tiny" faint>{t.why}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
