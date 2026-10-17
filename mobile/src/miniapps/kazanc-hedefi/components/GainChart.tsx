import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { AUDIOGRAM_FREQS } from '@/core/ui';
import { colors } from '@/core/theme';

/** Frekans başına hedef kazanç bar grafiği; sağ kırmızı, sol mavi. */
export function GainChart({ right, left, width = 320, height = 200 }: { right: number[]; left: number[]; width?: number; height?: number }) {
  const padL = 30, padR = 8, padT = 16, padB = 24;
  const pw = width - padL - padR, ph = height - padT - padB;
  const maxG = Math.max(40, Math.ceil(Math.max(...right, ...left, 1) / 10) * 10);
  const group = pw / AUDIOGRAM_FREQS.length;
  const bw = Math.min(22, group * 0.34);
  const y = (g: number) => padT + ph - (g / maxG) * ph;
  const ticks = Array.from({ length: maxG / 10 + 1 }, (_, i) => i * 10);
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {ticks.map((t) => (
          <G key={t}>
            <Line x1={padL} x2={padL + pw} y1={y(t)} y2={y(t)} stroke={colors.border} strokeWidth={1} strokeDasharray={t === 0 ? undefined : '3,4'} />
            <SvgText x={padL - 5} y={y(t) + 3} fontSize={9} fill={colors.textFaint} textAnchor="end">{t}</SvgText>
          </G>
        ))}
        {AUDIOGRAM_FREQS.map((f, i) => {
          const cx = padL + group * i + group / 2;
          const r = right[i] ?? 0, l = left[i] ?? 0;
          return (
            <G key={f}>
              <Rect x={cx - bw - 2} y={y(r)} width={bw} height={Math.max(0, y(0) - y(r))} rx={4} fill={colors.earRight} opacity={0.9} />
              <Rect x={cx + 2} y={y(l)} width={bw} height={Math.max(0, y(0) - y(l))} rx={4} fill={colors.earLeft} opacity={0.9} />
              {r > 0 ? <SvgText x={cx - bw / 2 - 2} y={y(r) - 3} fontSize={9} fontWeight="700" fill={colors.earRight} textAnchor="middle">{r}</SvgText> : null}
              {l > 0 ? <SvgText x={cx + bw / 2 + 2} y={y(l) - 3} fontSize={9} fontWeight="700" fill={colors.earLeft} textAnchor="middle">{l}</SvgText> : null}
              <SvgText x={cx} y={height - 7} fontSize={10} fill={colors.textFaint} textAnchor="middle">{f >= 1000 ? `${f / 1000}k` : f}</SvgText>
            </G>
          );
        })}
        <SvgText x={padL + 2} y={padT - 5} fontSize={9} fill={colors.textFaint}>dB kazanç</SvgText>
      </Svg>
    </View>
  );
}
