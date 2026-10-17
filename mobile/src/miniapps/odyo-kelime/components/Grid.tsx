import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FlipInEasyX, ZoomIn } from 'react-native-reanimated';
import { AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import { MAX_TRIES, WORD_LEN, type Mark, type Row } from '../logic';

type Props = { rows: Row[]; current: string; shake?: boolean };

const BG: Record<Mark, string> = { green: colors.mint, yellow: colors.amber, gray: 'rgba(255,255,255,0.14)' };

/** 6x5 harf ızgarası. Tamamlanan satırlar renkli; aktif satır yazılırken dolu. */
export function Grid({ rows, current }: Props) {
  const { width } = useWindowDimensions();
  const gap = 6;
  const size = Math.min(60, Math.floor((width - 32 - gap * (WORD_LEN - 1)) / WORD_LEN));
  const lines = Array.from({ length: MAX_TRIES }, (_, i) => {
    const r = rows[i];
    if (r) return { letters: [...r.word], marks: r.marks };
    if (i === rows.length) return { letters: [...current.padEnd(WORD_LEN, ' ')], marks: null };
    return { letters: Array.from({ length: WORD_LEN }, () => ' '), marks: null };
  });
  return (
    <View style={{ gap, alignItems: 'center' }}>
      {lines.map((line, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap }}>
          {line.letters.map((ch, ci) => {
            const mark = line.marks?.[ci];
            const filled = ch !== ' ';
            const cell = (
              <View style={[styles.cell, { width: size, height: size }, filled && !mark && styles.filled, mark && { backgroundColor: BG[mark], borderColor: BG[mark] }]}>
                <AppText variant="h1" color={mark === 'gray' || !mark ? colors.text : colors.bg}>{ch.trim()}</AppText>
              </View>
            );
            if (mark) return <Animated.View key={ci} entering={FlipInEasyX.delay(ci * 120)}>{cell}</Animated.View>;
            if (filled) return <Animated.View key={`${ci}-${ch}`} entering={ZoomIn.duration(120)}>{cell}</Animated.View>;
            return <View key={ci}>{cell}</View>;
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { borderRadius: radius.sm, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  filled: { borderColor: colors.borderStrong, backgroundColor: colors.surfaceStrong },
});
