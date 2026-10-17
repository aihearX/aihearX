import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Button, Card, Chip } from '@/core/ui';
import { colors, gradients, space } from '@/core/theme';
import { playNoise, type Playback } from '@/core/audio';

type Sound = { id: string; color: 'white' | 'pink' | 'brown'; name: string; desc: string };
const SOUNDS: Sound[] = [
  { id: 'white', color: 'white', name: 'Beyaz gürültü', desc: 'Tüm frekanslar eşit; "cızırtı" gibi. Tiz çınlamaları örtmede iyi.' },
  { id: 'pink', color: 'pink', name: 'Pembe gürültü', desc: 'Daha yumuşak, yağmur sesine yakın. Çoğu kişi bunu daha rahat bulur.' },
  { id: 'brown', color: 'brown', name: 'Kahverengi gürültü', desc: 'Derin, uğultulu. Uyku için en çok tercih edilen.' },
  { id: 'fan', color: 'brown', name: 'Fan / yağmur benzeri', desc: 'Kahverengi gürültünün hafif hali; gece masa başına bir fan koymuş gibi.' },
];

export function Therapy() {
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const playback = useRef<Playback | null>(null);
  const stop = () => { playback.current?.stop(); playback.current = null; setActive(null); };
  useEffect(() => () => { playback.current?.stop(); }, []);

  const start = async (s: Sound) => {
    stop();
    setLoading(true);
    try {
      const p = await playNoise({ duration: 30, amplitude: s.id === 'fan' ? 0.18 : 0.25, color: s.color });
      playback.current = p;
      setActive(s.id);
      p.done.then(() => { if (playback.current === p) { playback.current = null; setActive(null); } }).catch(() => {});
    } catch { /* ses yok */ }
    setLoading(false);
  };

  return (
    <Card gradient={gradients.night}>
      <AppText variant="h3">Ses terapisi · 30 sn</AppText>
      <AppText muted style={{ marginTop: 4 }}>Çınlamayı yok etmez ama arkasını doldurur; beyin çınlamayı daha az "önemli" bulur. Sesi çınlamanın hemen altına ayarla; tamamen örtmene gerek yok.</AppText>
      <View style={{ gap: 8, marginTop: space.md }}>
        {SOUNDS.map((s) => (
          <View key={s.id} style={[styles.row, active === s.id && styles.rowActive]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText variant="bodyStrong">{s.name}</AppText>
                {active === s.id ? <Chip label="Çalıyor" small active color={colors.mint} /> : null}
              </View>
              <AppText variant="small" muted>{s.desc}</AppText>
            </View>
            {active === s.id ? (
              <Button title="Durdur" size="sm" variant="danger" icon="stop" onPress={stop} />
            ) : (
              <Button title="Çal" size="sm" variant="secondary" icon="play" loading={loading} onPress={() => start(s)} />
            )}
          </View>
        ))}
      </View>
      <AppText variant="small" faint style={{ marginTop: space.md }}>Ses seviyesi göreli ve kalibre değildir; rahatsız edecek kadar açma.</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  rowActive: { borderColor: colors.mint },
});
