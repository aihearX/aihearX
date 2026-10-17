import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { SKILL_CAVEAT } from '../logic';

/** Sonuç ekranındaki beceri cümlesi + dürüst uyarı. */
export function SkillCard({ sentence, daily }: { sentence: string; daily: boolean }) {
  return (
    <View style={{ gap: 10 }}>
      <Card>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Ionicons name="ear" size={20} color={colors.accent2} />
          <AppText style={{ flex: 1 }}>{sentence}</AppText>
        </View>
        <AppText variant="small" faint style={{ marginTop: space.sm }}>{SKILL_CAVEAT}</AppText>
      </Card>
      {daily ? (
        <Card style={{ backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }}>
          <AppText variant="small" color={colors.accent}>Günün avı tamamlandı. Yarın yeni dizi seni bekliyor; skorunu paylaş.</AppText>
        </Card>
      ) : null}
    </View>
  );
}
