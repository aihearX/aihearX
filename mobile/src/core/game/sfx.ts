/**
 * Oyun ses efektleri: sentezlenmiş, varlık dosyası gerektirmez.
 * Tüm oyunlar aynı "ding", "buzz", "levelUp" seslerini kullanır; tutarlı hissiyat.
 */
import { renderTone, concat, silence, playSignal, type Playback } from '@/core/audio';
import { useSettings } from '@/core/store/settings';

const cache: Record<string, Float32Array[]> = {};

function build(name: SfxName): Float32Array[] {
  if (cache[name]) return cache[name]!;
  let sig: Float32Array[];
  switch (name) {
    case 'ding':
      sig = concat([renderTone({ freq: 880, duration: 0.09, amplitude: 0.35, ramp: 0.01 }), renderTone({ freq: 1320, duration: 0.16, amplitude: 0.3, ramp: 0.02 })]);
      break;
    case 'buzz':
      sig = concat([renderTone({ freq: 160, duration: 0.12, amplitude: 0.35, ramp: 0.01 }), silence(0.03), renderTone({ freq: 130, duration: 0.16, amplitude: 0.3, ramp: 0.01 })]);
      break;
    case 'tick':
      sig = renderTone({ freq: 1500, duration: 0.03, amplitude: 0.18, ramp: 0.005 });
      break;
    case 'combo':
      sig = concat([renderTone({ freq: 660, duration: 0.07, amplitude: 0.3 }), renderTone({ freq: 880, duration: 0.07, amplitude: 0.3 }), renderTone({ freq: 1175, duration: 0.14, amplitude: 0.3 })]);
      break;
    case 'levelUp':
      sig = concat([renderTone({ freq: 523, duration: 0.1, amplitude: 0.3 }), renderTone({ freq: 659, duration: 0.1, amplitude: 0.3 }), renderTone({ freq: 784, duration: 0.1, amplitude: 0.3 }), renderTone({ freq: 1047, duration: 0.28, amplitude: 0.32 })]);
      break;
    case 'gameOver':
      sig = concat([renderTone({ freq: 392, duration: 0.18, amplitude: 0.3 }), renderTone({ freq: 330, duration: 0.18, amplitude: 0.3 }), renderTone({ freq: 262, duration: 0.4, amplitude: 0.3 })]);
      break;
    case 'countdown':
      sig = renderTone({ freq: 740, duration: 0.08, amplitude: 0.3, ramp: 0.01 });
      break;
    case 'go':
      sig = renderTone({ freq: 1480, duration: 0.25, amplitude: 0.32, ramp: 0.01 });
      break;
  }
  cache[name] = sig;
  return sig;
}

export type SfxName = 'ding' | 'buzz' | 'tick' | 'combo' | 'levelUp' | 'gameOver' | 'countdown' | 'go';

/** Efekt çalar; sessiz/sakin modda sessiz kalır. Oyun sesleriyle çakışmaması için düşük genlik. */
export async function sfx(name: SfxName, volume = 0.9): Promise<Playback | null> {
  if (!useSettings.getState().sounds) return null;
  try { return await playSignal(build(name), volume); } catch { return null; }
}
