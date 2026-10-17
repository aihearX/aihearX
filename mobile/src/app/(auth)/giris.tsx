import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, AppText, Button, Card, useToast } from '@/core/ui';
import { colors, gradients, radius, space } from '@/core/theme';
import { signInWithApple, signInWithEmail } from '@/core/auth/actions';
import { useUser } from '@/core/store/user';
import { CochleaMark } from '@/core/ui/CochleaMark';

export default function Giris() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast((s) => s.show);
  const guest = useUser((s) => s.signInGuest);

  const apple = async () => {
    setBusy(true);
    const r = await signInWithApple();
    setBusy(false);
    if (r === 'error') toast('Apple ile giriş başarısız', 'alert-circle');
  };
  const mail = async () => {
    if (!email.includes('@')) return toast('Geçerli bir e-posta yaz', 'mail');
    setBusy(true);
    const r = await signInWithEmail(email.trim());
    setBusy(false);
    if (r === 'sent') toast('Giriş bağlantısı e-postana gönderildi', 'mail');
    if (r === 'error') toast('E-posta gönderilemedi', 'alert-circle');
  };

  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
      <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center', marginBottom: space.xxl }}>
        <CochleaMark size={96} />
        <AppText variant="display" style={{ marginTop: space.lg }}>aihear<AppText variant="display" color={colors.accent2}>X</AppText></AppText>
        <AppText variant="body" muted center style={{ marginTop: 6, maxWidth: 300 }}>
          Odyolojinin tamamı tek uygulamada. Öğren, oyna, yarış, bağlan.
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <Card>
          <AppText variant="tiny" faint style={{ marginBottom: 10 }}>Tek üyelik, tüm uygulamalar</AppText>
          {Platform.OS === 'ios' ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={14}
              style={{ width: '100%', height: 50 }}
              onPress={apple}
            />
          ) : null}
          <View style={styles.or}><View style={styles.line} /><AppText variant="tiny" faint>veya e-posta ile</AppText><View style={styles.line} /></View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@eposta.com"
            placeholderTextColor={colors.textFaint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Button title="Bağlantı Gönder" icon="mail" onPress={mail} loading={busy} style={{ marginTop: 10 }} />
          <Button title="Önce bir bakayım" variant="ghost" size="sm" onPress={() => guest()} style={{ marginTop: 6 }} />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginTop: space.xl }}>
        <LinearGradient colors={[...gradients.night]} style={styles.note}>
          <AppText variant="small" muted center>
            Devam ederek Kullanım Şartları'nı ve Gizlilik Politikası'nı kabul etmiş olursun. Sağlık verilerin yalnızca senin izninle paylaşılır.
          </AppText>
        </LinearGradient>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  or: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  input: { backgroundColor: colors.bg2, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, height: 48, color: colors.text, fontSize: 15 },
  note: { padding: 14, borderRadius: radius.md },
});
