import React from 'react';
import { Screen, AppText } from '@/core/ui';
export function ProfileScreen({ userId }: { userId: string }) { return <Screen><AppText variant="h1">Profil</AppText><AppText muted>{userId}</AppText></Screen>; }
