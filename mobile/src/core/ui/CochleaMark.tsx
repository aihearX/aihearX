import React from 'react';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { gradients } from '@/core/theme';

/** Marka işareti: koklea spirali + X. */
export function CochleaMark({ size = 64 }: { size?: number }) {
  // Logaritmik spiral noktaları
  const pts: string[] = [];
  const c = size / 2;
  for (let i = 0; i <= 140; i++) {
    const t = (i / 140) * Math.PI * 4.2;
    const r = (size * 0.06) * Math.exp(0.21 * t);
    const x = c + r * Math.cos(t);
    const y = c + r * Math.sin(t);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <SvgGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={gradients.brand[0]} />
          <Stop offset="1" stopColor={gradients.brand[1]} />
        </SvgGradient>
      </Defs>
      <Circle cx={c} cy={c} r={size * 0.48} fill="rgba(124,92,255,0.10)" />
      <Path d={pts.join(' ')} stroke="url(#g)" strokeWidth={size * 0.075} fill="none" strokeLinecap="round" />
      <Circle cx={c} cy={c} r={size * 0.045} fill={gradients.brand[1]} />
    </Svg>
  );
}
