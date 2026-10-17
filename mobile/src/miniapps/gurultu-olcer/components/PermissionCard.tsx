import React from 'react';
import { Linking } from 'react-native';
import { AppText, Button, Card } from '@/core/ui';
import { gradients, space } from '@/core/theme';

export function PermissionCard({ onRetry }: { onRetry: () => void }) {
  return (
    <Card gradient={gradients.night}>
      <AppText style={{ fontSize: 40 }}>🎤</AppText>
      <AppText variant="h2" style={{ marginTop: 8 }}>Mikrofon izni gerekli</AppText>
      <AppText muted style={{ marginTop: 6 }}>
        Gürültüyü ölçmek için mikrofona erişmemiz gerekiyor. Ses kaydedilmez ve hiçbir yere gönderilmez; yalnızca anlık seviye okunur ve geçici dosya hemen silinir.
      </AppText>
      <Button title="Tekrar izin iste" icon="refresh" style={{ marginTop: space.md }} onPress={onRetry} />
      <Button title="Ayarlardan aç" variant="secondary" icon="settings" style={{ marginTop: space.sm }} onPress={() => { Linking.openSettings().catch(() => {}); }} />
    </Card>
  );
}
