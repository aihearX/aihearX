import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, Chip } from '@/core/ui';
import { colors, space, radius } from '@/core/theme';
import { classify, randomFor, TYPES, type JergerType, type Tymp } from '../logic';
import { Slider } from './Slider';
import { TympCurve } from './TympCurve';

export function Explore({ width, onSave }: { width: number; onSave: (label: string) => void }) {
  const [t, setT] = useState<Tymp>({ pressure: -10, compliance: 0.8, volume: 1.1 });
  const [saved, setSaved] = useState(false);
  const c = useMemo(() => classify(t), [t]);
  const jump = (type: JergerType) => { setT(randomFor(type)); setSaved(false); };

  return (
    <View style={{ gap: space.md }}>
      <Animated.View entering={FadeInDown}>
        <Card style={{ alignItems: 'center' }}>
          <TympCurve t={t} width={width} height={Math.round(width * 0.66)} color={c.color} />
          <Animated.View key={c.title} entering={FadeIn.duration(250)} style={[styles.badge, { borderColor: c.color }]}>
            <AppText variant="bodyStrong" color={c.color}>{c.title}</AppText>
          </Animated.View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60)}>
        <Card>
          <Slider label="Tepe basıncı" value={t.pressure} min={-400} max={200} step={5} unit="daPa" color={colors.accent} onChange={(v) => { setT((p) => ({ ...p, pressure: v })); setSaved(false); }} />
          <Slider label="Statik komplians (admitans)" value={t.compliance} min={0} max={3} step={0.05} unit="ml" color={colors.accent2} format={(v) => v.toFixed(2)} onChange={(v) => { setT((p) => ({ ...p, compliance: v })); setSaved(false); }} />
          <Slider label="Kulak kanalı hacmi (ECV)" value={t.volume} min={0.3} max={3} step={0.1} unit="ml" color={colors.amber} onChange={(v) => { setT((p) => ({ ...p, volume: v })); setSaved(false); }} />
          <View style={styles.chips}>
            <AppText variant="tiny" faint style={{ alignSelf: 'center' }}>ÖRNEK:</AppText>
            {TYPES.map((ty) => <Chip key={ty} label={ty} small active={c.type === ty} onPress={() => jump(ty)} color={colors.accent} />)}
          </View>
        </Card>
      </Animated.View>

      <Animated.View key={c.title} entering={FadeInDown.delay(40)}>
        <Card style={{ borderColor: c.color }}>
          <AppText variant="h3" color={c.color}>{c.title}</AppText>
          <AppText variant="body" muted style={{ marginTop: 4 }}>{c.summary}</AppText>
          <AppText variant="tiny" faint style={{ marginTop: space.md }}>OLASI KLİNİK BULGULAR</AppText>
          {c.findings.map((f) => (
            <View key={f} style={styles.findRow}>
              <Ionicons name="ellipse" size={6} color={c.color} style={{ marginTop: 8 }} />
              <AppText variant="body" style={{ flex: 1 }}>{f}</AppText>
            </View>
          ))}
          <AppText variant="small" faint style={{ marginTop: space.md }}>226 Hz prob tonu, erişkin normları. Sınır değerler cihaz ve yaşa göre değişir; tanı yerine geçmez.</AppText>
        </Card>
      </Animated.View>
      <Button title={saved ? 'Kaydedildi' : 'Bu Eğriyi Kaydet'} icon={saved ? 'checkmark' : 'save'} disabled={saved} onPress={() => { setSaved(true); onSave(`Keşfet · Tip ${c.type}`); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { marginTop: space.sm, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surfaceStrong },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.md, alignItems: 'center' },
  findRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
});
