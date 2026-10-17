import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, type as typeTokens } from '@/core/theme';

type Variant = keyof typeof typeTokens;
type Props = TextProps & { variant?: Variant; color?: string; center?: boolean; muted?: boolean; faint?: boolean };

export function AppText({ variant = 'body', color, center, muted, faint, style, ...rest }: Props) {
  const base = typeTokens[variant] as TextStyle;
  const c = color ?? (faint ? colors.textFaint : muted ? colors.textMuted : colors.text);
  return <Text {...rest} style={[base, { color: c }, center && { textAlign: 'center' }, style]} />;
}
