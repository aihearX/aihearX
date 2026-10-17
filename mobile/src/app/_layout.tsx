import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { colors } from '@/core/theme';
import { ToastHost } from '@/core/ui';
import { useUser } from '@/core/store/user';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useUser((s) => s.hydrated);
  const profile = useUser((s) => s.profile);
  const onboarded = useUser((s) => s.onboarded);
  const signedIn = profile != null;

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade_from_bottom' }}>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)/giris" />
          </Stack.Protected>
          <Stack.Protected guard={signedIn && !onboarded}>
            <Stack.Screen name="(auth)/rol" />
          </Stack.Protected>
          <Stack.Protected guard={signedIn && onboarded}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="uygulama/[id]/index" />
            <Stack.Screen name="uygulama/[id]/calistir" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
            <Stack.Screen name="yapimci-ol" options={{ presentation: 'modal' }} />
            <Stack.Screen name="kullanici/[id]" />
            <Stack.Screen name="gonderi/yeni" options={{ presentation: 'modal' }} />
            <Stack.Screen name="ayarlar" />
            <Stack.Screen name="ag/dizin" />
            <Stack.Screen name="ag/ilanlar" />
            <Stack.Screen name="ag/etkinlikler" />
          </Stack.Protected>
        </Stack>
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
