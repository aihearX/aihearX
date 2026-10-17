import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Button, Card, Chip, useToast } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { CATEGORIES, type CategoryId } from '@/core/registry';
import { useUser } from '@/core/store/user';
import { submitIdea } from '@/network/api';

/**
 * Yapımcı Ol: "Aklınızdaki yazılım fikri çürüyüp gitmesin."
 * Başvuru kabul edilirse ekip ücretsiz kodlar, uygulama başvuranın adıyla yayınlanır.
 */
export default function YapimciOl() {
  const profile = useUser((s) => s.profile)!;
  const toast = useToast((s) => s.show);
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [who, setWho] = useState('');
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const ok = title.trim().length >= 3 && problem.trim().length >= 20 && solution.trim().length >= 20 && cat;

  const send = async () => {
    if (!ok) return;
    setBusy(true);
    await submitIdea({ userId: profile.id, name: profile.name, title: title.trim(), problem: problem.trim(), solution: solution.trim(), audience: who.trim(), category: cat! });
    setBusy(false);
    setSent(true);
    toast('Fikrin bize ulaştı', 'bulb');
  };

  if (sent) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={22} color={colors.text} /></Pressable>
        <Card gradient={gradients.gold} style={{ marginTop: space.xl }}>
          <AppText variant="display" color={colors.white}>Teşekkürler!</AppText>
          <AppText variant="body" color="rgba(255,255,255,0.9)" style={{ marginTop: 8 }}>
            Fikrin değerlendirme sırasına girdi. Uygun bulunursa seninle iletişime geçer, ücretsiz kodlar ve "{profile.name}" adıyla yayınlarız.
          </AppText>
        </Card>
        <AppText variant="small" muted style={{ marginTop: 16 }}>Değerlendirme ölçütleri: odyolojiye fayda, özgünlük, uygulanabilirlik, kaç kişinin işine yarayacağı.</AppText>
        <Button title="Kapat" onPress={() => router.back()} style={{ marginTop: space.xl }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={22} color={colors.text} /></Pressable>
      <AppText variant="tiny" color={colors.amber}>Yapımcı Ol</AppText>
      <AppText variant="h1" style={{ marginTop: 4 }}>Aklındaki yazılım fikri çürüyüp gitmesin</AppText>
      <AppText variant="body" muted style={{ marginTop: 6 }}>
        Sen bize başvur, biz değerlendirelim. Uygunsa hayalini ücretsiz kodlayıp aihearX içinde senin adınla, yapımcı olarak yayınlayalım.
      </AppText>

      <Card style={{ marginTop: space.xl, gap: 14 }}>
        <Field label="Fikrin adı" value={title} onChange={setTitle} placeholder="Örn. Vestibüler Egzersiz Koçu" />
        <Field label="Hangi sorunu çözüyor?" value={problem} onChange={setProblem} placeholder="Kim, ne zaman, neden zorlanıyor?" multiline />
        <Field label="Nasıl çözüyor?" value={solution} onChange={setSolution} placeholder="Uygulama ne yapacak? 3-5 cümle yeter." multiline />
        <Field label="Kimler kullanır?" value={who} onChange={setWho} placeholder="Odyologlar, öğrenciler, hastalar..." />
        <View>
          <AppText variant="tiny" faint style={{ marginBottom: 8 }}>Kategori</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => <Chip key={c.id} label={c.short} icon={c.icon} active={cat === c.id} color={c.gradient[0]} onPress={() => setCat(c.id)} />)}
          </View>
        </View>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <AppText variant="h3">Söz veriyoruz</AppText>
        <AppText variant="small" muted style={{ marginTop: 6 }}>• Fikrin sana ait kalır; yapımcı olarak adın her ekranda görünür.{'\n'}• Kodlama ücretsizdir, senden para istenmez.{'\n'}• 30 gün içinde yanıt alırsın.</AppText>
      </Card>

      <Button title="Başvuruyu Gönder" icon="paper-plane" size="lg" gradient={gradients.gold} disabled={!ok} loading={busy} onPress={send} style={{ marginTop: space.xl }} />
    </Screen>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (s: string) => void; placeholder: string; multiline?: boolean }) {
  return (
    <View>
      <AppText variant="tiny" faint style={{ marginBottom: 6 }}>{label}</AppText>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textFaint} multiline={multiline} style={[styles.input, multiline && { minHeight: 84, textAlignVertical: 'top' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  close: { alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  input: { backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, color: colors.text, fontSize: 15 },
});
