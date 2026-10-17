/**
 * Duman testi: tüm mini uygulamalar yüklenir ve ilk ekranları çökmeden render olur.
 * Cihazda görülen "açılmıyor" hatalarının çoğunu (modül seviyesinde hata, eksik import, yanlış prop) burada yakalarız.
 */
import React from 'react';
import { act, create } from 'react-test-renderer';
import { describe, it, expect, jest } from '@jest/globals';
import { MINIAPPS } from '@/miniapps';
import { CATEGORIES } from '@/core/registry';

jest.mock('expo-audio', () => ({
  createAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), remove: jest.fn(), addListener: () => ({ remove: jest.fn() }), volume: 1 }),
  setAudioModeAsync: jest.fn(async () => {}),
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn() }),
  useAudioRecorder: () => ({ record: jest.fn(), stop: jest.fn(async () => {}), prepareToRecordAsync: jest.fn(async () => {}) }),
  useAudioRecorderState: () => ({ isRecording: false, durationMillis: 0, metering: undefined }),
  requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  RecordingPresets: { HIGH_QUALITY: {} },
}));
jest.mock('expo-file-system', () => ({ File: class { uri = 'file://x'; write = jest.fn(async () => {}); delete = jest.fn(); }, Paths: { cache: {} } }));
jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn(async () => {}), getAvailableVoicesAsync: jest.fn(async () => []) }));
jest.mock('expo-haptics', () => ({ impactAsync: jest.fn(async () => {}), notificationAsync: jest.fn(async () => {}), selectionAsync: jest.fn(async () => {}), ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' }, NotificationFeedbackType: { Success: 'success', Error: 'error', Warning: 'warning' } }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => {}) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false), shareAsync: jest.fn(async () => {}) }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(async () => 'file://shot.png') }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() }, useLocalSearchParams: () => ({}), Link: () => null }));

describe('mini uygulama kaydı', () => {
  it('10 uygulama, benzersiz id, geçerli kategori', () => {
    expect(MINIAPPS.length).toBe(10);
    const ids = new Set(MINIAPPS.map((a) => a.id));
    expect(ids.size).toBe(10);
    const cats = new Set(CATEGORIES.map((c) => c.id));
    for (const a of MINIAPPS) expect(cats.has(a.category)).toBe(true);
  });
});

describe.each(MINIAPPS.map((a) => [a.id, a] as const))('%s', (_id, app) => {
  it('ilk ekranı çökmeden render eder', async () => {
    const Component = app.component;
    let tree: ReturnType<typeof create> | undefined;
    await act(async () => {
      tree = create(<Component onResult={() => {}} role="odyolog" />);
    });
    expect(tree!.toJSON()).toBeTruthy();
    await act(async () => { tree!.unmount(); });
  });
});
