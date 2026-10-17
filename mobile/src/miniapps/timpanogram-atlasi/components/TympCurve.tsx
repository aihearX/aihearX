import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText, G, Circle } from 'react-native-svg';
import { colors } from '@/core/theme';
import type { Tymp } from '../logic';

const P_MIN = -400, P_MAX = 200, C_MAX = 3;

/** Timpanogram eğrisi: X basınç (daPa), Y komplians (ml). */
export function TympCurve({ t, width = 320, height = 220, color = colors.accent2, showVolume = true }: { t: Tymp; width?: number; height?: number; color?: string; showVolume?: boolean }) {
  const padL = 34, padR = 12, padT = 16, padB = 26;
  const pw = width - padL - padR, ph = height - padT - padB;
  const x = (p: number) => padL + ((p - P_MIN) / (P_MAX - P_MIN)) * pw;
  const y = (c: number) => padT + (1 - Math.min(C_MAX, c) / C_MAX) * ph;
  const sigma = 55 + t.compliance * 20;
  const curve = (p: number) => 0.03 + t.compliance * Math.exp(-((p - t.pressure) ** 2) / (2 * sigma * sigma));
  let d = '';
  for (let p = P_MIN; p <= P_MAX; p += 5) d += (d ? ' L' : 'M') + `${x(p).toFixed(1)} ${y(curve(p)).toFixed(1)}`;
  const area = `${d} L${x(P_MAX)} ${y(0)} L${x(P_MIN)} ${y(0)} Z`;
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Rect x={padL} y={padT} width={pw} height={ph} rx={8} fill="rgba(255,255,255,0.03)" />
        <Rect x={x(-100)} y={padT} width={x(50) - x(-100)} height={ph} fill="rgba(74,222,128,0.07)" />
        {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((c) => (
          <G key={c}>
            <Line x1={padL} x2={padL + pw} y1={y(c)} y2={y(c)} stroke={colors.border} strokeWidth={1} />
            <SvgText x={padL - 5} y={y(c) + 3} fontSize={9} fill={colors.textFaint} textAnchor="end">{c}</SvgText>
          </G>
        ))}
        {[-400, -300, -200, -100, 0, 100, 200].map((p) => (
          <G key={p}>
            <Line x1={x(p)} x2={x(p)} y1={padT} y2={padT + ph} stroke={p === 0 ? colors.borderStrong : colors.border} strokeWidth={1} strokeDasharray={p === 0 ? undefined : '3,4'} />
            <SvgText x={x(p)} y={height - 8} fontSize={9} fill={colors.textFaint} textAnchor="middle">{p}</SvgText>
          </G>
        ))}
        <Path d={area} fill={color} opacity={0.14} />
        <Path d={d} stroke={color} strokeWidth={2.5} fill="none" />
        {t.compliance > 0.1 ? <Circle cx={x(t.pressure)} cy={y(curve(t.pressure))} r={4} fill={color} /> : null}
        <SvgText x={padL + 4} y={padT + 11} fontSize={9} fill={colors.textFaint}>ml</SvgText>
        <SvgText x={padL + pw - 4} y={height - 8 - 10} fontSize={9} fill={colors.textFaint} textAnchor="end">daPa</SvgText>
        {showVolume ? <SvgText x={padL + pw - 6} y={padT + 14} fontSize={10} fontWeight="700" fill={colors.textMuted} textAnchor="end">ECV {t.volume.toFixed(1)} ml</SvgText> : null}
      </Svg>
    </View>
  );
}
