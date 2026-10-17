import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import { TEST_FREQS, type Mark } from '../data';

/** Frekans merdiveni: her basamak ✔ / ✖ / bekliyor; şu anki basamak vurgulu. */
export function Ladder({ marks, currentFreq }: { marks: Partial<Record<number, Mark>>; currentFreq: number | null }) {
  return (
    <View style={styles.row}>
      {TEST_FREQS.map((f) => {
        const m = marks[f];
        const cur = f === currentFreq;
        const bg = m === 'heard' ? colors.mint : m === 'inferred' ? colors.accent2Soft : m === 'missed' ? colors.red : cur ? colors.accent : colors.surfaceStrong;
        return (
          <View key={f} style={{ alignItems: 'center', flex: 1 }}>
            <View style={[styles.cell, { backgroundColor: bg }, cur && styles.cur]}>
              {m === 'heard' ? <Ionicons name="checkmark" size={14} color={colors.white} />
                : m === 'inferred' ? <Ionicons name="checkmark" size={14} color={colors.accent2} />
                : m === 'missed' ? <Ionicons name="close" size={14} color={colors.white} />
                : cur ? <View style={styles.dotCur} /> : <View style={styles.dot} />}
            </View>
            <AppText variant="tiny" color={cur ? colors.accent : colors.textFaint} style={{ marginTop: 3, fontSize: 10 }}>{f / 1000}</AppText>
          </View>
        );
      })}
    </View>
  );
}

/** Paylaşım kartına çizilen mini merdiven (beyaz çubuklar). */
export function MiniLadder({ heard }: { heard: number[] }) {
  const set = new Set(heard);
  return (
    <View>
      <View style={styles.miniRow}>
        {TEST_FREQS.map((f, i) => (
          <View key={f} style={{ alignItems: 'center', flex: 1 }}>
            <View style={[styles.miniBar, { height: 10 + (TEST_FREQS.length - i) * 2.4, backgroundColor: set.has(f) ? colors.white : 'rgba(255,255,255,0.28)' }]} />
            <AppText variant="tiny" color="rgba(255,255,255,0.85)" style={{ marginTop: 3, fontSize: 9 }}>{f / 1000}</AppText>
          </View>
        ))}
      </View>
      <AppText variant="tiny" color="rgba(255,255,255,0.75)" style={{ marginTop: 4 }}>kHz · dolu = duydum</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  cell: { height: 26, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  cur: { borderWidth: 2, borderColor: colors.accentSoft },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong },
  dotCur: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.white },
  miniRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  miniBar: { width: '70%', borderRadius: 3 },
});
