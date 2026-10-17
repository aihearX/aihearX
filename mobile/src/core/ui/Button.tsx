import React from 'react';
import { Pressable, StyleSheet, View, ActivityIndicator, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, space, type Gradient } from '@/core/theme';
import { AppText } from './AppText';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  gradient?: Gradient;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
  full?: boolean;
};

export function Button({ title, onPress, variant = 'primary', gradient, icon, size = 'md', disabled, loading, style, haptic = true, full }: Props) {
  const h = size === 'sm' ? 38 : size === 'lg' ? 58 : 50;
  const fs = size === 'sm' ? 14 : size === 'lg' ? 17 : 15;
  const press = () => {
    if (disabled || loading) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };
  const content = (
    <View style={styles.row}>
      {loading ? <ActivityIndicator color={colors.text} /> : icon ? <Ionicons name={icon} size={fs + 3} color={variant === 'primary' ? colors.white : colors.text} /> : null}
      <AppText variant="bodyStrong" color={variant === 'primary' ? colors.white : variant === 'danger' ? colors.red : colors.text} style={{ fontSize: fs }}>
        {title}
      </AppText>
    </View>
  );
  return (
    <Pressable onPress={press} disabled={disabled || loading} style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }, full && { alignSelf: 'stretch' }, style]}>
      {variant === 'primary' ? (
        <LinearGradient colors={[...(gradient ?? gradients.brand)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, { height: h }]}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.base, { height: h }, variant === 'secondary' && styles.secondary, variant === 'ghost' && styles.ghost, variant === 'danger' && styles.dangerBox]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secondary: { backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  dangerBox: { backgroundColor: 'rgba(255,92,92,0.12)', borderWidth: 1, borderColor: 'rgba(255,92,92,0.35)' },
});
