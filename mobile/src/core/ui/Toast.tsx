import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { create } from 'zustand';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/core/theme';
import { AppText } from './AppText';

type ToastState = { msg: string | null; icon: keyof typeof Ionicons.glyphMap; show: (msg: string, icon?: keyof typeof Ionicons.glyphMap) => void; hide: () => void };
export const useToast = create<ToastState>((set) => ({
  msg: null,
  icon: 'sparkles',
  show: (msg, icon = 'sparkles') => set({ msg, icon }),
  hide: () => set({ msg: null }),
}));

export function ToastHost() {
  const { msg, icon, hide } = useToast();
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(hide, 2200);
    return () => clearTimeout(t);
  }, [msg, hide]);
  if (!msg) return null;
  return (
    <Animated.View entering={FadeInUp} exiting={FadeOutUp} pointerEvents="none" style={styles.wrap}>
      <View style={styles.toast}>
        <Ionicons name={icon} size={16} color={colors.accent2} />
        <AppText variant="bodyStrong">{msg}</AppText>
      </View>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 64, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  toast: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: colors.bg3, borderColor: colors.borderStrong, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill },
});
