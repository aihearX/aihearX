import Phaser from 'phaser';
import { unlock, setSoundsEnabled } from './audio';
import type { ArcadeHandle, ArcadeOptions } from './bridge';

export const GAME_W = 390;
export const GAME_H = 780;

/** Phaser oyununu bir div'e kurar. Dikey, FIT ölçekleme, dokunuş girişi. */
export function bootGame(parent: HTMLElement, opts: ArcadeOptions, scenes: Phaser.Types.Scenes.SceneType[], bg = '#ffffff'): ArcadeHandle {
  setSoundsEnabled(opts.sounds !== false);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_W,
    height: GAME_H,
    backgroundColor: bg,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1400 }, debug: false } },
    input: { activePointers: 2 },
    render: { antialias: true, pixelArt: false, roundPixels: false },
    scene: scenes,
    callbacks: { postBoot: () => { opts.onEvent({ type: 'ready' }); } },
  });
  game.registry.set('opts', opts);
  const onDown = () => unlock();
  parent.addEventListener('pointerdown', onDown, { passive: true });
  parent.addEventListener('touchstart', onDown, { passive: true });
  return { destroy: () => { parent.removeEventListener('pointerdown', onDown); parent.removeEventListener('touchstart', onDown); game.destroy(true); } };
}

export function getOpts(scene: Phaser.Scene): ArcadeOptions { return scene.registry.get('opts') as ArcadeOptions; }
