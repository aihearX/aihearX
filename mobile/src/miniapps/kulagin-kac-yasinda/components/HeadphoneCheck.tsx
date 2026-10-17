import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, Chip } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';

type Checked = { left: boolean; right: boolean };
type Props = { checked: Checked; playing: boolean; onPlay: (ear: 'left' | 'right') => void; onConfirm: (ear: 'left' | 'right') => void; onNext: () => void; onSkip: () => void };

/** Kulaklık kontrolü: her kulak için "çal" + "doğru taraftan duydum" onayı. İkisi de onaylanmadan geçilmez. */
export function HeadphoneCheck({ checked, playing, onPlay, onConfirm, onNext, onSkip }: Props) {
  const ears: { id: 'left' | 'right'; label: string; emoji: string; color: string }[] = [
    { id: 'left', label: 'Sol kulak', emoji: '👈', color: colors.earLeft },
    { id: 'right', label: 'Sağ kulak', emoji: '👉', color: colors.earRight },
  ];
  const both = checked.left && checked.right;
  return (
    <Animated.View entering={FadeInDown}>
      <AppText variant="h1">Kulaklık kontrolü</AppText>
      <AppText muted style={{ marginTop: 4 }}>Her kulağa ayrı ses göndereceğiz. Sesi doğru taraftan duyduğunu onayla.</AppText>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: space.xl }}>
        {ears.map((e) => {
          const ok = checked[e.id];
          return (
            <Card key={e.id} style={{ ...styles.earCard, ...(ok ? { borderColor: e.color, backgroundColor: colors.surface } : {}) }}>
              <AppText style={{ fontSize: 40, lineHeight: 48 }}>{e.emoji}</AppText>
              <AppText variant="h3" color={e.color}>{e.label}</AppText>
              <Button title="Çal" icon="volume-high" variant="secondary" size="sm" onPress={() => onPlay(e.id)} disabled={playing} style={{ marginTop: 6 }} />
              {ok ? (
                <View style={styles.okRow}><Ionicons name="checkmark-circle" size={18} color={colors.mint} /><AppText variant="small" color={colors.mint}>Onaylandı</AppText></View>
              ) : (
                <Button title="Bu taraftan duydum" size="sm" variant="ghost" onPress={() => onConfirm(e.id)} />
              )}
            </Card>
          );
        })}
      </View>
      <Button title="Devam" size="lg" icon="arrow-forward" gradient={gradients.sunset} style={{ marginTop: space.xl }} disabled={!both} onPress={onNext} />
      <Button title="Kulaklığım yok, yine de dene" variant="ghost" style={{ marginTop: space.sm }} onPress={onSkip} />
      <AppText variant="tiny" faint center style={{ marginTop: space.sm }}>Hoparlör tizleri iyi vermez; sonuç kulaklıkla daha anlamlı.</AppText>
    </Animated.View>
  );
}

/** Ses düzeyi rehberi + dalgalı ton seçeneği. */
export function VolumeGuide({ warble, onWarble, onStart }: { warble: boolean; onWarble: (v: boolean) => void; onStart: () => void }) {
  return (
    <Animated.View entering={FadeInDown}>
      <Card gradient={gradients.night} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
        <AppText style={{ fontSize: 56, lineHeight: 64 }}>🔉</AppText>
        <AppText variant="h1" color={colors.white} center>Telefon sesini yarıya al</AppText>
        <AppText color="rgba(255,255,255,0.85)" center style={{ marginTop: 8 }}>Yan tuşlarla sesi yaklaşık %50'ye getir. Çok yüksek ses hem sonucu bozar hem kulağı yorar. Test boyunca sesi değiştirme.</AppText>
        <View style={styles.volRow}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <View key={i} style={[styles.volBar, { height: 8 + i * 4, backgroundColor: i < 4 ? colors.white : 'rgba(255,255,255,0.3)' }]} />)}
        </View>
      </Card>
      <Card style={{ marginTop: space.lg }}>
        <AppText variant="h3">Ton tipi</AppText>
        <AppText variant="small" muted style={{ marginTop: 2 }}>Dalgalı ton (odyometredeki gibi) bazı kulaklıklarda daha kolay fark edilir.</AppText>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: space.sm }}>
          <Chip label="Düz ton" icon="remove" active={!warble} onPress={() => onWarble(false)} />
          <Chip label="Dalgalı ton" icon="pulse" active={warble} color={colors.accent2} onPress={() => onWarble(true)} />
        </View>
      </Card>
      <Button title="Yarıya aldım, başla" size="lg" icon="musical-notes" gradient={gradients.sunset} style={{ marginTop: space.xl }} onPress={onStart} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  earCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: space.lg, paddingHorizontal: space.sm },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 38 },
  volRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, marginTop: space.lg, height: 40 },
  volBar: { width: 10, borderRadius: 5 },
});
