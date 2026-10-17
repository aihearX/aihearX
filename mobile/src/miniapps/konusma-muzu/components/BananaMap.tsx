import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Audiogram, AppText } from '@/core/ui';
import { colors, radius } from '@/core/theme';
import { MAP, PHONEMES, freqToX, dbToY, type Phoneme, type LossProfile } from '../data';

type Props = { profile: LossProfile; selected: Phoneme | null; lostIds: Set<string>; onSelect: (p: Phoneme) => void };

const SIZE = 30;

/** Odyogram + konuşma muzu üzerine dokunulabilir fonem işaretleri. */
export function BananaMap({ profile, selected, lostIds, onSelect }: Props) {
  return (
    <View style={{ width: MAP.width, height: MAP.height, alignSelf: 'center' }}>
      <Audiogram data={profile.thresholds ? { left: { ac: profile.thresholds } } : {}} width={MAP.width} height={MAP.height} speechBanana showBone={false} />
      {PHONEMES.map((p) => {
        const lost = lostIds.has(p.id);
        const active = selected?.id === p.id;
        return (
          <Pressable
            key={p.id}
            onPress={() => onSelect(p)}
            hitSlop={6}
            style={({ pressed }) => [
              styles.marker,
              { left: freqToX(p.freq) - SIZE / 2, top: dbToY(p.db) - SIZE / 2 },
              lost ? styles.lost : styles.alive,
              active && styles.active,
              pressed && { transform: [{ scale: 0.9 }] },
            ]}
          >
            <AppText variant="small" color={lost ? colors.textFaint : colors.white} style={{ fontSize: 11, fontWeight: '800', textDecorationLine: lost ? 'line-through' : 'none' }}>
              {p.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  marker: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  alive: { backgroundColor: colors.amber, borderColor: 'rgba(255,255,255,0.6)' },
  lost: { backgroundColor: colors.bg3, borderColor: colors.border },
  active: { borderColor: colors.white, borderWidth: 2.5, transform: [{ scale: 1.15 }] },
});
