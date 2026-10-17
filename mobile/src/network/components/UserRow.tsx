import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Avatar, Card } from '@/core/ui';
import { colors } from '@/core/theme';
import { roleName } from '@/core/registry/roles';
import type { NetUser } from '../types';
import { FollowButton } from './FollowButton';

export const openUser = (id: string) => router.push({ pathname: '/kullanici/[id]', params: { id } });

/** Dizin ve öneri listelerinde kullanıcı satırı. */
export function UserRow({ user, compact }: { user: NetUser; compact?: boolean }) {
  return (
    <Card padded={false} style={styles.row}>
      <Pressable onPress={() => openUser(user.id)} style={styles.main}>
        <Avatar name={user.name} seed={user.id} size={compact ? 40 : 48} ring={user.verified} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <AppText variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{user.name}</AppText>
            {user.verified ? <Ionicons name="checkmark-circle" size={15} color={colors.accent2} /> : null}
          </View>
          <AppText variant="small" muted numberOfLines={1}>{roleName(user.role)}{user.university ? ` · ${user.university}` : ''}</AppText>
          {!compact ? <AppText variant="tiny" faint numberOfLines={1}>{[user.city, `${user.followers} takipçi`].filter(Boolean).join(' · ')}</AppText> : null}
        </View>
      </Pressable>
      <FollowButton userId={user.id} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
