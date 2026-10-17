import { bootGame, type ArcadeHandle, type ArcadeOptions } from '../shared';
import { PlayScene } from './PlayScene';

/**
 * Zar Zıplaması — kulak kanalından beyne doğru sonsuz dikey zıplama.
 * Odi; kıkırdak, kemikçik, ince zar ve kulak zarı platformlarında yükselir; yükseklik = skor.
 */
export function mount(parent: HTMLElement, opts: ArcadeOptions): ArcadeHandle {
  return bootGame(parent, opts, [PlayScene], '#ffe4d0');
}
