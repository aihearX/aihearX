import React from 'react';
import { ScrollView, View, type ViewStyle, StyleSheet, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/core/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  topInset?: boolean;
  bottomInset?: boolean;
  scrollProps?: ScrollViewProps;
};

/** Tüm ekranların kabuğu: beyaz zemin, güvenli alanlar, sade boşluklar. */
export function Screen({ children, scroll = true, padded = true, style, contentStyle, topInset = true, bottomInset = true, scrollProps }: Props) {
  const insets = useSafeAreaInsets();
  const pad = {
    paddingTop: (topInset ? insets.top : 0) + (padded ? space.md : 0),
    paddingBottom: (bottomInset ? insets.bottom : 0) + (padded ? space.xl : 0) + 72,
    paddingHorizontal: padded ? space.lg : 0,
  };
  return (
    <View style={[styles.root, style]}>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[pad, contentStyle]} {...scrollProps}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } });
