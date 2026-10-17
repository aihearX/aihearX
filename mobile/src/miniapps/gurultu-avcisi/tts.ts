import * as Speech from 'expo-speech';
import { DIGIT_WORDS } from './logic';

/**
 * 'ready'   → cihazda Türkçe ses var; rakamlar kelime olarak okunur ("dört yedi iki").
 * 'unknown' → ses listesi boş döndü (motor henüz hazır değil); Türkçe denenir.
 * 'missing' → liste dolu ama Türkçe yok; rakamlar "4 7 2" olarak mevcut dilde okunur.
 */
export type VoiceStatus = 'checking' | 'ready' | 'unknown' | 'missing';
export type VoiceInfo = { status: VoiceStatus; voice?: string };

const isTurkish = (lang: string) => lang.toLowerCase().replace('_', '-').startsWith('tr');

export async function findTurkishVoice(): Promise<VoiceInfo> {
  try {
    // Bazı cihazlarda ses listesi geç gelir; 2.5 sn içinde cevap yoksa 'unknown' ile devam.
    const timeout = new Promise<Speech.Voice[]>((resolve) => setTimeout(() => resolve([]), 2500));
    const voices = await Promise.race([Speech.getAvailableVoicesAsync(), timeout]);
    if (!voices.length) return { status: 'unknown' };
    const tr = voices.filter((v) => isTurkish(v.language));
    if (!tr.length) return { status: 'missing' };
    const best = tr.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? tr[0]!;
    return { status: 'ready', voice: best.identifier };
  } catch {
    return { status: 'unknown' };
  }
}

export const MISSING_VOICE_HINT = "Türkçe ses paketi yok: Ayarlar > Erişilebilirlik > Sesli İçerik > Sesler'den Türkçe bir ses indir. Şimdilik rakamlar mevcut dilde okunur.";

/** Üç rakamı okur; bitince (ya da durdurulunca/hata olunca) çözülür. Asla askıda kalmaz. */
export function speakDigits(digits: number[], info: VoiceInfo, volume: number): Promise<void> {
  const turkish = info.status !== 'missing';
  const text = turkish ? digits.map((d) => DIGIT_WORDS[d] ?? String(d)).join(' ') : digits.join(' ');
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => { if (!settled) { settled = true; resolve(); } };
    const opts: Speech.SpeechOptions = { rate: 0.9, pitch: 1, volume: Math.max(0.05, Math.min(1, volume)), onDone: finish, onStopped: finish, onError: finish };
    if (turkish) opts.language = 'tr-TR';
    if (info.voice) opts.voice = info.voice;
    try { Speech.speak(text, opts); } catch { finish(); }
    setTimeout(finish, 6000);
  });
}

export function stopSpeech(): void {
  Speech.stop().catch(() => {});
}
