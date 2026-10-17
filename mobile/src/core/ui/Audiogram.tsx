import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Text as SvgText, Circle, Path, Rect, G } from 'react-native-svg';
import { colors } from '@/core/theme';

export const AUDIOGRAM_FREQS = [250, 500, 1000, 2000, 4000, 8000] as const;
export type AudiogramFreq = (typeof AUDIOGRAM_FREQS)[number];
/** Eşikler dB HL; null = ölçülmedi. Sıra AUDIOGRAM_FREQS ile aynı. */
export type EarThresholds = { ac: (number | null)[]; bc?: (number | null)[] };
export type AudiogramData = { right?: EarThresholds; left?: EarThresholds };

type Props = {
  data: AudiogramData;
  width?: number;
  height?: number;
  showBone?: boolean;
  highlightFreqs?: number[];
  speechBanana?: boolean;
  compact?: boolean;
};

const MIN_DB = -10;
const MAX_DB = 120;

/** Standart odyogram: X frekans (log), Y dB HL (aşağı doğru artar). Sağ = kırmızı O, Sol = mavi X, kemik = < > */
export function Audiogram({ data, width = 320, height = 260, showBone = true, highlightFreqs, speechBanana, compact }: Props) {
  const padL = compact ? 28 : 36;
  const padR = 10;
  const padT = compact ? 18 : 24;
  const padB = compact ? 18 : 26;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const x = (i: number) => padL + (plotW * i) / (AUDIOGRAM_FREQS.length - 1);
  const y = (db: number) => padT + ((db - MIN_DB) / (MAX_DB - MIN_DB)) * plotH;
  const gridDb = [0, 20, 40, 60, 80, 100, 120];

  const path = (vals: (number | null)[]) => {
    let d = '';
    vals.forEach((v, i) => {
      if (v == null) return;
      d += (d ? ' L' : 'M') + `${x(i)} ${y(v)}`;
    });
    return d;
  };

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Rect x={padL} y={padT} width={plotW} height={plotH} fill="rgba(255,255,255,0.03)" rx={8} />
        {speechBanana ? (
          <Path
            d={`M${x(0)} ${y(28)} C ${x(1)} ${y(16)}, ${x(2.4)} ${y(14)}, ${x(3.6)} ${y(22)} C ${x(4.4)} ${y(30)}, ${x(5)} ${y(42)}, ${x(5)} ${y(50)} C ${x(4.4)} ${y(60)}, ${x(3)} ${y(62)}, ${x(2)} ${y(58)} C ${x(1)} ${y(55)}, ${x(0.3)} ${y(48)}, ${x(0)} ${y(28)} Z`}
            fill="rgba(255,194,92,0.16)"
            stroke="rgba(255,194,92,0.5)"
            strokeWidth={1}
          />
        ) : null}
        {gridDb.map((db) => (
          <G key={db}>
            <Line x1={padL} x2={padL + plotW} y1={y(db)} y2={y(db)} stroke={colors.border} strokeWidth={db === 0 ? 1.5 : 1} />
            <SvgText x={padL - 6} y={y(db) + 4} fontSize={compact ? 9 : 10} fill={colors.textFaint} textAnchor="end">{db}</SvgText>
          </G>
        ))}
        {AUDIOGRAM_FREQS.map((f, i) => (
          <G key={f}>
            <Line x1={x(i)} x2={x(i)} y1={padT} y2={padT + plotH} stroke={highlightFreqs?.includes(f) ? colors.amber : colors.border} strokeWidth={highlightFreqs?.includes(f) ? 1.5 : 1} strokeDasharray={highlightFreqs?.includes(f) ? undefined : '3,4'} />
            <SvgText x={x(i)} y={height - 6} fontSize={compact ? 9 : 10} fill={colors.textFaint} textAnchor="middle">{f >= 1000 ? `${f / 1000}k` : f}</SvgText>
          </G>
        ))}
        {/* Sol kulak önce çizilir, sağ üstte kalsın */}
        {data.left ? (
          <G>
            <Path d={path(data.left.ac)} stroke={colors.earLeft} strokeWidth={2} fill="none" />
            {data.left.ac.map((v, i) => v == null ? null : (
              <G key={`l${i}`}>
                <Line x1={x(i) - 6} y1={y(v) - 6} x2={x(i) + 6} y2={y(v) + 6} stroke={colors.earLeft} strokeWidth={2.5} />
                <Line x1={x(i) + 6} y1={y(v) - 6} x2={x(i) - 6} y2={y(v) + 6} stroke={colors.earLeft} strokeWidth={2.5} />
              </G>
            ))}
            {showBone && data.left.bc ? data.left.bc.map((v, i) => v == null ? null : (
              <SvgText key={`lb${i}`} x={x(i) + 10} y={y(v) + 5} fontSize={14} fontWeight="700" fill={colors.earLeft}>{'>'}</SvgText>
            )) : null}
          </G>
        ) : null}
        {data.right ? (
          <G>
            <Path d={path(data.right.ac)} stroke={colors.earRight} strokeWidth={2} fill="none" />
            {data.right.ac.map((v, i) => v == null ? null : <Circle key={`r${i}`} cx={x(i)} cy={y(v)} r={6} stroke={colors.earRight} strokeWidth={2.5} fill={colors.bg} />)}
            {showBone && data.right.bc ? data.right.bc.map((v, i) => v == null ? null : (
              <SvgText key={`rb${i}`} x={x(i) - 18} y={y(v) + 5} fontSize={14} fontWeight="700" fill={colors.earRight}>{'<'}</SvgText>
            )) : null}
          </G>
        ) : null}
      </Svg>
    </View>
  );
}

/** Saf ses ortalaması (500-1000-2000 Hz). */
export function pta(ac: (number | null)[]): number | null {
  const v = [ac[1], ac[2], ac[3]].filter((n): n is number => typeof n === 'number');
  if (v.length < 3) return null;
  return Math.round((v[0]! + v[1]! + v[2]!) / 3);
}

export function degreeLabel(ptaValue: number | null): string {
  if (ptaValue == null) return 'Bilinmiyor';
  if (ptaValue <= 25) return 'Normal işitme';
  if (ptaValue <= 40) return 'Hafif kayıp';
  if (ptaValue <= 55) return 'Orta kayıp';
  if (ptaValue <= 70) return 'Orta-ileri kayıp';
  if (ptaValue <= 90) return 'İleri kayıp';
  return 'Çok ileri kayıp';
}
