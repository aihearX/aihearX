import React from 'react';
import { View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppText, Button, Card } from '@/core/ui';
import { gradients, colors } from '@/core/theme';

/** Sonlu akışın sonu: bugünlük bu kadar. */
export function EndCard({ hidden }: { hidden: number }) {
  return (
    <Card gradient={gradients.night} style={{ marginTop: 4, alignItems: 'center', gap: 6 }}>
      <AppText style={{ fontSize: 34 }}>🌙</AppText>
      <AppText variant="h3" center>Bugünlük bu kadar</AppText>
      <AppText variant="small" center muted>Ağ yarın yine burada.{hidden > 0 ? ` ${hidden} gönderi daha seni bekliyor; acelesi yok.` : ''}</AppText>
      <AppText variant="tiny" faint center>Sonsuz akış yok. Sınırı Ayarlar'dan değiştirebilirsin.</AppText>
      <View style={{ marginTop: 8, alignSelf: 'stretch' }}>
        <Button title="Keşfet'e geç" icon="grid" variant="secondary" onPress={() => router.push('/(tabs)/kesfet' as Href)} full />
      </View>
      <AppText variant="tiny" color={colors.textFaint}>aihearX · dopamin dengesi</AppText>
    </Card>
  );
}
