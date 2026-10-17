import React, { useRef, type ComponentRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { colors, gradients, radius, space, type Gradient } from '@/core/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { useToast } from './Toast';

type Props = {
  title: string;
  subtitle?: string;
  gradient?: Gradient;
  children?: React.ReactNode;
  shareText?: string;
  footer?: string;
  makerName?: string;
};

/**
 * Paylaşım kartı: her mini uygulamanın sonucu bu kartla Instagram/WhatsApp'a gider.
 * Görsel olarak yakalanır (view-shot) ve paylaşılır; metin de panoya kopyalanabilir.
 */
export function ShareCard({ title, subtitle, gradient = gradients.brand, children, shareText, footer = 'aihearX · Kulaktan Kulağa', makerName }: Props) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const toast = useToast((s) => s.show);

  const shareImage = async () => {
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Paylaş' });
      else toast('Paylaşım bu cihazda kullanılamıyor', 'alert-circle');
    } catch {
      toast('Kart oluşturulamadı', 'alert-circle');
    }
  };
  const copy = async () => {
    await Clipboard.setStringAsync(shareText ?? `${title}\n${subtitle ?? ''}\n${footer}`);
    toast('Metin kopyalandı', 'copy');
  };

  return (
    <View>
      <View ref={ref} collapsable={false} style={styles.capture}>
        <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.badge}><AppText variant="tiny" color={colors.white}>aihearX</AppText></View>
          <AppText variant="display" color={colors.white} style={{ marginTop: space.md }}>{title}</AppText>
          {subtitle ? <AppText variant="bodyStrong" color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>{subtitle}</AppText> : null}
          {children ? <View style={{ marginTop: space.lg }}>{children}</View> : null}
          <View style={styles.footerRow}>
            <AppText variant="small" color="rgba(255,255,255,0.8)">{footer}</AppText>
            {makerName ? <AppText variant="small" color="rgba(255,255,255,0.8)">Yapımcı: {makerName}</AppText> : null}
          </View>
        </LinearGradient>
      </View>
      <View style={styles.actions}>
        <Button title="Görseli Paylaş" icon="share-social" onPress={shareImage} style={{ flex: 1 }} />
        <Button title="Metni Kopyala" icon="copy" variant="secondary" onPress={copy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capture: { borderRadius: radius.xl, overflow: 'hidden' },
  card: { padding: space.xl, borderRadius: radius.xl, minHeight: 220 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.25)' },
  footerRow: { marginTop: space.xl, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: space.md },
});
