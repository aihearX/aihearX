import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, AppText, Button, Card, Chip } from '@/core/ui';
import { colors, radius, space } from '@/core/theme';
import { ROLES } from '@/core/registry/roles';
import type { Role } from '@/core/registry/types';
import { useUser } from '@/core/store/user';
import { UNIVERSITIES, CITIES } from '@/core/data/universities';

export default function Rol() {
  const profile = useUser((s) => s.profile);
  const complete = useUser((s) => s.completeOnboarding);
  const [name, setName] = useState(profile?.name === 'Misafir' ? '' : profile?.name ?? '');
  const [role, setRole] = useState<Role | null>(null);
  const [uni, setUni] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const needsUni = role === 'ogrenci';
  const needsCity = role === 'odyolog' || role === 'odyometrist' || role === 'kbb';
  const ok = name.trim().length >= 2 && role != null && (!needsUni || uni) && (!needsCity || city);

  return (
    <Screen>
      <AppText variant="tiny" color={colors.accent2}>Adım 1 / 1</AppText>
      <AppText variant="h1" style={{ marginTop: 6 }}>Seni tanıyalım</AppText>
      <AppText variant="body" muted>Uygulama rolüne göre şekillenir. Bu bilgiler profilinde görünür, istediğin zaman değiştirirsin.</AppText>

      <Card style={{ marginTop: space.xl }}>
        <AppText variant="tiny" faint>Adın</AppText>
        <TextInput value={name} onChangeText={setName} placeholder="Ad Soyad" placeholderTextColor={colors.textFaint} style={styles.input} />
      </Card>

      <AppText variant="h3" style={{ marginTop: space.xl, marginBottom: 10 }}>Odyoloji ile bağın ne?</AppText>
      <View style={{ gap: 8 }}>
        {ROLES.map((r, i) => (
          <Animated.View key={r.id} entering={FadeInDown.delay(40 * i)}>
            <Pressable onPress={() => setRole(r.id)} style={({ pressed }) => [styles.role, role === r.id && styles.roleActive, pressed && { opacity: 0.85 }]}>
              <AppText variant="h2">{r.emoji}</AppText>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{r.name}</AppText>
                <AppText variant="small" muted>{r.hint}</AppText>
              </View>
              <View style={[styles.radio, role === r.id && styles.radioOn]} />
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {needsUni ? (
        <View style={{ marginTop: space.xl }}>
          <AppText variant="h3" style={{ marginBottom: 10 }}>Üniversiten</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {UNIVERSITIES.map((u) => <Chip key={u} label={u} active={uni === u} onPress={() => setUni(u)} />)}
          </ScrollView>
        </View>
      ) : null}
      {needsCity ? (
        <View style={{ marginTop: space.xl }}>
          <AppText variant="h3" style={{ marginBottom: 10 }}>Şehrin</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CITIES.map((u) => <Chip key={u} label={u} active={city === u} onPress={() => setCity(u)} />)}
          </ScrollView>
        </View>
      ) : null}

      <Button title="Başlayalım" size="lg" icon="arrow-forward" disabled={!ok} onPress={() => complete({ name: name.trim(), role: role!, university: uni, city })} style={{ marginTop: space.xxl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { marginTop: 6, color: colors.text, fontSize: 17, fontWeight: '600', paddingVertical: 6 },
  role: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  roleActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderStrong },
  radioOn: { borderColor: colors.accent2, backgroundColor: colors.accent2 },
});
