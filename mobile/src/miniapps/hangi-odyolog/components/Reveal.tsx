import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card, ShareCard } from '@/core/ui';
import { colors, space } from '@/core/theme';
import { SEBAHATTIN } from '@/core/registry/makers';
import { TYPES, type OdyoType } from '../data';

export function Reveal({ type, shareText, onRetry }: { type: OdyoType; shareText: string; onRetry: () => void }) {
  const mate = TYPES[type.compatible];
  return (
    <View>
      <Animated.View entering={ZoomIn.duration(600)}>
        <Card gradient={type.gradient} glow={type.gradient[0]} style={{ alignItems: 'center', paddingVertical: space.xxl }}>
          <AppText variant="tiny" color="rgba(255,255,255,0.85)">Sen bir</AppText>
          <AppText style={{ fontSize: 72, lineHeight: 84 }}>{type.emoji}</AppText>
          <AppText variant="display" color={colors.white} center>{type.name}</AppText>
          <AppText color="rgba(255,255,255,0.92)" center style={{ marginTop: space.md }}>{type.description}</AppText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350)} style={{ gap: 10, marginTop: space.lg }}>
        <Row icon="flash" color={colors.mint} title="Güçlü yanın" text={type.strength} />
        <Row icon="alert-circle" color={colors.amber} title="Dikkat et" text={type.watchOut} />
        <Row icon="business" color={colors.blue} title="İdeal ortam" text={type.ideal} />
        <Row icon="people" color={colors.coral} title="En iyi anlaştığın tip" text={`${mate.emoji} ${mate.name}: ${mate.strength}`} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)} style={{ marginTop: space.xl }}>
        <ShareCard title={`Ben bir ${type.nameSuffix} ${type.emoji}`} subtitle="Sen hangisisin?" gradient={type.gradient} shareText={shareText} makerName={SEBAHATTIN.name}>
          <AppText variant="small" color="rgba(255,255,255,0.88)">{type.strength}</AppText>
        </ShareCard>
        <Button title="Tekrar çöz" variant="secondary" icon="refresh" style={{ marginTop: space.lg }} onPress={onRetry} />
        <AppText variant="small" faint center style={{ marginTop: space.md }}>Eğlence amaçlıdır; kariyer ya da tıbbi bir değerlendirme değildir.</AppText>
      </Animated.View>
    </View>
  );
}

function Row({ icon, color, title, text }: { icon: keyof typeof Ionicons.glyphMap; color: string; title: string; text: string }) {
  return (
    <Card style={styles.row}>
      <View style={[styles.icon, { backgroundColor: `${color}22` }]}><Ionicons name={icon} size={18} color={color} /></View>
      <View style={{ flex: 1 }}>
        <AppText variant="tiny" faint>{title}</AppText>
        <AppText style={{ marginTop: 2 }}>{text}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
