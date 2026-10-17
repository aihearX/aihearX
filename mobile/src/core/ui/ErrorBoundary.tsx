import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, space } from '@/core/theme';

type Props = { children: React.ReactNode; title?: string; onReset?: () => void };
type State = { error: Error | null; info: string };

/**
 * Mini uygulama çökerse kırmızı ekran yerine okunabilir bir kart.
 * Kullanıcı hata metnini kopyalayıp gönderebilir; "Tekrar dene" bileşeni yeniden kurar.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, info: '' };
  static getDerivedStateFromError(error: Error): Partial<State> { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { this.setState({ info: info.componentStack ?? '' }); }
  reset = () => { this.setState({ error: null, info: '' }); this.props.onReset?.(); };
  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;
    const text = `${this.props.title ?? 'Uygulama'}\n${error.name}: ${error.message}\n${(error.stack ?? '').split('\n').slice(0, 8).join('\n')}\n${info.split('\n').slice(0, 6).join('\n')}`;
    return (
      <ScrollView contentContainerStyle={styles.wrap}>
        <AppText variant="h2">Bir şeyler ters gitti</AppText>
        <AppText variant="body" muted style={{ marginTop: 6 }}>Bu uygulama bu cihazda hata verdi. Aşağıdaki metni kopyalayıp bize gönderirsen hızlıca düzeltiriz.</AppText>
        <View style={styles.box}><AppText variant="mono" style={{ fontSize: 12 }}>{text}</AppText></View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: space.lg }}>
          <Button title="Hata metnini kopyala" icon="copy" variant="secondary" onPress={() => { Clipboard.setStringAsync(text).catch(() => {}); }} style={{ flex: 1 }} />
          <Button title="Tekrar dene" icon="refresh" onPress={this.reset} />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { padding: space.lg, paddingBottom: 48 },
  box: { marginTop: space.lg, padding: 12, borderRadius: radius.md, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border },
});
