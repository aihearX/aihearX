import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card, Chip } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { useTinnitusStore, fmtFreq, EAR_LABEL } from '../store';

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function History() {
  const profiles = useTinnitusStore((s) => s.profiles);
  const remove = useTinnitusStore((s) => s.remove);
  if (!profiles.length) return null;
  return (
    <Card>
      <AppText variant="h3">Geçmiş eşleştirmeler</AppText>
      <AppText variant="small" muted>Çınlama zamanla değişebilir; kayıtların klinisyenine yol gösterir.</AppText>
      <View style={{ gap: 8, marginTop: space.md }}>
        {profiles.map((p) => (
          <View key={p.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{fmtFreq(p.freq)} · {p.type}</AppText>
              <AppText variant="small" muted>{fmtDate(p.at)} · {EAR_LABEL[p.ears]}</AppText>
            </View>
            <Chip label={`${p.level} dB`} small />
            <Pressable onPress={() => remove(p.id)} hitSlop={8} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
            </Pressable>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
