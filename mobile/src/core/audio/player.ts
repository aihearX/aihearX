import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { encodeWav, renderTone, renderNoise, concat, SAMPLE_RATE, type ToneSpec, type NoiseSpec } from './wav';

/** `done` en geç süre + bu kadar ms sonra çözülür (durum olayı hiç gelmese bile). */
const DONE_GRACE_MS = 300;
/** Oynatıcı ve geçici dosya en geç süre + bu kadar ms sonra serbest bırakılır. */
const RELEASE_GRACE_MS = 1000;

let modePromise: Promise<void> | null = null;
/** Ses modunu bir kez ayarlar; eşzamanlı çağrılar aynı sözü bekler. Hata oyunu durdurmaz. */
function ensureMode(): Promise<void> {
  if (!modePromise) {
    modePromise = setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' }).catch(() => { /* yoksay */ });
  }
  return modePromise;
}

let counter = 0;
/** Üretilmiş WAV'ı geçici dosyaya yazar ve URI döner. */
export async function writeWav(channels: Float32Array[]): Promise<string> {
  const bytes = encodeWav(channels);
  const file = new File(Paths.cache, `aihearx-${Date.now()}-${counter++}.wav`);
  await file.write(bytes);
  return file.uri;
}

export type Playback = {
  /** Oynatıcı oluşturulamadıysa null (ör. dosya yazılamadı). `done` yine de çözülür. */
  player: AudioPlayer | null;
  stop: () => void;
  /** Ses bitince (ya da en geç süre + 300 ms sonra) çözülür; asla reddetmez. */
  done: Promise<void>;
};

/** Sinyal süresi (saniye); boş sinyalde 0. */
function durationOf(channels: Float32Array[]): number {
  return (channels[0]?.length ?? 0) / SAMPLE_RATE;
}

/**
 * Hazır stereo sinyali çalar. Bitince oynatıcı ve geçici dosya serbest bırakılır.
 * Asla reddetmez: dosya yazma/oynatıcı hatasında sessiz bir Playback döner ve `done`
 * yine süre + 300 ms sonra çözülür; oyun akışı hiçbir zaman askıda kalmaz.
 */
export async function playSignal(channels: Float32Array[], volume = 1): Promise<Playback> {
  const seconds = durationOf(channels);
  const doneAt = seconds * 1000 + DONE_GRACE_MS;
  const releaseAt = seconds * 1000 + RELEASE_GRACE_MS;

  let resolveDone: () => void = () => {};
  const done = new Promise<void>((r) => { resolveDone = r; });
  let settled = false;
  const settle = () => { if (settled) return; settled = true; resolveDone(); };

  let uri: string | null = null;
  let player: AudioPlayer | null = null;
  let sub: { remove: () => void } | null = null;
  const timers: ReturnType<typeof setTimeout>[] = [];

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    timers.forEach(clearTimeout);
    try { sub?.remove(); } catch { /* */ }
    try { player?.remove(); } catch { /* */ }
    if (uri) { try { new File(uri).delete(); } catch { /* */ } }
    settle();
  };
  const stop = () => { try { player?.pause(); } catch { /* */ } cleanup(); };

  try {
    await ensureMode();
    uri = await writeWav(channels);
    const p = createAudioPlayer({ uri });
    player = p;
    try { p.volume = Math.max(0, Math.min(1, volume)); } catch { /* */ }
    sub = p.addListener('playbackStatusUpdate', (s) => { if (s.didJustFinish) cleanup(); });
    p.play();
  } catch {
    // Ses çalınamadı: oynatıcı varsa bırak, akış süre kadar bekleyip devam etsin.
    try { sub?.remove(); } catch { /* */ }
    try { player?.remove(); } catch { /* */ }
    sub = null;
    player = null;
  }

  // güvenlik: durum olayı gelmese de `done` süre + 300 ms'de çözülür, kaynaklar süre + 1 sn'de bırakılır
  timers.push(setTimeout(settle, doneAt));
  timers.push(setTimeout(cleanup, releaseAt));
  return { player, stop, done };
}

export const playTone = (spec: ToneSpec, volume = 1) => playSignal(renderTone(spec), volume);
export const playNoise = (spec: NoiseSpec, volume = 1) => playSignal(renderNoise(spec), volume);
export const playSequence = (parts: Float32Array[][], volume = 1) => playSignal(concat(parts), volume);

/** dB HL benzeri bir "seviye"yi 0-1 genliğe çevirir (göreli, kalibre değildir). */
export function levelToAmplitude(levelDb: number, maxDb = 80): number {
  const clamped = Math.max(0, Math.min(maxDb, levelDb));
  return Math.pow(10, (clamped - maxDb) / 20);
}
