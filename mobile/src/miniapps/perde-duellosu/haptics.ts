import * as Haptics from 'expo-haptics';
import { useSettings } from '@/core/store/settings';

const on = () => useSettings.getState().haptics;
export const tapHaptic = () => { if (on()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); };
export const goodHaptic = () => { if (on()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };
export const badHaptic = () => { if (on()) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); };
