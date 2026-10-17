import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Line, G } from 'react-native-svg';
import { AppText } from '@/core/ui';
import { colors } from '@/core/theme';
import { MIN_DB, MAX_DB, zoneFor } from '../util';

const W = 300, H = 190, CX = 150, CY = 160, R = 120;
const START = Math.PI, END = 2 * Math.PI; // sol → sağ yarım daire
const angleFor = (db: number) => START + ((Math.max(MIN_DB, Math.min(MAX_DB, db)) - MIN_DB) / (MAX_DB - MIN_DB)) * (END - START);
const pt = (a: number, r: number) => ({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });
const arc = (from: number, to: number, r: number) => {
  const p0 = pt(angleFor(from), r), p1 = pt(angleFor(to), r);
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`;
};
const ZONES: { from: number; to: number; color: string }[] = [
  { from: MIN_DB, to: 70, color: colors.mint },
  { from: 70, to: 85, color: colors.amber },
  { from: 85, to: 100, color: '#FF8C42' },
  { from: 100, to: MAX_DB, color: colors.red },
];

/** Yarım daire gösterge: renk bölgeleri + yumuşak hareket eden ibre. */
export function Gauge({ db, live }: { db: number | null; live: boolean }) {
  const anim = useRef(new Animated.Value(MIN_DB)).current;
  const [shown, setShown] = useState(MIN_DB);
  useEffect(() => {
    Animated.timing(anim, { toValue: db ?? MIN_DB, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [db, anim]);
  useEffect(() => {
    const id = anim.addListener(({ value }) => setShown(value));
    return () => anim.removeListener(id);
  }, [anim]);

  const a = angleFor(shown);
  const tip = pt(a, R - 14);
  const base = pt(a, 18);
  const zone = zoneFor(shown);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={W} height={H}>
        <Path d={arc(MIN_DB, MAX_DB, R)} stroke={colors.surfaceStrong} strokeWidth={18} fill="none" strokeLinecap="round" />
        {ZONES.map((z) => <Path key={z.from} d={arc(z.from, z.to, R)} stroke={z.color} strokeWidth={18} fill="none" opacity={0.85} />)}
        {[40, 55, 70, 85, 100, 115].map((t) => {
          const p0 = pt(angleFor(t), R - 16), p1 = pt(angleFor(t), R - 24);
          return <Line key={t} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={colors.textFaint} strokeWidth={1.5} />;
        })}
        <G>
          <Line x1={base.x} y1={base.y} x2={tip.x} y2={tip.y} stroke={live ? colors.text : colors.textFaint} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={CX} cy={CY} r={10} fill={colors.bg3} stroke={zone.color} strokeWidth={3} />
        </G>
      </Svg>
      <View style={{ position: 'absolute', top: 70, alignItems: 'center' }}>
        <AppText style={{ fontSize: 56, fontWeight: '800', lineHeight: 62, color: db == null ? colors.textFaint : zone.color }}>{db == null ? '—' : Math.round(shown)}</AppText>
        <AppText variant="tiny" muted>dB · yaklaşık</AppText>
      </View>
    </View>
  );
}
