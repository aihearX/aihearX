import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProfileScreen } from '@/network/ProfileScreen';
export default function Kullanici() { const { id } = useLocalSearchParams<{ id: string }>(); return <ProfileScreen userId={id} />; }
