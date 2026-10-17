import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card, Chip } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { TYPES, fmtDateTime, severityColor } from '../data';
import { useDiary } from '../store';

export function Timeline() {
  const episodes = useDiary((s) => s.episodes);
  const remove = useDiary((s) => s.remove);
  if (!episodes.length) {
    return (
      <Card style={{ alignItems: 'center', paddingVertical: space.xxl }}>
        <AppText style={{ fontSize: 40 }}>📓</AppText>
        <AppText variant="h3" style={{ marginTop: 8 }}>Henüz kayıt yok</AppText>
        <AppText muted center>İlk atağını "Ekle" sekmesinden kaydet; burada zaman çizgisi oluşsun.</AppText>
      </Card>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {episodes.map((e) => {
        const emoji = TYPES.find((t) => t.id === e.type)?.emoji ?? '•';
        const c = severityColor(e.severity, colors);
        return (
          <Card key={e.id} padded={false} style={styles.item}>
            <View style={[styles.sev, { backgroundColor: c }]}><AppText variant="h3" color={colors.white}>{e.severity}</AppText></View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{emoji} {e.type} · {e.duration}</AppText>
              <AppText variant="small" muted>{fmtDateTime(e.at)}</AppText>
              {e.triggers.length || e.accompanying.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {e.triggers.map((t) => <Chip key={`t${t}`} label={t} small color={colors.coral} />)}
                  {e.accompanying.map((a) => <Chip key={`a${a}`} label={a} small color={colors.accent2} />)}
                </View>
              ) : null}
              {e.note ? <AppText variant="small" faint style={{ marginTop: 4 }}>{e.note}</AppText> : null}
            </View>
            <Pressable onPress={() => remove(e.id)} hitSlop={8} style={{ padding: 6 }}>
              <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
            </Pressable>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12 },
  sev: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
