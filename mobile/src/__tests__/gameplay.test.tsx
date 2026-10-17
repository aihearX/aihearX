/**
 * Oynanış testi: beş kulak oyunu (React Native ekranları) baştan sona "oynanır".
 * Butonlara basılır, sahte zamanlayıcı ilerletilir, doğru ve yanlış cevaplar verilir,
 * sonuç ekranı görülene kadar devam edilir. Hiç console.error / act uyarısı olmamalı,
 * onResult tam bir kez çağrılmalı.
 */
import React from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import SesDedektifi from '@/miniapps/ses-dedektifi/App';
import { renderSound } from '@/miniapps/ses-dedektifi/sounds';
import { OptionGrid } from '@/miniapps/ses-dedektifi/components/OptionGrid';
import { useDedektifStore } from '@/miniapps/ses-dedektifi/store';
import TonHafizasi from '@/miniapps/ton-hafizasi/App';
import { PadGrid } from '@/miniapps/ton-hafizasi/components/PadGrid';
import { dailySong, padSeqFor, padsFor, phraseSpans, songAt } from '@/miniapps/ton-hafizasi/logic';
import { useTonStore } from '@/miniapps/ton-hafizasi/store';
import type { Song } from '@/miniapps/ton-hafizasi/songs';
import PerdeDuellosu from '@/miniapps/perde-duellosu/App';
import { makeTrial, type Trial as PairTrial } from '@/miniapps/perde-duellosu/logic';
import GurultuAvcisi from '@/miniapps/gurultu-avcisi/App';
import { makeTriplets } from '@/miniapps/gurultu-avcisi/logic';
import { useGurultuStore } from '@/miniapps/gurultu-avcisi/store';
import KulaginKacYasinda from '@/miniapps/kulagin-kac-yasinda/App';
import { buildTrials, type Trial as EarTrial } from '@/miniapps/kulagin-kac-yasinda/data';
import { useEarAgeStore } from '@/miniapps/kulagin-kac-yasinda/store';
import type { MiniAppProps } from '@/core/registry/types';

// ---------- Modül sahteleri (smoke testiyle aynı, ses daha gerçekçi; babel-jest jest.mock'u importların üstüne taşır) ----------
type StatusCb = (s: { didJustFinish: boolean; playing: boolean }) => void;
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => {
    let cb: StatusCb | null = null;
    return {
      volume: 1,
      play: jest.fn(() => { setTimeout(() => cb?.({ didJustFinish: true, playing: false }), 50); }),
      pause: jest.fn(),
      remove: jest.fn(),
      addListener: jest.fn((_ev: string, fn: StatusCb) => { cb = fn; return { remove: jest.fn(() => { cb = null; }) }; }),
    };
  }),
  setAudioModeAsync: jest.fn(async () => {}),
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn() }),
  useAudioRecorder: () => ({ record: jest.fn(), stop: jest.fn(async () => {}), prepareToRecordAsync: jest.fn(async () => {}) }),
  useAudioRecorderState: () => ({ isRecording: false, durationMillis: 0, metering: undefined }),
  requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  RecordingPresets: { HIGH_QUALITY: {} },
}));
jest.mock('expo-file-system', () => ({ File: class { uri = 'file://x.wav'; write = jest.fn(async () => {}); delete = jest.fn(); }, Paths: { cache: {} } }));
jest.mock('expo-speech', () => ({
  // Konuşma 300 ms sonra biter; cihazdaki onDone akışını taklit eder.
  speak: jest.fn((_text: string, opts?: { onDone?: () => void }) => { setTimeout(() => opts?.onDone?.(), 300); }),
  stop: jest.fn(async () => {}),
  getAvailableVoicesAsync: jest.fn(async () => []),
  VoiceQuality: { Default: 'Default', Enhanced: 'Enhanced' },
}));
jest.mock('expo-haptics', () => ({ impactAsync: jest.fn(async () => {}), notificationAsync: jest.fn(async () => {}), selectionAsync: jest.fn(async () => {}), ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' }, NotificationFeedbackType: { Success: 'success', Error: 'error', Warning: 'warning' } }));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => {}) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false), shareAsync: jest.fn(async () => {}) }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(async () => 'file://shot.png') }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() }, useLocalSearchParams: () => ({}), Link: () => null }));
// Ikon fontu yüklenince act dışında setState yapar (createIconSet); oyunla ilgisi yok, ikon çizilmez.
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

// Doğru cevabı öğrenmek için oyunların saf fonksiyonlarını izleriz (davranış değişmez).
jest.mock('@/miniapps/ses-dedektifi/sounds', () => {
  const actual = jest.requireActual<typeof import('@/miniapps/ses-dedektifi/sounds')>('@/miniapps/ses-dedektifi/sounds');
  return { ...actual, renderSound: jest.fn(actual.renderSound) };
});
jest.mock('@/miniapps/perde-duellosu/logic', () => {
  const actual = jest.requireActual<typeof import('@/miniapps/perde-duellosu/logic')>('@/miniapps/perde-duellosu/logic');
  return { ...actual, makeTrial: jest.fn(actual.makeTrial) };
});
jest.mock('@/miniapps/gurultu-avcisi/logic', () => {
  const actual = jest.requireActual<typeof import('@/miniapps/gurultu-avcisi/logic')>('@/miniapps/gurultu-avcisi/logic');
  return { ...actual, makeTriplets: jest.fn(actual.makeTriplets) };
});
jest.mock('@/miniapps/kulagin-kac-yasinda/data', () => {
  const actual = jest.requireActual<typeof import('@/miniapps/kulagin-kac-yasinda/data')>('@/miniapps/kulagin-kac-yasinda/data');
  return { ...actual, buildTrials: jest.fn(actual.buildTrials) };
});

jest.setTimeout(180_000);

// ---------- Yardımcılar ----------
type Matcher = string | RegExp;
const matches = (text: string, m: Matcher) => (typeof m === 'string' ? text === m : m.test(text));

/** Bir düğümün altındaki tüm metni birleştirir. */
function flatText(node: ReactTestInstance): string {
  return node.children.map((c) => (typeof c === 'string' ? c : flatText(c))).join('');
}
const isHostText = (n: ReactTestInstance) => (n.type as unknown) === 'Text';

function hasText(root: ReactTestInstance, m: Matcher): boolean {
  return root.findAll((n) => isHostText(n) && matches(flatText(n), m)).length > 0;
}

/** Metni m ile eşleşen Text'in en yakın onPress/onPressIn sahibi atası (Pressable). */
function findPressables(root: ReactTestInstance, m: Matcher): ReactTestInstance[] {
  const out: ReactTestInstance[] = [];
  for (const t of root.findAll((n) => isHostText(n) && matches(flatText(n), m))) {
    let p: ReactTestInstance | null = t.parent;
    while (p) {
      if (typeof p.props.onPress === 'function' || typeof p.props.onPressIn === 'function') { if (!out.includes(p)) out.push(p); break; }
      p = p.parent;
    }
  }
  return out;
}
function findPressableByLabel(root: ReactTestInstance, label: string): ReactTestInstance | null {
  const all = root.findAll((n) => n.props.accessibilityLabel === label && (typeof n.props.onPress === 'function' || typeof n.props.onPressIn === 'function'));
  return all[0] ?? null;
}
const enabled = (p: ReactTestInstance | null | undefined) => !!p && !p.props.disabled;
/** Sahte fonksiyonun son dönüş değeri (jest tipi `unknown` verir). */
const lastReturn = <T,>(m: { mock: { results: { value: unknown }[] } }): T => m.mock.results.at(-1)!.value as T;

async function tap(p: ReactTestInstance | null | undefined, what: string) {
  if (!p) throw new Error(`Buton bulunamadı: ${what}`);
  if (p.props.disabled) throw new Error(`Buton devre dışı: ${what}`);
  const fn = (p.props.onPress ?? p.props.onPressIn) as () => void;
  await act(async () => { fn(); });
}
async function press(root: ReactTestInstance, m: Matcher, index = 0) {
  await tap(findPressables(root, m)[index], String(m));
}

/** Sahte zamanı küçük adımlarla ilerletir; her adımda sözler (promise) de akar. */
async function run(ms: number, onStep?: () => void, step = 50) {
  let left = ms;
  while (left > 0) {
    const d = Math.min(step, left);
    await act(async () => {
      jest.advanceTimersByTime(d);
      // zamanlayıcıdan doğan söz zincirleri (await playSignal → setState) act kapsamı içinde aksın
      for (let i = 0; i < 12; i++) await Promise.resolve();
    });
    onStep?.();
    left -= d;
  }
}
/** Koşul sağlanana dek ilerler (en çok maxMs); sağlanmazsa hata. */
async function until(cond: () => boolean, maxMs: number, label: string, onStep?: () => void) {
  await act(async () => {});
  let t = 0;
  while (!cond()) {
    if (t >= maxMs) throw new Error(`Zaman aşımı (${maxMs} ms): ${label}`);
    await run(50, onStep);
    t += 50;
  }
}

const mounted: ReactTestRenderer[] = [];
function mount(Component: React.ComponentType<MiniAppProps>) {
  const onResult = jest.fn();
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<Component onResult={onResult} role="odyolog" />); });
  mounted.push(tree);
  const unmount = async () => { await act(async () => { tree.unmount(); }); mounted.splice(mounted.indexOf(tree), 1); };
  return { tree, root: tree.root, onResult, unmount };
}

// ---------- console gözetimi ----------
const ALLOWED_WARN = [/\[Reanimated\]/];
let errors: string[] = [];
let warns: string[] = [];
let spies: { mockRestore: () => void }[] = [];

beforeEach(() => {
  jest.useFakeTimers();
  errors = [];
  warns = [];
  spies = [
    jest.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { errors.push(a.map(String).join(' ')); }),
    jest.spyOn(console, 'warn').mockImplementation((...a: unknown[]) => { const s = a.map(String).join(' '); if (!ALLOWED_WARN.some((r) => r.test(s))) warns.push(s); }),
  ];
  // Kayıtlar her testte temiz başlasın (günlük kilidi vs. etkilemesin)
  useDedektifStore.setState({ best: 0, highLevel: 0, gamesPlayed: 0, daily: {} });
  useTonStore.setState({ bestRound: 0, bestScore: 0, bestLevel: 0, games: 0, songsDone: 0, songCursor: 0, daily: null });
  useGurultuStore.setState({ best: 0, games: 0, bestStep: 0, bestSnrDb: null, daily: {} });
  useEarAgeStore.setState({ history: [], warble: false });
});
afterEach(async () => {
  // Başarısız testten kalan ağaçlar sökülsün; yoksa store sıfırlama act dışı güncelleme üretir.
  for (const t of mounted.splice(0)) await act(async () => { t.unmount(); });
  await act(async () => { jest.runOnlyPendingTimers(); });
  jest.useRealTimers();
  // Not: jest.restoreAllMocks() Jest 29'da jest.fn(impl) uygulamalarını da siler; yalnızca casusları geri al.
  spies.forEach((s) => s.mockRestore());
  expect(errors).toEqual([]);
  expect(warns).toEqual([]);
});

// =====================================================================
describe('Ses Dedektifi', () => {
  const sound = () => jest.mocked(renderSound).mock.calls.at(-1)![0];
  const grid = (root: ReactTestInstance) => root.findAllByType(OptionGrid)[0] ?? null;
  const roundKey = (root: ReactTestInstance) => grid(root)?.props.roundKey ?? -1;
  const resultShown = (root: ReactTestInstance) => hasText(root, 'Tekrar Oyna');

  async function waitRound(root: ReactTestInstance, prev: number) {
    await until(() => resultShown(root) || roundKey(root) > prev, 15_000, 'yeni tur');
  }

  it('Günün Serisi: 10 tur, doğru/yanlış/süre dolumu/tekrar dinle → sonuç, onResult bir kez', async () => {
    const { root, onResult, unmount } = mount(SesDedektifi);
    expect(hasText(root, 'Ses Dedektifi')).toBe(true);
    await press(root, 'Günün Serisi');
    await press(root, 'Oyna');
    // 3-2-1 geri sayım + ilk tur
    await until(() => roundKey(root) === 1, 6000, 'ilk tur');
    expect(hasText(root, /^Seviye 1/)).toBe(true);

    for (let round = 1; round <= 10 && !resultShown(root); round++) {
      expect(roundKey(root)).toBe(round);
      const correct = sound();
      const wrong = grid(root)!.props.options.find((o: { id: string }) => o.id !== correct.id)!;
      if (round === 2) {
        // klip bitsin, "Tekrar dinle" aktif olsun
        await until(() => hasText(root, 'Bu ne sesi?'), 5000, 'klip bitti');
        await press(root, /^Tekrar dinle/);
        await until(() => hasText(root, 'Bu ne sesi?'), 5000, 'tekrar bitti');
        await press(root, correct.name);
      } else if (round === 3) {
        // cevap verme: süre dolsun
        await until(() => hasText(root, 'Süre doldu'), 15_000, 'süre doldu');
      } else if (round === 4) {
        await run(300);
        await press(root, wrong.name);
        expect(hasText(root, 'Yanlış')).toBe(true);
      } else {
        await run(300);
        await press(root, correct.name);
        expect(hasText(root, 'Doğru!')).toBe(true);
      }
      await waitRound(root, round);
    }
    expect(resultShown(root)).toBe(true);
    expect(hasText(root, /Günün Serisi tamamlandı/)).toBe(true);
    expect(onResult).toHaveBeenCalledTimes(1);
    const r = onResult.mock.calls[0]![0] as { score: number; label: string; xp: number };
    expect(r.score).toBeGreaterThan(0);
    expect(r.xp).toBe(40);
    expect(useDedektifStore.getState().gamesPlayed).toBe(1);

    // Günlük bitti → Tekrar Oyna giriş ekranına (serbest moda) döner
    await press(root, 'Tekrar Oyna');
    expect(hasText(root, 'Bugünkü seri oynandı')).toBe(false);
    expect(hasText(root, 'Oyna')).toBe(true);
    await unmount();
  });

  it('Serbest: hep yanlış → 3 can biter → sonuç; Ana ekran', async () => {
    const { root, onResult, unmount } = mount(SesDedektifi);
    await press(root, 'Serbest');
    await press(root, 'Oyna');
    await until(() => roundKey(root) === 1, 6000, 'ilk tur');
    let round = 1;
    while (!resultShown(root)) {
      const correct = sound();
      const wrong = grid(root)!.props.options.find((o: { id: string }) => o.id !== correct.id)!;
      await run(200);
      await press(root, wrong.name);
      await waitRound(root, round);
      round++;
      if (round > 6) throw new Error('3 yanlışta bitmeliydi');
    }
    expect(round).toBe(4);
    expect(onResult).toHaveBeenCalledTimes(1);
    await press(root, 'Ana ekran');
    expect(hasText(root, 'Oyna')).toBe(true);
    await unmount();
  });

  it('oyun ortasında unmount: zamanlayıcı/ses kalıntısı hata üretmez', async () => {
    const { root, unmount } = mount(SesDedektifi);
    await press(root, 'Serbest');
    await press(root, 'Oyna');
    await until(() => roundKey(root) === 1, 6000, 'ilk tur');
    await run(100);
    await unmount();
    await run(5000);
  });
});

// =====================================================================
describe('Ton Hafızası', () => {
  const grid = (root: ReactTestInstance) => root.findAllByType(PadGrid)[0] ?? null;
  const padsEnabled = (root: ReactTestInstance) => !!grid(root)?.props.enabled;
  const resultShown = (root: ReactTestInstance) => hasText(root, 'Tekrar Oyna');
  const revealShown = (root: ReactTestInstance) => hasText(root, /^(Bir cümle çaldın|Şarkıyı tamamladın)/);

  /** Pad'lerin yanış sırasını kaydederek "sıra sende" (ya da perde/sonuç) anını bekler. */
  async function listen(root: ReactTestInstance, tag = ''): Promise<number[]> {
    const seq: number[] = [];
    let last: number | null = null;
    // son dokunuşun 220 ms'lik ışığı sönsün; sonra diziyi kaydet
    await until(() => (grid(root)?.props.lit ?? null) === null, 2000, 'dokunuş ışığı');
    await until(() => resultShown(root) || revealShown(root) || padsEnabled(root), 90_000, `sıra sende ${tag}`, () => {
      const lit = grid(root)?.props.lit ?? null;
      if (lit !== null && lit !== last) seq.push(lit);
      last = lit;
    });
    return seq;
  }
  const tapPad = (root: ReactTestInstance, id: number) => press(root, (grid(root)!.props.pads as { name: string }[])[id]!.name);

  /** Bir şarkıyı cümle cümle çalar; ışıklı turlarda ışık sırası beklenen diziyle karşılaştırılır. */
  async function playSong(root: ReactTestInstance, song: Song, roundNo: { n: number }) {
    const pads = padsFor(song);
    const seq = padSeqFor(song, pads);
    const spans = phraseSpans(song);
    expect((grid(root)!.props.pads as { pitch: string }[]).map((p) => p.pitch)).toEqual(pads.map((p) => p.pitch));
    for (let ph = 0; ph < spans.length; ph++) {
      const span = spans[ph]!;
      for (let k = 1; k <= span.end - span.start; k++) {
        roundNo.n++;
        const lit = await listen(root, `cümle ${ph + 1} tur ${k} (genel tur ${roundNo.n})`);
        expect(padsEnabled(root)).toBe(true);
        const expected = seq.slice(span.start, span.start + k);
        if (!hasText(root, 'Sessiz')) expect(lit).toEqual(expected);
        else expect(lit).toEqual([]);
        for (const id of expected) await tapPad(root, id);
        expect(padsEnabled(root)).toBe(false);
      }
      await until(() => revealShown(root), 3000, `cümle ${ph + 1} perdesi`);
      const last = ph === spans.length - 1;
      if (!last) {
        expect(hasText(root, 'Bir cümle çaldın ♪')).toBe(true);
        await press(root, 'Bu ezgiyi tanıdın mı?');
        expect(hasText(root, song.title)).toBe(true);
        await run(1200); // ritimli çalım başlasın
        await press(root, 'Devam');
      } else {
        expect(hasText(root, 'Şarkıyı tamamladın! 🎉')).toBe(true);
        expect(hasText(root, song.title)).toBe(true);
      }
    }
  }

  it('Rastgele: 8 tur doğru, sessiz 9. turda 3 yanlış → sonuç, onResult bir kez', async () => {
    const { root, onResult, unmount } = mount(TonHafizasi);
    await press(root, 'Rastgele (klasik Simon)');
    for (let round = 1; round <= 8; round++) {
      const seq = await listen(root);
      expect(seq.length).toBe(round);
      expect(hasText(root, `${round}. tur`)).toBe(true);
      for (const n of seq) await tapPad(root, n);
      expect(padsEnabled(root)).toBe(false);
    }
    // 9. tur: seviye 5, sessiz → ışık yok; yanlış basarak 3 canı bitir
    let lives = 3;
    while (!resultShown(root)) {
      const seq = await listen(root);
      if (resultShown(root)) break;
      expect(seq).toEqual([]);
      expect(hasText(root, 'Sessiz')).toBe(true);
      const order: number[] = grid(root)!.props.order;
      let guard = 0;
      while (padsEnabled(root) && guard++ < 40) await tapPad(root, order[guard % order.length]!);
      expect(padsEnabled(root)).toBe(false);
      lives--;
      if (lives < 0) throw new Error('3 yanlışta bitmeliydi');
    }
    expect(onResult).toHaveBeenCalledTimes(1);
    const r = onResult.mock.calls[0]![0] as { score: number; meta: { rounds: number; mode: string } };
    expect(r.meta).toMatchObject({ rounds: 8, mode: 'random' });
    expect(r.score).toBeGreaterThan(0);
    expect(hasText(root, 'Rastgele')).toBe(true);
    await press(root, 'Ana ekran');
    expect(hasText(root, 'Gizli Ezgi · Oyna')).toBe(true);
    await unmount();
  });

  it('Gizli Ezgi: ilk şarkı baştan sona, ikinci şarkıda 3 yanlış → sonuç (1 şarkı tamam)', async () => {
    const { root, onResult, unmount } = mount(TonHafizasi);
    await press(root, 'Gizli Ezgi · Oyna');
    const roundNo = { n: 0 };
    await playSong(root, songAt(0), roundNo);
    await press(root, 'Sıradaki şarkı');
    // ikinci şarkı yüklendi, ilk turda bilerek yanlış bas
    const song2 = songAt(1);
    const seq2 = padSeqFor(song2, padsFor(song2));
    for (let life = 0; life < 3; life++) {
      await listen(root, `ikinci şarkı can ${life}`);
      expect(padsEnabled(root)).toBe(true);
      const wrong = (seq2[0]! + 1) % grid(root)!.props.pads.length;
      await tapPad(root, wrong);
      expect(padsEnabled(root)).toBe(false);
    }
    await until(() => resultShown(root), 3000, 'sonuç');
    expect(onResult).toHaveBeenCalledTimes(1);
    const r = onResult.mock.calls[0]![0] as { meta: { songsDone: number; mode: string; song: string } };
    expect(r.meta).toMatchObject({ songsDone: 1, mode: 'song', song: song2.id });
    expect(useTonStore.getState().songsDone).toBe(1);
    expect(useTonStore.getState().songCursor).toBe(2);
    expect(hasText(root, 'Gizli Ezgi')).toBe(true);
    await unmount();
  });

  it('Günün Ezgisi: şarkıyı tamamla → Sonucu gör → sonuç; günlük kilitlenir; Bırak', async () => {
    const { root, onResult, unmount } = mount(TonHafizasi);
    await press(root, 'Günün Ezgisi');
    await playSong(root, dailySong(), { n: 0 });
    await press(root, 'Sonucu gör');
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult.mock.calls[0]![0]).toMatchObject({ xp: 45, meta: { mode: 'daily' } });
    expect(hasText(root, /baştan sona çaldın/)).toBe(true);
    await press(root, 'Ana ekran');
    expect(enabled(findPressables(root, /^Günün ezgisi:/)[0])).toBe(false);
    // Rastgele başlat, ilk turu dinlerken Bırak
    await press(root, 'Rastgele (klasik Simon)');
    await run(3500);
    await press(root, 'Bırak');
    expect(hasText(root, 'Ton Hafızası')).toBe(true);
    expect(onResult).toHaveBeenCalledTimes(1);
    await unmount();
  });
});

// =====================================================================
describe('Perde Düellosu', () => {
  const trial = () => lastReturn<PairTrial>(jest.mocked(makeTrial));
  const zone = (root: ReactTestInstance, n: 1 | 2, i = 0) => findPressables(root, `${n}. ses`)[i];
  const canAnswer = (root: ReactTestInstance) => enabled(zone(root, 1));

  it('Solo: 6 doğru + 3 yanlış → can biter → sonuç, onResult bir kez', async () => {
    const { root, onResult, unmount } = mount(PerdeDuellosu);
    await press(root, /^Oyna/);
    expect(hasText(root, 'Dinle…')).toBe(true);
    for (let i = 0; i < 9; i++) {
      await until(() => canAnswer(root), 8000, `cevap ${i}`);
      expect(hasText(root, 'Hangisi daha tiz?')).toBe(true);
      const t = trial();
      const higher: 1 | 2 = t.higherFirst ? 1 : 2;
      const pick: 1 | 2 = i < 6 ? higher : higher === 1 ? 2 : 1;
      await tap(zone(root, pick), `${pick}. ses`);
      expect(canAnswer(root)).toBe(false);
    }
    await until(() => hasText(root, 'Tekrar Oyna'), 3000, 'sonuç');
    expect(onResult).toHaveBeenCalledTimes(1);
    const r = onResult.mock.calls[0]![0] as { score: number; meta: { trials: number; correct: number } };
    expect(r.meta).toMatchObject({ trials: 9, correct: 6 });
    expect(r.score).toBeGreaterThan(0);
    await unmount();
  });

  it('Solo: süre (60 sn) dolunca biter; Tekrar Oyna yeni oyun başlatır', async () => {
    const { root, onResult, unmount } = mount(PerdeDuellosu);
    await press(root, /^Oyna/);
    let answered = 0;
    await until(() => hasText(root, 'Tekrar Oyna'), 70_000, 'süre dolumu', () => {
      if (canAnswer(root)) {
        const t = trial();
        const n: 1 | 2 = t.higherFirst ? 1 : 2;
        const fn = zone(root, n)!.props.onPressIn as () => void;
        act(() => fn());
        answered++;
      }
    });
    expect(answered).toBeGreaterThan(10);
    expect(onResult).toHaveBeenCalledTimes(1);
    await press(root, 'Tekrar Oyna');
    expect(hasText(root, 'Dinle…')).toBe(true);
    await until(() => canAnswer(root), 8000, 'yeni oyun ilk ses');
    await press(root, 'Bırak');
    expect(hasText(root, 'Perde Düellosu')).toBe(true);
    expect(onResult).toHaveBeenCalledTimes(1);
    await unmount();
  });

  it('Düello: iki oyuncu, ilk 10 puan → kazanan, rövanş, Bırak', async () => {
    const { root, onResult, unmount } = mount(PerdeDuellosu);
    await press(root, /^Düello/);
    await press(root, /Başla$/);
    // üst yarı (b) önce gelir: zone(…, n, 0) = b, zone(…, n, 1) = a
    let rounds = 0;
    while (!hasText(root, /kazandı$/)) {
      await until(() => hasText(root, /kazandı$/) || canAnswer(root), 8000, 'düello cevap');
      if (hasText(root, /kazandı$/)) break;
      const t = trial();
      const higher: 1 | 2 = t.higherFirst ? 1 : 2;
      const lower: 1 | 2 = higher === 1 ? 2 : 1;
      if (rounds % 3 === 2) await tap(zone(root, lower, 0), 'b yanlış'); // b yanlış → a'ya puan
      else await tap(zone(root, higher, 1), 'a doğru');
      rounds++;
      if (rounds > 20) throw new Error('düello bitmedi');
    }
    expect(rounds).toBe(10);
    expect(hasText(root, 'Oyuncu 1 kazandı')).toBe(true);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult.mock.calls[0]![0]).toMatchObject({ score: 10, label: 'Düello' });
    await press(root, 'Rövanş');
    await until(() => canAnswer(root), 8000, 'rövanş ilk ses');
    await press(root, 'Bırak');
    expect(hasText(root, 'Perde Düellosu')).toBe(true);
    await unmount();
  });
});

// =====================================================================
describe('Gürültü Avcısı', () => {
  const triplets = () => lastReturn<number[][]>(jest.mocked(makeTriplets));
  const key = (root: ReactTestInstance, d: number) => findPressableByLabel(root, String(d));
  const canType = (root: ReactTestInstance) => enabled(key(root, 1));
  const resultShown = (root: ReactTestInstance) => hasText(root, 'Tekrar Oyna');

  async function enter(root: ReactTestInstance, digits: number[]) {
    for (const d of digits) await tap(key(root, d), `tuş ${d}`);
  }

  it('Serbest: 20 tur (2 yanlış, bir silme) → sonuç, onResult bir kez', async () => {
    const { root, onResult, unmount } = mount(GurultuAvcisi);
    await until(() => enabled(findPressables(root, 'Oyna')[0]), 3000, 'ses kontrolü');
    await press(root, 'Oyna');
    const tr = (await (async () => { await until(() => canType(root), 8000, 'ilk tur'); return triplets(); })());
    expect(tr.length).toBe(20);
    for (let round = 0; round < 20; round++) {
      await until(() => canType(root), 8000, `tur ${round + 1}`);
      expect(hasText(root, `${round + 1}/20`)).toBe(true);
      const target = tr[round]!;
      if (round === 0) {
        // yanlış tuş + sil
        await tap(key(root, (target[0]! + 1) % 10), 'yanlış tuş');
        await tap(findPressableByLabel(root, 'Sil'), 'Sil');
      }
      const wrong = round === 3 || round === 10;
      await enter(root, wrong ? target.map((d) => (d + 1) % 10) : target);
      expect(canType(root)).toBe(false);
      expect(hasText(root, wrong ? /^Doğrusu:/ : /Doğru!|kombo!/)).toBe(true);
    }
    await until(() => resultShown(root), 3000, 'sonuç');
    expect(onResult).toHaveBeenCalledTimes(1);
    const r = onResult.mock.calls[0]![0] as { score: number; xp: number };
    expect(r.xp).toBe(45);
    expect(r.score).toBeGreaterThan(0);
    expect(hasText(root, '18/20')).toBe(true);
    await press(root, 'Tekrar Oyna');
    expect(hasText(root, 'Oyna')).toBe(true);
    await unmount();
  });

  it('Günün Avı: üst üste 3 yanlış → erken biter; günlük kilitlenir', async () => {
    const { root, onResult, unmount } = mount(GurultuAvcisi);
    await until(() => enabled(findPressables(root, 'Günün Avı')[0]), 3000, 'ses kontrolü');
    await press(root, 'Günün Avı');
    await until(() => canType(root), 8000, 'ilk tur');
    const tr = triplets();
    for (let round = 0; round < 3; round++) {
      await until(() => canType(root), 8000, `tur ${round + 1}`);
      await enter(root, tr[round]!.map((d) => (d + 1) % 10));
    }
    await until(() => resultShown(root), 3000, 'sonuç');
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(hasText(root, /Günün avı tamamlandı/)).toBe(true);
    await press(root, 'Tekrar Oyna');
    expect(enabled(findPressables(root, /^Bugünün avı tamam/)[0])).toBe(false);
    await unmount();
  });

  it('oyun ortasında unmount hata üretmez', async () => {
    const { root, unmount } = mount(GurultuAvcisi);
    await until(() => enabled(findPressables(root, 'Oyna')[0]), 3000, 'ses kontrolü');
    await press(root, 'Oyna');
    await until(() => canType(root), 8000, 'ilk tur');
    await unmount();
    await run(8000);
  });
});

// =====================================================================
describe('Kulağın Kaç Yaşında', () => {
  const trials = () => lastReturn<EarTrial[]>(jest.mocked(buildTrials));
  const canAnswer = (root: ReactTestInstance) => enabled(findPressables(root, 'Duydum')[0]);

  it('kulaklık kontrolü → ses rehberi → test (tuzak, tekrar, dürüstlük) → sonuç → tekrar', async () => {
    const { root, onResult, unmount } = mount(KulaginKacYasinda);
    await press(root, 'Başlayalım');
    expect(hasText(root, 'Kulaklık kontrolü')).toBe(true);
    expect(enabled(findPressables(root, 'Devam')[0])).toBe(false);
    await press(root, 'Çal', 0);
    await until(() => enabled(findPressables(root, 'Çal')[1]), 3000, 'sol kulak sesi bitti');
    await press(root, 'Çal', 1);
    await until(() => enabled(findPressables(root, 'Çal')[0]), 3000, 'sağ kulak sesi bitti');
    await press(root, 'Bu taraftan duydum', 0);
    await press(root, 'Bu taraftan duydum', 0);
    expect(root.findAll((n) => isHostText(n) && flatText(n) === 'Onaylandı').length).toBe(2);
    await press(root, 'Devam');
    expect(hasText(root, 'Telefon sesini yarıya al')).toBe(true);
    await press(root, 'Dalgalı ton');
    expect(useEarAgeStore.getState().warble).toBe(true);
    await press(root, 'Yarıya aldım, başla');

    const tr = trials();
    expect(tr.filter((t) => t.kind === 'catch').length).toBe(2);
    let catchSeen = 0;
    let answered = 0;
    for (let i = 0; i < tr.length; i++) {
      await until(() => hasText(root, 'Tekrar oyna') || canAnswer(root), 6000, `deneme ${i}`);
      if (hasText(root, 'Tekrar oyna')) break;
      expect(hasText(root, 'Duydun mu?')).toBe(true);
      const t = tr[i]!;
      if (i === 0) {
        await press(root, 'Tekrar çal (1 hak)');
        expect(hasText(root, 'Dinle...')).toBe(true);
        await until(() => canAnswer(root), 6000, 'tekrar bitti');
        expect(hasText(root, 'Tekrar hakkı bitti')).toBe(true);
      }
      if (t.kind === 'catch') {
        catchSeen++;
        if (catchSeen === 1) {
          await press(root, 'Duydum');
          expect(hasText(root, /^Dürüst ol/)).toBe(true);
          await press(root, 'Tamam');
          expect(hasText(root, /^Dürüst ol/)).toBe(false);
        } else {
          await press(root, 'Duymadım');
        }
      } else {
        await press(root, t.freq >= 12000 ? 'Duydum' : 'Duymadım');
      }
      answered++;
    }
    await until(() => hasText(root, 'Tekrar oyna'), 3000, 'sonuç');
    expect(answered).toBeGreaterThanOrEqual(5);
    expect(onResult).toHaveBeenCalledTimes(1);
    const r = onResult.mock.calls[0]![0] as { score: number; label: string; meta: { highestHeard: number; lowConfidence: boolean } };
    expect(r.meta.highestHeard).toBe(17000);
    expect(r.meta.lowConfidence).toBe(true);
    expect(r.label).toBe('18 yaş');
    expect(hasText(root, /Düşük güven/)).toBe(true);
    expect(useEarAgeStore.getState().history.length).toBe(1);
    await run(1500); // sayaç animasyonu
    await press(root, 'Arkadaşına meydan oku');
    await press(root, 'Tekrar oyna');
    expect(hasText(root, 'Başlayalım')).toBe(true);
    expect(hasText(root, /Son sonucun: 18 yaş/)).toBe(true);
    await unmount();
  });

  it('kulaklıksız: tüm tonlara Duymadım → 60+ sonucu; oyun ortasında unmount sorunsuz', async () => {
    const { root, onResult, unmount } = mount(KulaginKacYasinda);
    await press(root, 'Başlayalım');
    await press(root, 'Kulaklığım yok, yine de dene');
    await press(root, 'Yarıya aldım, başla');
    const tr = trials();
    for (let i = 0; i < tr.length; i++) {
      await until(() => canAnswer(root), 6000, `deneme ${i}`);
      await press(root, 'Duymadım');
    }
    await until(() => hasText(root, 'Tekrar oyna'), 3000, 'sonuç');
    expect(onResult).toHaveBeenCalledTimes(1);
    expect((onResult.mock.calls[0]![0] as { meta: { highestHeard: number | null } }).meta.highestHeard).toBeNull();
    expect(hasText(root, '8 kHz ve üzerini duymadın')).toBe(true);
    await press(root, 'Tekrar oyna');
    await press(root, 'Başlayalım');
    await press(root, 'Kulaklığım yok, yine de dene');
    await press(root, 'Yarıya aldım, başla');
    await run(500); // ton çalarken
    await unmount();
    await run(3000);
  });
});
