import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/core/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { position: 'absolute', borderTopColor: colors.border, backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg, height: 84, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarBackground: () => (Platform.OS === 'ios' ? <BlurView tint="light" intensity={70} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.82)' }} /> : null),
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Keşfet', tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={String(color ?? colors.textFaint)} size={size} /> }} />
      <Tabs.Screen name="akis" options={{ title: 'Ağ', tabBarIcon: ({ color, size }) => <Ionicons name="people" color={String(color ?? colors.textFaint)} size={size} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Ben', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={String(color ?? colors.textFaint)} size={size} /> }} />
    </Tabs>
  );
}
