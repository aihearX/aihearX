import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, Button, Chip } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { CATEGORY_NAME, LATERALITY_NAME, groupDx, searchDx, type DxCategory, type Laterality } from '../diagnoses';

type Props = { visible: boolean; onClose: () => void; usedKeys: string[]; onGuess: (dx: string, lat: Laterality) => void; remaining: number };

const LATS: Laterality[] = ['right', 'left', 'bilateral'];

export const CATEGORY_COLOR: Record<DxCategory, string> = {
  conductive: colors.blue,
  sensorineural: colors.coral,
  mixed: colors.accent,
  retrocochlear: colors.amber,
  functional: colors.textMuted,
  normal: colors.mint,
};

/** Aranabilir, kategori başlıklı tanı paneli (alt sayfa görünümlü basit Modal) + taraf çipleri. */
export function DiagnosisPicker({ visible, onClose, usedKeys, onGuess, remaining }: Props) {
  const [q, setQ] = useState('');
  const [dx, setDx] = useState<string | null>(null);
  const [lat, setLat] = useState<Laterality>('bilateral');
  const groups = useMemo(() => groupDx(searchDx(q)), [q]);

  const reset = () => { setDx(null); setQ(''); };
  const close = () => { reset(); onClose(); };
  const submit = () => {
    if (!dx) return;
    onGuess(dx, lat);
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <AppText variant="h3">Tahminini seç</AppText>
              <AppText variant="small" muted>{remaining} hakkın kaldı · tanı + taraf</AppText>
            </View>
            <Pressable onPress={close} style={styles.close}><Ionicons name="close" size={18} color={colors.text} /></Pressable>
          </View>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={colors.textFaint} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Tanı ya da kategori ara (otoskleroz, nörinom, iletim…)"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {q ? <Pressable onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={colors.textFaint} /></Pressable> : null}
          </View>
          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {groups.map((g) => (
              <View key={g.category} style={{ gap: 6 }}>
                <View style={styles.section}>
                  <View style={[styles.catDot, { backgroundColor: CATEGORY_COLOR[g.category] }]} />
                  <AppText variant="tiny" faint>{CATEGORY_NAME[g.category]}</AppText>
                  <View style={styles.sectionLine} />
                </View>
                {g.items.map((d) => {
                  const used = usedKeys.includes(d.key);
                  const active = dx === d.key;
                  return (
                    <Pressable key={d.key} disabled={used} onPress={() => setDx(active ? null : d.key)} style={[styles.item, active && styles.itemActive, used && { opacity: 0.4 }]}>
                      <AppText variant="bodyStrong" color={active ? colors.accent : colors.text} style={{ flex: 1 }}>{d.name}</AppText>
                      {used ? <Ionicons name="checkmark-done" size={16} color={colors.textFaint} /> : active ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
            {groups.length === 0 ? <AppText variant="small" faint center style={{ padding: space.lg }}>Eşleşen tanı yok</AppText> : null}
          </ScrollView>
          <Animated.View entering={FadeIn} style={styles.footer}>
            <View style={styles.lats}>
              {LATS.map((l) => (
                <Chip key={l} label={LATERALITY_NAME[l]} active={lat === l} onPress={() => setLat(l)} icon={l === 'right' ? 'arrow-forward-circle' : l === 'left' ? 'arrow-back-circle' : 'swap-horizontal'} color={l === 'right' ? colors.earRight : l === 'left' ? colors.earLeft : colors.accent} />
              ))}
            </View>
            <Button title={dx ? `Tahmin Et · ${LATERALITY_NAME[lat]}` : 'Önce bir tanı seç'} icon="flask" size="lg" disabled={!dx} onPress={submit} />
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.text + '66' },
  sheet: { maxHeight: '90%', backgroundColor: colors.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg, paddingBottom: space.xl, paddingTop: space.sm },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, marginBottom: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: space.md, height: 48, marginBottom: space.sm },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  list: { gap: space.md, paddingBottom: space.sm },
  section: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border, marginLeft: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: 11, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  itemActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  footer: { gap: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.border },
  lats: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
});
