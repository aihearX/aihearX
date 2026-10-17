import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Chip } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { CATEGORY_NAME, LATERALITY_NAME, searchDx, type Laterality } from '../diagnoses';

type Props = { usedKeys: string[]; onGuess: (dx: string, lat: Laterality) => void; disabled?: boolean };

const LATS: Laterality[] = ['right', 'left', 'bilateral'];

/** Aranabilir tanı listesi + taraf seçimi. */
export function DiagnosisPicker({ usedKeys, onGuess, disabled }: Props) {
  const [q, setQ] = useState('');
  const [dx, setDx] = useState<string | null>(null);
  const [lat, setLat] = useState<Laterality>('bilateral');
  const results = useMemo(() => searchDx(q), [q]);

  const submit = () => {
    if (!dx || disabled) return;
    onGuess(dx, lat);
    setDx(null); setQ('');
  };

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Tanı ara (ör. otoskleroz, nörinom, EOM)"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          editable={!disabled}
          autoCorrect={false}
        />
        {q ? <Pressable onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={colors.textFaint} /></Pressable> : null}
      </View>
      <View style={styles.list}>
        {results.map((d) => {
          const used = usedKeys.includes(d.key);
          const active = dx === d.key;
          return (
            <Pressable key={d.key} disabled={used || disabled} onPress={() => setDx(d.key)} style={[styles.item, active && styles.itemActive, used && { opacity: 0.35 }]}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong" color={active ? colors.white : colors.text}>{d.name}</AppText>
                <AppText variant="tiny" color={active ? 'rgba(255,255,255,0.8)' : colors.textFaint}>{CATEGORY_NAME[d.category]}</AppText>
              </View>
              {used ? <Ionicons name="checkmark-done" size={16} color={colors.textFaint} /> : active ? <Ionicons name="checkmark-circle" size={18} color={colors.white} /> : null}
            </Pressable>
          );
        })}
        {results.length === 0 ? <AppText variant="small" faint center style={{ padding: space.md }}>Eşleşen tanı yok</AppText> : null}
      </View>
      <View style={styles.lats}>
        {LATS.map((l) => (
          <Chip key={l} label={LATERALITY_NAME[l]} active={lat === l} onPress={() => setLat(l)} color={l === 'right' ? colors.earRight : l === 'left' ? colors.earLeft : colors.accent} />
        ))}
      </View>
      <Button title={dx ? 'Tahmin Et' : 'Önce tanı seç'} icon="flask" size="lg" disabled={!dx || disabled} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: space.md, height: 48 },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  list: { gap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  itemActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  lats: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
});
