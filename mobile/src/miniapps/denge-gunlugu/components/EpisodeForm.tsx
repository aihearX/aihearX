import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { AppText, Button, Card, Chip, SectionHeader } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { TYPES, DURATIONS, TRIGGERS, ACCOMPANYING, fmtDateTime, severityColor, type EpisodeType, type DurationPreset } from '../data';
import type { Episode } from '../store';

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function EpisodeForm({ onSave }: { onSave: (e: Omit<Episode, 'id'>) => void }) {
  const [at, setAt] = useState(() => new Date());
  const [type, setType] = useState<EpisodeType>('dönme');
  const [duration, setDuration] = useState<DurationPreset>('dakikalar');
  const [severity, setSeverity] = useState(5);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [acc, setAcc] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const shift = (minutes: number) => setAt((d) => new Date(Math.min(Date.now(), d.getTime() + minutes * 60000)));
  const save = () => {
    onSave({ at: at.toISOString(), type, duration, severity, triggers, accompanying: acc, note: note.trim() });
    setAt(new Date()); setTriggers([]); setAcc([]); setNote(''); setSeverity(5);
  };

  return (
    <View>
      <Card>
        <AppText variant="tiny" faint>Ne zaman?</AppText>
        <AppText variant="h3" style={{ marginTop: 4 }}>{fmtDateTime(at.toISOString())}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.sm }}>
          <Chip label="-1 gün" onPress={() => shift(-1440)} />
          <Chip label="-1 saat" onPress={() => shift(-60)} />
          <Chip label="-15 dk" onPress={() => shift(-15)} />
          <Chip label="+15 dk" onPress={() => shift(15)} />
          <Chip label="+1 saat" onPress={() => shift(60)} />
          <Chip label="Şimdi" icon="time" onPress={() => setAt(new Date())} active />
        </View>
      </Card>

      <SectionHeader title="Nasıl hissettin?" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {TYPES.map((t) => (
          <Pressable key={t.id} onPress={() => setType(t.id)} style={[styles.typeBox, type === t.id && styles.typeActive]}>
            <AppText style={{ fontSize: 28 }}>{t.emoji}</AppText>
            <AppText variant="bodyStrong" style={{ marginTop: 4 }}>{t.id.charAt(0).toLocaleUpperCase('tr') + t.id.slice(1)}</AppText>
            <AppText variant="small" muted center>{t.hint}</AppText>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Ne kadar sürdü?" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DURATIONS.map((d) => <Chip key={d.id} label={d.label} active={duration === d.id} onPress={() => setDuration(d.id)} color={colors.blue} />)}
      </View>

      <SectionHeader title="Şiddeti" subtitle="1 çok hafif · 10 ayakta duramadım" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const c = severityColor(n, colors);
          return (
            <Pressable key={n} onPress={() => setSeverity(n)} style={[styles.sev, severity === n && { backgroundColor: c, borderColor: c }]}>
              <AppText variant="h3" color={severity === n ? colors.white : colors.text}>{n}</AppText>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Tetikleyici" subtitle="Hemen öncesinde ne vardı?" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TRIGGERS.map((t) => <Chip key={t} label={t} active={triggers.includes(t)} onPress={() => setTriggers((l) => toggle(l, t))} color={colors.coral} />)}
      </View>

      <SectionHeader title="Eşlik eden" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {ACCOMPANYING.map((a) => <Chip key={a} label={a} active={acc.includes(a)} onPress={() => setAcc((l) => toggle(l, a))} color={colors.accent2} />)}
      </View>

      <SectionHeader title="Not" subtitle="İsteğe bağlı" />
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Örn. sabah yataktan sağa dönerken başladı"
        placeholderTextColor={colors.textFaint}
        multiline
        style={styles.input}
      />

      <Button title="Kaydet" size="lg" icon="checkmark-circle" gradient={gradients.ocean} style={{ marginTop: space.xl }} onPress={save} />
      <AppText variant="small" faint center style={{ marginTop: space.sm }}>Kayıtlar yalnızca bu telefonda saklanır. Bu uygulama tıbbi tanı yerine geçmez.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  typeBox: { width: '47%', flexGrow: 1, alignItems: 'center', padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  typeActive: { borderColor: colors.blue, backgroundColor: 'rgba(76,155,255,0.14)' },
  sev: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { minHeight: 80, padding: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' },
});
