import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Chip } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import { fmtSnr } from '../logic';

type Props = { listening: boolean; accepting: boolean; snrDb: number; step: number; text: string; kind: 'good' | 'bad' | null };

const BARS = [0, 1, 2, 3, 4, 5, 6];

/** Gürültü/konuşma göstergesi: dinlerken dalgalanan çubuklar, SNR rozeti ve durum metni. */
export function NoiseMeter({ listening, accepting, snrDb, step, text, kind }: Props) {
  const vals = useRef(BARS.map(() => new Animated.Value(0.2))).current;

  useEffect(() => {
    if (!listening) {
      Animated.parallel(vals.map((v) => Animated.timing(v, { toValue: 0.2, duration: 220, useNativeDriver: true }))).start();
      return;
    }
    const loops = vals.map((v, i) => Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 0.5 + ((i * 37) % 50) / 100, duration: 180 + ((i * 53) % 160), easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.15 + ((i * 29) % 30) / 100, duration: 160 + ((i * 41) % 140), easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])));
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [listening, vals]);

  const status = listening ? (accepting ? 'Rakamları yazabilirsin' : 'Gürültü başlıyor...') : accepting ? 'Üç rakamı yaz' : text || 'Hazırlan';
  const statusColor = kind === 'good' && !listening && !accepting ? colors.mint : kind === 'bad' && !listening && !accepting ? colors.red : colors.textMuted;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Chip label={`SNR ${fmtSnr(snrDb)}`} icon="pulse" small active color={snrDb <= 0 ? colors.coral : colors.accent2} />
        <Chip label={`Zorluk ${step + 1}`} icon="flame" small />
      </View>
      <View style={styles.bars}>
        {vals.map((v, i) => (
          <Animated.View key={i} style={[styles.bar, { backgroundColor: listening ? colors.accent : colors.borderStrong, transform: [{ scaleY: v }] }]} />
        ))}
        <View style={styles.icon}><Ionicons name={listening ? 'volume-high' : accepting ? 'keypad' : 'ear'} size={22} color={listening ? colors.accent : colors.textMuted} /></View>
      </View>
      <AppText variant="bodyStrong" center color={statusColor} style={{ marginTop: 6 }}>{status}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 10 },
  top: { flexDirection: 'row', gap: 8 },
  bars: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 64, marginTop: 10 },
  bar: { width: 10, height: 56, borderRadius: radius.pill },
  icon: { marginLeft: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
});
