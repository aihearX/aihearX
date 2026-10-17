import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { encodeWav, renderTone, renderNoise, concat, type ToneSpec, type NoiseSpec } from './wav';

let modeReady = false;
async function ensureMode() {
  if (modeReady) return;
  modeReady = true;
  try { await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' }); } catch { /* yoksay */ }
}

let counter = 0;
/** Üretilmiş WAV'ı geçici dosyaya yazar ve URI döner. */
export async function writeWav(channels: Float32Array[]): Promise<string> {
  const bytes = encodeWav(channels);
  const file = new File(Paths.cache, `aihearx-${Date.now()}-${counter++}.wav`);
  await file.write(bytes);
  return file.uri;
}

export type Playback = { player: AudioPlayer; stop: () => void; done: Promise<void> };

/** Hazır stereo sinyali çalar. Bitince oynatıcı serbest bırakılır. */
export async function playSignal(channels: Float32Array[], volume = 1): Promise<Playback> {
  await ensureMode();
  const uri = await writeWav(channels);
  const player = createAudioPlayer({ uri });
  player.volume = Math.max(0, Math.min(1, volume));
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((r) => { resolveDone = r; });
  const sub = player.addListener('playbackStatusUpdate', (s) => {
    if (s.didJustFinish) { cleanup(); }
  });
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try { sub.remove(); } catch { /* */ }
    try { player.remove(); } catch { /* */ }
    try { new File(uri).delete(); } catch { /* */ }
    resolveDone();
  };
  player.play();
  // güvenlik: süre + 1 sn sonra mutlaka temizle
  const seconds = channels[0]!.length / 44100;
  setTimeout(cleanup, (seconds + 1) * 1000);
  return { player, stop: () => { try { player.pause(); } catch { /* */ } cleanup(); }, done };
}

export const playTone = (spec: ToneSpec, volume = 1) => playSignal(renderTone(spec), volume);
export const playNoise = (spec: NoiseSpec, volume = 1) => playSignal(renderNoise(spec), volume);
export const playSequence = (parts: Float32Array[][], volume = 1) => playSignal(concat(parts), volume);

/** dB HL benzeri bir "seviye"yi 0-1 genliğe çevirir (göreli, kalibre değildir). */
export function levelToAmplitude(levelDb: number, maxDb = 80): number {
  const clamped = Math.max(0, Math.min(maxDb, levelDb));
  return Math.pow(10, (clamped - maxDb) / 20);
}
