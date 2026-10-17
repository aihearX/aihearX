import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { HINT_META } from '../logic';

type Props = { hints: readonly string[]; unlocked: number };

/** Adım 3: beş ipucu kartı; her yanlış tahminde bir tanesi animasyonla açılır. Dipnot öğreticidir. */
export function HintCards({ hints, unlocked }: Props) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.head}>
        <AppText variant="tiny" faint>İpuçları · {Math.min(unlocked, HINT_META.length)}/{HINT_META.length} açık</AppText>
        <AppText variant="tiny" faint>Her yanlış tahmin bir kart açar</AppText>
      </View>
      {HINT_META.map((h, i) => {
        const open = i < unlocked;
        return (
          <Animated.View key={`${h.title}-${open ? 'open' : 'locked'}`} entering={open ? ZoomIn.duration(260) : FadeInDown.delay(i * 40)} style={[styles.card, open && styles.open]}>
            <View style={[styles.icon, open && styles.iconOpen]}>
              <Ionicons name={open ? h.icon : 'lock-closed'} size={16} color={open ? colors.accent2 : colors.textFaint} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="tiny" color={open ? colors.accent2 : colors.textFaint}>{i + 1}. {h.title}</AppText>
              {open ? (
                <>
                  <AppText variant="body" style={{ lineHeight: 21 }}>{hints[i]}</AppText>
                  <View style={styles.why}>
                    <Ionicons name="bulb" size={12} color={colors.amber} />
                    <AppText variant="small" muted style={{ flex: 1 }}>Neden önemli: {h.why}</AppText>
                  </View>
                </>
              ) : (
                <AppText variant="small" faint>{i + 1 - unlocked === 1 ? 'Bir sonraki yanlış tahminde açılır' : `${i + 1 - unlocked} yanlış tahmin sonra açılır`}</AppText>
              )}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: 0.75 },
  open: { opacity: 1, backgroundColor: colors.bg, borderColor: colors.accent2Soft },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceStrong },
  iconOpen: { backgroundColor: colors.accent2Soft },
  why: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border },
});
