import Phaser from 'phaser';
import { bootGame, getOpts, heroTexture, Hud, sfx, tapToStart, title, type ArcadeHandle, type ArcadeOptions } from '../shared';

/** Boru hattını doğrulayan minik örnek: zıplayan kahraman, 10 saniyede biter. */
class Play extends Phaser.Scene {
  hero!: Phaser.Physics.Arcade.Sprite; hud!: Hud; score = 0; done = false;
  constructor() { super('play'); }
  create() {
    const w = this.scale.width, h = this.scale.height;
    title(this, w / 2, 140, 'Örnek');
    const ground = this.add.rectangle(w / 2, h - 40, w, 80, 0xeef0f6); this.physics.add.existing(ground, true);
    this.hero = this.physics.add.sprite(w / 2, h - 140, heroTexture(this, 'hero'));
    this.hero.setCollideWorldBounds(true); this.physics.add.collider(this.hero, ground);
    this.hud = new Hud(this); this.hud.set(0, 3, 'Örnek');
    tapToStart(this, 'Dokun ve zıpla', () => {
      this.input.on('pointerdown', () => { this.hero.setVelocityY(-700); this.score += 10; this.hud.set(this.score, 3); sfx.jump(); getOpts(this).onEvent({ type: 'haptic', kind: 'light' }); });
      this.time.delayedCall(getOpts(this).debug ? 1500 : 10000, () => this.finish());
    });
  }
  finish() { if (this.done) return; this.done = true; sfx.gameOver(); getOpts(this).onEvent({ type: 'gameover', score: this.score, stats: { Zıplama: this.score / 10 }, label: 'Örnek' }); }
}

export function mount(parent: HTMLElement, opts: ArcadeOptions): ArcadeHandle { return bootGame(parent, opts, [Play]); }
