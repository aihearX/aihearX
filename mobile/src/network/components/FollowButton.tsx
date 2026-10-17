import React from 'react';
import * as Haptics from 'expo-haptics';
import { Button, useToast } from '@/core/ui';
import { useSettings } from '@/core/store/settings';
import { useUser } from '@/core/store/user';
import { useNetwork } from '../store';
import { pushFollow } from '../api';

/** Takip Et / Takiptesin: kalıcı; arkadaş akışını etkiler. */
export function FollowButton({ userId, size = 'sm', full, name }: { userId: string; size?: 'sm' | 'md'; full?: boolean; name?: string }) {
  const following = useNetwork((s) => s.following.includes(userId));
  const toggle = useNetwork((s) => s.toggleFollow);
  const haptics = useSettings((s) => s.haptics);
  const me = useUser((s) => s.profile?.id);
  const toast = useToast((s) => s.show);
  if (me === userId) return null;
  const onPress = () => {
    const next = toggle(userId);
    if (haptics) Haptics.impactAsync(next ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (next) toast(name ? `${name} takip ediliyor` : 'Takip ediliyor', 'person-add');
    if (me) pushFollow(me, userId, next).catch(() => {});
  };
  return <Button title={following ? 'Takiptesin' : 'Takip et'} icon={following ? 'checkmark' : 'person-add'} variant={following ? 'secondary' : 'primary'} size={size} onPress={onPress} haptic={false} full={full} />;
}
