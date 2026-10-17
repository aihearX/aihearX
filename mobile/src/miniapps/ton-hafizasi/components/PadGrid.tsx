import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Pad as PadT } from '../logic';
import { Pad } from './Pad';

type Props = { pads: readonly PadT[]; order: readonly number[]; lit: number | null; enabled: boolean; onTap: (id: number) => void };

/** Pad'ler 2 sütunlu satırlarda; alan dolduğu için 4, 6 ve 8 pad ölçüm gerektirmeden sığar. */
export function PadGrid({ pads, order, lit, enabled, onTap }: Props) {
  const rows: number[][] = [];
  for (let i = 0; i < order.length; i += 2) rows.push(order.slice(i, i + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row.join('-')} style={styles.row}>
          {row.map((id) => { const p = pads[id]; return p ? <Pad key={id} pad={p} lit={lit === id} enabled={enabled} onTap={onTap} /> : null; })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flex: 1, gap: 10 },
  row: { flex: 1, flexDirection: 'row', gap: 10 },
});
