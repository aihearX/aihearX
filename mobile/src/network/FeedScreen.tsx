import React from 'react';
import { Screen, AppText } from '@/core/ui';
/** Geçici yer tutucu; ağ modülü FeedScreen'i tamamen değiştirir. */
export function FeedScreen() {
  return (
    <Screen>
      <AppText variant="h1">Ağ</AppText>
      <AppText muted>Odyoloji ağı yükleniyor…</AppText>
    </Screen>
  );
}
