import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText, Button, Card } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { DUEL_TARGET } from '../logic';

type Props = { onStart: (a: string, b: string) => void; onBack: () => void };

/** İki oyuncu adı; telefon aranızda, üst yarı ters görünür. */
export function DuelSetup({ onStart, onBack }: Props) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const nameA = a.trim() || 'Oyuncu 1';
  const nameB = b.trim() || 'Oyuncu 2';
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown}>
        <Card gradient={gradients.ember} style={{ alignItems: 'center', paddingVertical: space.xl }}>
          <AppText style={{ fontSize: 48, lineHeight: 56 }}>⚔️</AppText>
          <AppText variant="h1" color={colors.white} center>Düello</AppText>
          <AppText color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>Telefonu aranıza koyun. İki ton çalar; daha tiz olana ilk doğru dokunan puanı alır. Yanlış dokunan rakibe puan verir. İlk {DUEL_TARGET} puan kazanır.</AppText>
        </Card>
        <Card style={{ marginTop: space.lg, gap: 10 }}>
          <AppText variant="tiny" faint>Alt taraf</AppText>
          <TextInput value={a} onChangeText={setA} placeholder="Oyuncu 1" placeholderTextColor={colors.textFaint} maxLength={14} style={styles.input} returnKeyType="next" />
          <AppText variant="tiny" faint style={{ marginTop: 4 }}>Üst taraf (ters görünür)</AppText>
          <TextInput value={b} onChangeText={setB} placeholder="Oyuncu 2" placeholderTextColor={colors.textFaint} maxLength={14} style={styles.input} returnKeyType="done" />
        </Card>
        <Button title={`${nameA} vs ${nameB} · Başla`} icon="flash" size="lg" gradient={gradients.ember} style={{ marginTop: space.lg }} onPress={() => onStart(nameA, nameB)} />
        <Button title="Geri" variant="ghost" style={{ marginTop: space.sm }} onPress={onBack} />
        <AppText variant="small" muted center style={{ marginTop: space.md }}>🔊 Hoparlörden oynanır; ikiniz de aynı sesi duyarsınız.</AppText>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  input: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 16, color: colors.text },
});
