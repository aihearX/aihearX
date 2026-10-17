import Phaser from 'phaser';
import {
  bootGame, getOpts, heroTexture, Hud, sfx, tapToStart, title, label, flash, floatText, tonotopyColor, tonotopyFreq,
  FONT, COLORS, GAME_W, GAME_H, type ArcadeHandle, type ArcadeOptions,
} from '../shared';
import { makeRng, pickChunk, type Chunk, type ItemKind } from './chunks';
import { spikeTexture, serumenTexture, cloudTexture, dropTexture, coinTexture, dotTexture, shieldRingTexture, shadowTexture, warnTexture, layerTextures, powerTextures } from './textures';

/**
 * Koklea Koşusu — kokleanın içinde sonsuz koşu.
 * Taban (ince ses, mor) → apeks (kalın ses, turuncu). 1 m = 10 px, apeks 3000 m.
 */

const W = GAME_W, H = GAME_H;
const GROUND_Y = 600;
const HERO_X = 96;
const GRAVITY = 2400;
const JUMP_V = 860;
const DJUMP_V = 760;
const HOLD_MAX = 0.22;
const DROP_V = 540;
const APEX_M = 3000;

type Item = {
  k: ItemKind; wx: number; y: number; img: Phaser.GameObjects.Image; alive: boolean;
  used: boolean; falling: boolean; warned: boolean; shadow?: Phaser.GameObjects.Image; warn?: Phaser.GameObjects.Image;
};
type Rect = { x: number; y: number; w: number; h: number };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const fmtHz = (f: number) => (f >= 1000 ? `${Math.round(f / 100) / 10} kHz` : `${Math.round(f)} Hz`);

class Play extends Phaser.Scene {
  // dünya
  worldX = 0; speedBase = 270; speedMul = 1; slowT = 0; elapsed = 0; started = false; over = false;
  level = 1; levelT = 0; levelEvery = 20; meters = 0; markerStep = 0; debug = false; debugEndT = 13;
  rng: () => number = Math.random; nextChunkX = 420; lastChunk = '';
  // kahraman
  hero!: Phaser.GameObjects.Image; heroY = GROUND_Y; vy = 0; onGround = true; jumps = 0; holding = false; holdT = 0;
  sliding = false; slideHeld = false; slideT = 0; slideQueued = false; moodT = 0; inv = 0; blink?: Phaser.Tweens.Tween;
  squash = { x: 1, y: 1 }; heroShadow!: Phaser.GameObjects.Image; ring!: Phaser.GameObjects.Image;
  texHappy = ''; texHurt = ''; texWow = '';
  // durum
  lives = 3; coins = 0; coinScore = 0; combo = 0; shield = false; magnetT = 0;
  // nesneler
  items: Item[] = []; pools = new Map<string, Phaser.GameObjects.Image[]>();
  tex!: { spike: string; serumen: string; cloud: string; drop: string; coin: string; shield: string; magnet: string; life: string };
  // görsel
  bg!: Phaser.GameObjects.Rectangle; far!: Phaser.GameObjects.TileSprite; mid!: Phaser.GameObjects.TileSprite; near!: Phaser.GameObjects.TileSprite; ground!: Phaser.GameObjects.TileSprite;
  grass!: Phaser.GameObjects.Graphics; hud!: Hud; status!: Phaser.GameObjects.Text; hint?: Phaser.GameObjects.Text;
  dust!: Phaser.GameObjects.Particles.ParticleEmitter; sparkle!: Phaser.GameObjects.Particles.ParticleEmitter; splash!: Phaser.GameObjects.Particles.ParticleEmitter;
  hudT = 0; tickT = 0; pointerDownY = 0; pointerDownT = 0;

  constructor() { super('play'); }

  create() {
    const opts = getOpts(this);
    this.debug = !!opts.debug;
    this.rng = makeRng(opts.seed ?? 42);
    if (this.debug) {
      this.speedMul = 1.7; this.levelEvery = 4;
      // harness önizlemesi: mode 'm=1600,l=5' → 1600 m ve 5. seviyeden başla
      const m = /m=(\d+)/.exec(opts.mode ?? ''), l = /l=(\d+)/.exec(opts.mode ?? '');
      if (m) { this.worldX = Number(m[1]) * 10; this.nextChunkX = this.worldX + 420; this.markerStep = Math.floor(Number(m[1]) / 500); }
      if (l) this.level = Number(l[1]);
    }

    // dokular
    this.tex = { spike: spikeTexture(this), serumen: serumenTexture(this), cloud: cloudTexture(this), drop: dropTexture(this), coin: coinTexture(this), ...powerTextures(this) };
    this.texHappy = heroTexture(this, 'kk-odi', 0x6c4cf1, 56, 'happy');
    this.texHurt = heroTexture(this, 'kk-odi', 0x6c4cf1, 56, 'hurt');
    this.texWow = heroTexture(this, 'kk-odi', 0x6c4cf1, 56, 'wow');
    dotTexture(this); shieldRingTexture(this); shadowTexture(this); warnTexture(this);

    // arka plan katmanları
    const c0 = tonotopyColor(0);
    const L = layerTextures(this, 0, c0);
    this.bg = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff).setDepth(0);
    this.far = this.add.tileSprite(W / 2, 300, W, 600, L.far).setDepth(1);
    this.mid = this.add.tileSprite(W / 2, H / 2, W, H, L.mid).setDepth(2);
    this.near = this.add.tileSprite(W / 2, H / 2, W, H, L.near).setDepth(3);
    this.ground = this.add.tileSprite(W / 2, GROUND_Y + 90, W, 180, L.ground).setDepth(4);
    this.grass = this.add.graphics().setDepth(5);
    this.applyTint(this.worldX / 10 / APEX_M); if (this.markerStep > 0) this.setStep(Math.min(6, this.markerStep));

    // parçacıklar
    this.dust = this.add.particles(0, 0, 'kk-dot', { speed: { min: 40, max: 140 }, angle: { min: 200, max: 340 }, scale: { start: 0.8, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 420, gravityY: 500, tint: 0xffffff, emitting: false }).setDepth(14);
    this.sparkle = this.add.particles(0, 0, 'kk-dot', { speed: { min: 60, max: 180 }, scale: { start: 0.6, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 380, tint: [0xffd23f, 0xffffff, 0xf59e0b], emitting: false }).setDepth(14);
    this.splash = this.add.particles(0, 0, 'kk-dot', { speed: { min: 80, max: 220 }, angle: { min: 200, max: 340 }, scale: { start: 0.7, end: 0 }, alpha: { start: 0.9, end: 0 }, lifespan: 450, gravityY: 900, tint: 0x10b981, emitting: false }).setDepth(14);

    // kahraman
    this.heroShadow = this.add.image(HERO_X, GROUND_Y + 2, 'kk-shadow').setDepth(11);
    this.hero = this.add.image(HERO_X, GROUND_Y, this.texHappy).setOrigin(0.5, 1).setDepth(12);
    this.ring = this.add.image(HERO_X, GROUND_Y - 28, 'kk-ring').setDepth(13).setVisible(false);

    // HUD
    this.hud = new Hud(this); this.hud.set(0, 3, 'Sv 1 · 0 m');
    this.status = this.add.text(W / 2, 92, '', { fontFamily: FONT, fontSize: '15px', fontStyle: '800', color: '#ffffff', backgroundColor: '#0e9c98', padding: { x: 12, y: 4 } }).setOrigin(0.5).setDepth(101).setVisible(false);

    this.idleBounce();
    tapToStart(this, 'Dokun ve koş!', () => this.start());
  }

  idleBounce() {
    this.tweens.add({ targets: this.squash, y: 1.06, x: 0.96, yoyo: true, repeat: -1, duration: 420, ease: 'Sine.InOut' });
  }

  start() {
    this.started = true;
    this.tweens.killTweensOf(this.squash); this.squash.x = 1; this.squash.y = 1;
    this.input.on('pointerdown', this.onDown, this);
    this.input.on('pointermove', this.onMove, this);
    this.input.on('pointerup', this.onUp, this);
    this.hint = label(this, W / 2, 400, 'Dokun: zıpla · basılı tut: daha yüksek\nAşağı kaydır: eğilip kay', 15, COLORS.text).setDepth(120);
    this.hint.setBackgroundColor('rgba(255,255,255,0.8)').setPadding(12, 8, 12, 8);
    this.tweens.add({ targets: this.hint, alpha: 0, delay: 5000, duration: 500, onComplete: () => { this.hint?.destroy(); this.hint = undefined; } });
    this.banner('Koklea Koşusu', 'Tabandan apekse!', 0x6c4cf1);
    this.emitArcade();
  }

  // ---------------------------------------------------------------- giriş
  onDown(p: Phaser.Input.Pointer) {
    if (this.over) return;
    this.pointerDownY = p.y; this.pointerDownT = this.elapsed;
    if (p.y > H * 0.75) this.startSlide(); else this.jump();
  }
  onMove(p: Phaser.Input.Pointer) {
    if (this.over || !p.isDown) return;
    if (!this.sliding && p.y - this.pointerDownY > 40 && this.elapsed - this.pointerDownT < 0.4) { this.pointerDownY = 1e9; this.holding = false; this.startSlide(); }
  }
  onUp() { this.holding = false; this.slideHeld = false; }

  jump() {
    if (this.sliding) { this.sliding = false; this.slideHeld = false; }
    if (this.onGround) {
      this.vy = -JUMP_V; this.onGround = false; this.jumps = 1; this.holding = true; this.holdT = 0;
      sfx.jump(); this.stretch(0.72, 1.32);
      this.dust.explode(5, HERO_X, GROUND_Y);
      getOpts(this).onEvent({ type: 'haptic', kind: 'light' });
    } else if (this.jumps < 2) {
      this.vy = -DJUMP_V; this.jumps = 2; this.holding = true; this.holdT = 0;
      sfx.doubleJump(); this.mood('wow', 0.45); this.stretch(0.8, 1.25);
      this.sparkle.explode(6, HERO_X, this.heroY - 10);
      this.tweens.add({ targets: this.hero, angle: 360, duration: 420, ease: 'Cubic.Out', onComplete: () => this.hero.setAngle(0) });
    }
  }
  startSlide() {
    if (this.onGround) { this.sliding = true; this.slideHeld = true; this.slideT = 0.45; if (!this.slideQueued) this.dust.explode(4, HERO_X + 10, GROUND_Y); this.slideQueued = false; }
    else { this.vy = Math.max(this.vy, 1200); this.slideQueued = true; this.slideHeld = true; this.holding = false; }
  }
  stretch(x: number, y: number) {
    this.tweens.killTweensOf(this.squash);
    this.squash.x = x; this.squash.y = y;
    this.tweens.add({ targets: this.squash, x: 1, y: 1, duration: 260, ease: 'Back.Out' });
  }
  mood(m: 'happy' | 'hurt' | 'wow', secs: number) {
    this.hero.setTexture(m === 'hurt' ? this.texHurt : m === 'wow' ? this.texWow : this.texHappy);
    this.moodT = secs;
  }

  // ---------------------------------------------------------------- dünya
  get speed() { return Math.min(680, this.speedBase * (1 + 0.1 * (this.level - 1)) * this.speedMul * (this.slowT > 0 ? 0.5 : 1)); }

  applyTint(t: number) {
    // arka plan: tonotopi renginin %16'lık pastel karışımı
    const c = tonotopyColor(t), r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    const mix = (v: number) => Math.round(255 - (255 - v) * 0.16);
    this.bg.setFillStyle((mix(r) << 16) | (mix(g) << 8) | mix(b));
  }
  setStep(step: number) {
    const L = layerTextures(this, step, tonotopyColor(step / 6));
    this.far.setTexture(L.far); this.mid.setTexture(L.mid); this.near.setTexture(L.near); this.ground.setTexture(L.ground);
  }

  spawnChunk() {
    const chunk: Chunk = pickChunk(this.rng, this.level, this.lastChunk);
    this.lastChunk = chunk.name;
    const stretch = 0.85 + this.speed / 900; // hızlandıkça engeller px olarak açılır (tepki süresi sabit kalsın)
    const x0 = this.nextChunkX;
    let hasPower = false;
    for (const it of chunk.items) {
      if (it.k === 'shield' || it.k === 'magnet' || it.k === 'life') hasPower = true;
      this.addItem(it.k, x0 + it.x * stretch, it.h ?? 0);
    }
    if (!hasPower) {
      const r = this.rng();
      const lifeP = this.lives < 3 ? 0.03 : 0.012;
      if (r < 0.06) this.addItem('shield', x0 + chunk.len * stretch - 60, 100);
      else if (r < 0.12) this.addItem('magnet', x0 + chunk.len * stretch - 60, 100);
      else if (r < 0.12 + lifeP) this.addItem('life', x0 + chunk.len * stretch - 60, 70);
    }
    this.nextChunkX = x0 + chunk.len * stretch + 140 + this.speed * 0.25;
  }

  getImg(key: string): Phaser.GameObjects.Image {
    const pool = this.pools.get(key) ?? [];
    this.pools.set(key, pool);
    const img = pool.pop() ?? this.add.image(0, 0, key).setDepth(10);
    img.setActive(true).setVisible(true).setAlpha(1).setScale(1).setAngle(0);
    return img;
  }
  putImg(img: Phaser.GameObjects.Image) {
    img.setActive(false).setVisible(false);
    this.pools.get(img.texture.key)?.push(img);
  }

  addItem(k: ItemKind, wx: number, h: number) {
    const key = k === 'spike' ? this.tex.spike : k === 'serumen' ? this.tex.serumen : k === 'cloud' ? this.tex.cloud : k === 'drop' ? this.tex.drop : k === 'coin' ? this.tex.coin : k === 'shield' ? this.tex.shield : k === 'magnet' ? this.tex.magnet : this.tex.life;
    const img = this.getImg(key);
    let y = GROUND_Y - h;
    if (k === 'spike') { y = GROUND_Y - 28; img.setOrigin(0.5, 0.5); }
    else if (k === 'serumen') y = GROUND_Y - 16;
    else if (k === 'cloud') y = GROUND_Y - 72;
    else if (k === 'drop') y = -30;
    else if (k === 'coin') y = GROUND_Y - 18 - h;
    else y = GROUND_Y - 26 - h;
    img.setPosition(wx - this.worldX, y);
    const item: Item = { k, wx, y, img, alive: true, used: false, falling: false, warned: false };
    if (k === 'drop') { img.setVisible(false); item.shadow = this.getImg('kk-shadow').setDepth(9).setPosition(wx - this.worldX, GROUND_Y + 2).setVisible(false); }
    this.items.push(item);
  }
  removeItem(it: Item) {
    it.alive = false; this.putImg(it.img);
    if (it.shadow) { this.putImg(it.shadow); it.shadow = undefined; }
    if (it.warn) { this.putImg(it.warn); it.warn = undefined; }
  }

  heroRect(): Rect {
    return this.sliding ? { x: HERO_X - 18, y: this.heroY - 24, w: 36, h: 24 } : { x: HERO_X - 15, y: this.heroY - 46, w: 30, h: 46 };
  }
  itemRect(it: Item, sx: number): Rect {
    switch (it.k) {
      case 'spike': return { x: sx - 13, y: GROUND_Y - 46, w: 26, h: 46 };
      case 'serumen': return { x: sx - 22, y: GROUND_Y - 14, w: 44, h: 14 };
      case 'cloud': return { x: sx - 48, y: GROUND_Y - 100, w: 96, h: 62 };
      case 'drop': return { x: sx - 11, y: it.y - 11, w: 22, h: 24 };
      default: return { x: sx - 15, y: it.y - 15, w: 30, h: 30 };
    }
  }

  // ---------------------------------------------------------------- döngü
  update(_t: number, dms: number) {
    const dt = Math.min(0.05, dms / 1000);
    if (!this.started) { this.hero.setScale(this.squash.x, this.squash.y); this.grassDraw(0); return; }
    if (this.over) { this.hero.setScale(this.squash.x, this.squash.y); return; }
    this.elapsed += dt;
    const speed = this.speed;
    this.worldX += speed * dt;
    this.meters = Math.floor(this.worldX / 10);
    if (this.slowT > 0) this.slowT -= dt;
    if (this.inv > 0) { this.inv -= dt; if (this.inv <= 0) { this.hero.setAlpha(1); this.blink?.stop(); this.blink = undefined; } }
    if (this.moodT > 0) { this.moodT -= dt; if (this.moodT <= 0) this.hero.setTexture(this.texHappy); }
    if (this.magnetT > 0) { this.magnetT -= dt; if (this.magnetT <= 0) this.statusHide(); else this.status.setText(`⚡ Mıknatıs ${Math.ceil(this.magnetT)} s`); }

    // kahraman fiziği
    const g = this.holding && this.vy < 0 && this.holdT < HOLD_MAX ? GRAVITY * 0.42 : GRAVITY;
    if (this.holding) this.holdT += dt;
    if (!this.onGround) {
      this.vy += g * dt; this.heroY += this.vy * dt;
      if (this.heroY >= GROUND_Y) {
        this.heroY = GROUND_Y; this.onGround = true; this.jumps = 0; this.holding = false;
        const hard = this.vy > 900;
        this.vy = 0; this.stretch(hard ? 1.4 : 1.25, hard ? 0.6 : 0.72);
        this.dust.explode(hard ? 12 : 7, HERO_X, GROUND_Y);
        if (this.slideQueued || this.slideHeld) this.startSlide();
      }
    }
    if (this.sliding) { this.slideT -= dt; if (this.slideT <= 0 && !this.slideHeld) this.sliding = false; }
    const bx = this.sliding ? 1.35 : 1, by = this.sliding ? 0.5 : 1;
    const cx = lerp(this.hero.scaleX / this.squash.x || 1, bx, 0.35), cy = lerp(this.hero.scaleY / this.squash.y || 1, by, 0.35);
    this.hero.setScale(cx * this.squash.x, cy * this.squash.y);
    this.hero.setY(this.heroY);
    const airH = clamp((GROUND_Y - this.heroY) / 220, 0, 1);
    this.heroShadow.setScale(1 - airH * 0.5).setAlpha(1 - airH * 0.6);
    this.ring.setVisible(this.shield).setPosition(HERO_X, this.heroY - (this.sliding ? 14 : 28)).setScale(this.sliding ? 0.75 : 1);
    if (this.shield) this.ring.setAlpha(0.75 + Math.sin(this.elapsed * 6) * 0.2);

    // paralaks
    this.far.tilePositionX = this.worldX * 0.12;
    this.mid.tilePositionX = this.worldX * 0.35;
    this.near.tilePositionX = this.worldX * 0.7; this.near.tilePositionY = Math.sin(this.elapsed * 0.6) * 12 - this.elapsed * 6;
    this.ground.tilePositionX = this.worldX;
    this.grassDraw(speed);

    // parça üretimi
    while (this.nextChunkX < this.worldX + W + 160) this.spawnChunk();

    // nesneler
    const hr = this.heroRect();
    const magnet = this.magnetT > 0;
    for (const it of this.items) {
      if (!it.alive) continue;
      let sx = it.wx - this.worldX;
      if (sx < -120) { if (it.k === 'coin' && !it.used) this.coinMiss(); this.removeItem(it); continue; }
      if (it.k === 'coin') {
        if (magnet) {
          const dx = HERO_X - sx, dy = (this.heroY - 24) - it.y, d = Math.hypot(dx, dy);
          if (d < 190 && d > 1) { const s = Math.min(1, (600 * dt) / d); it.wx += dx * s; it.y += dy * s; sx = it.wx - this.worldX; }
        }
        it.img.setPosition(sx, it.y + Math.sin(this.elapsed * 5 + it.wx * 0.03) * 3);
      } else if (it.k === 'drop') {
        const eta = (sx - HERO_X) / speed;
        if (!it.warned && eta <= (GROUND_Y + 30) / DROP_V + 0.45 && sx < W + 20) {
          it.warned = true;
          it.warn = this.getImg('kk-warn').setDepth(60).setPosition(Math.min(W - 20, sx), 118).setAlpha(0);
          this.tweens.add({ targets: it.warn, alpha: 1, y: 128, yoyo: true, repeat: 3, duration: 140 });
          it.shadow?.setVisible(true).setScale(0.3).setAlpha(0.3);
          sfx.tick();
        }
        if (!it.falling && it.warned && eta <= (GROUND_Y + 30) / DROP_V) {
          // geç girdiyse (yüksek hız) havada başlat: kahraman geçerken yere değsin
          it.falling = true; it.y = Math.max(-30, GROUND_Y - 12 - Math.max(0.25, eta) * DROP_V); it.img.setVisible(true);
        }
        if (it.falling) {
          it.y += DROP_V * dt; it.img.setPosition(sx, it.y).setAngle(Math.sin(this.elapsed * 12) * 6);
          const p = clamp((it.y + 30) / (GROUND_Y + 30), 0, 1);
          it.shadow?.setPosition(sx, GROUND_Y + 2).setScale(0.3 + p * 0.7).setAlpha(0.2 + p * 0.5);
          if (it.y >= GROUND_Y - 12) { this.splash.explode(10, sx, GROUND_Y); this.removeItem(it); continue; }
        } else { it.shadow?.setPosition(sx, GROUND_Y + 2); it.warn?.setX(Math.min(W - 20, sx)); }
      } else {
        it.img.setX(sx);
        if (it.k === 'shield' || it.k === 'magnet' || it.k === 'life') { it.img.setY(it.y + Math.sin(this.elapsed * 4 + it.wx * 0.02) * 4).setScale(1 + Math.sin(this.elapsed * 6) * 0.06); }
        if (it.k === 'serumen') it.img.setScale(1 + Math.sin(this.elapsed * 7 + it.wx) * 0.04, 1 - Math.sin(this.elapsed * 7 + it.wx) * 0.05);
      }
      if (it.used) continue;
      if (sx > HERO_X + 90 || sx < HERO_X - 90) continue;
      if (!overlap(hr, this.itemRect(it, sx))) continue;
      this.touch(it, sx);
    }
    // ölü nesneleri temizle (seyrek)
    if (this.items.length > 80) this.items = this.items.filter((i) => i.alive);

    // seviye / marker / HUD
    this.levelT += dt;
    if (this.levelT >= this.levelEvery) { this.levelT = 0; this.level++; sfx.levelUp(); this.banner(`Seviye ${this.level}`, 'Daha hızlı!', 0x6c4cf1); getOpts(this).onEvent({ type: 'haptic', kind: 'medium' }); }
    const step = Math.floor(this.meters / 500);
    if (step > this.markerStep) {
      this.markerStep = step;
      const from = tonotopyFreq(((step - 1) * 500) / APEX_M), to = tonotopyFreq((step * 500) / APEX_M);
      sfx.toneAt(to, 0.35);
      this.marker(step * 500 >= APEX_M ? `🐚 Apeks! ${fmtHz(to)}` : `${fmtHz(from)} → ${fmtHz(to)}`);
      this.setStep(Math.min(6, step));
    }
    this.hudT += dt;
    if (this.hudT > 0.1) { this.hudT = 0; this.applyTint(this.meters / APEX_M); this.hud.set(this.score, this.lives, `Sv ${this.level} · ${this.meters} m`); }
    this.tickT += dt;
    if (this.tickT >= 1) { this.tickT = 0; this.emitArcade(); }
    if (this.debug && this.elapsed >= this.debugEndT) this.gameOver();
  }

  grassDraw(speed: number) {
    const g = this.grass; g.clear();
    const n = 30, gap = 14;
    const lean = Math.min(5, speed * 0.008);
    for (let i = 0; i < n; i++) {
      const x = ((((i * gap - this.worldX * 1.0) % (W + gap)) + (W + gap)) % (W + gap)) - gap / 2;
      const sway = Math.sin(this.elapsed * 3.2 + i * 0.8) * 3 - lean;
      const h = 9 + (i % 3) * 3;
      g.lineStyle(2, 0xffffff, 0.9);
      g.beginPath(); g.moveTo(x, GROUND_Y + 1); g.lineTo(x + sway, GROUND_Y - h); g.strokePath();
      g.beginPath(); g.moveTo(x + sway * 0.5, GROUND_Y - h * 0.5); g.lineTo(x + sway * 0.5 + 3, GROUND_Y - h * 0.7); g.strokePath();
      g.beginPath(); g.moveTo(x + sway * 0.6, GROUND_Y - h * 0.65); g.lineTo(x + sway * 0.6 - 3, GROUND_Y - h * 0.85); g.strokePath();
    }
  }

  // ---------------------------------------------------------------- temaslar
  touch(it: Item, sx: number) {
    const opts = getOpts(this);
    switch (it.k) {
      case 'coin': {
        it.used = true; this.removeItem(it);
        this.coins++; this.combo++;
        const mult = this.combo >= 5 ? 2 : 1;
        this.coinScore += 10 * mult;
        sfx.coin(); this.sparkle.explode(6, sx, it.y);
        floatText(this, sx, it.y - 10, `+${10 * mult}`, mult === 2 ? COLORS.amber : COLORS.accent2);
        if (this.combo === 5) { this.banner('Kombo x2!', '5 jeton üst üste', 0xd98b00); sfx.power(); opts.onEvent({ type: 'haptic', kind: 'success' }); }
        return;
      }
      case 'shield': {
        it.used = true; this.removeItem(it); this.shield = true;
        this.ring.setVisible(true).setScale(0.2); this.tweens.add({ targets: this.ring, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.Out' });
        this.power('🦻 İşitme cihazı: kalkan!', 0x38bdf8); return;
      }
      case 'magnet': {
        it.used = true; this.removeItem(it); this.magnetT = 6;
        this.status.setVisible(true).setText('⚡ Mıknatıs 6 s');
        this.power('⚡ Koklear implant: mıknatıs!', 0xf59e0b); return;
      }
      case 'life': {
        it.used = true; this.removeItem(it);
        if (this.lives < 3) { this.lives++; this.power('💚 Kıl hücresi tazelendi: +1 can', 0x22c55e); }
        else { this.coinScore += 100; this.power('💚 Kıl hücresi tazelendi: +100', 0x22c55e); }
        return;
      }
      case 'serumen': {
        it.used = true; this.slowT = 1; this.mood('wow', 0.8);
        this.sparkle.explode(10, HERO_X, this.heroY - 20);
        floatText(this, HERO_X, this.heroY - 70, 'Yapışkan!', COLORS.amber); sfx.bounce();
        this.stretch(1.3, 0.75); opts.onEvent({ type: 'haptic', kind: 'light' });
        return;
      }
      default: {
        if (this.inv > 0) return;
        it.used = true; this.hit(it.k);
      }
    }
  }
  power(text: string, color: number) {
    sfx.power(); flash(this, color, 0.28, 220);
    floatText(this, W / 2, 190, text, '#' + color.toString(16).padStart(6, '0'));
    this.stretch(0.85, 1.2); this.mood('wow', 0.6);
    getOpts(this).onEvent({ type: 'haptic', kind: 'success' });
  }
  hit(kind: ItemKind) {
    const opts = getOpts(this);
    if (this.shield) {
      this.shield = false; this.inv = 1;
      flash(this, 0x38bdf8, 0.3, 200); sfx.bounce();
      this.tweens.add({ targets: this.ring, scaleX: 1.8, scaleY: 1.8, alpha: 0, duration: 260, onComplete: () => this.ring.setVisible(false).setAlpha(1).setScale(1) });
      floatText(this, HERO_X, this.heroY - 80, 'Kalkan korudu!', '#0284c7');
      opts.onEvent({ type: 'haptic', kind: 'medium' });
      this.blinkStart();
      return;
    }
    this.lives--; this.combo = 0; this.inv = 1.2;
    this.mood('hurt', 1); flash(this, 0xff5c5c, 0.38, 200); sfx.hit();
    this.cameras.main.shake(220, 0.012);
    this.stretch(1.3, 0.7);
    const what = kind === 'spike' ? 'Gürültü dikeni!' : kind === 'cloud' ? 'Gürültü bulutu!' : 'Ototoksik damla!';
    floatText(this, HERO_X, this.heroY - 80, what, COLORS.coral);
    opts.onEvent({ type: 'haptic', kind: 'error' });
    this.hud.set(this.score, this.lives);
    if (this.lives <= 0) { this.gameOver(); return; }
    this.blinkStart();
  }
  blinkStart() {
    this.blink?.stop();
    this.blink = this.tweens.add({ targets: this.hero, alpha: 0.25, yoyo: true, repeat: -1, duration: 90 });
  }
  coinMiss() {
    if (this.combo >= 5) floatText(this, HERO_X + 60, this.heroY - 90, 'Kombo bitti', COLORS.muted);
    this.combo = 0;
  }

  // ---------------------------------------------------------------- skor / ui
  get score() { return this.meters + this.coinScore; }
  statusHide() { this.status.setVisible(false); }
  emitArcade() {
    (window as unknown as { __arcade?: { score: number; level: number } }).__arcade = { score: this.score, level: this.level };
  }
  bannerObj?: Phaser.GameObjects.Container;
  banner(text: string, sub: string, color: number) {
    this.bannerObj?.destroy();
    const c = this.add.container(W / 2, 300).setDepth(160).setScale(0.2).setAlpha(0);
    this.bannerObj = c;
    const bg = this.add.graphics(); bg.fillStyle(color, 0.95); bg.fillRoundedRect(-140, -38, 280, 76, 20);
    const t = this.add.text(0, -10, text, { fontFamily: FONT, fontSize: '28px', fontStyle: '800', color: '#ffffff' }).setOrigin(0.5);
    const s = this.add.text(0, 18, sub, { fontFamily: FONT, fontSize: '14px', fontStyle: '600', color: '#ffffff' }).setOrigin(0.5).setAlpha(0.9);
    c.add([bg, t, s]);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 320, ease: 'Back.Out' });
    this.tweens.add({ targets: c, alpha: 0, y: 270, delay: 1100, duration: 300, onComplete: () => { c.destroy(); if (this.bannerObj === c) this.bannerObj = undefined; } });
  }
  marker(text: string) {
    const t = this.add.text(W / 2, 130, text, { fontFamily: FONT, fontSize: '15px', fontStyle: '800', color: '#ffffff', backgroundColor: '#13162a', padding: { x: 12, y: 5 } }).setOrigin(0.5).setDepth(150).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, y: 140, duration: 250, ease: 'Cubic.Out' });
    this.tweens.add({ targets: t, alpha: 0, delay: 1600, duration: 400, onComplete: () => t.destroy() });
  }
  gameOver() {
    if (this.over) return;
    this.over = true;
    this.input.off('pointerdown', this.onDown, this); this.input.off('pointermove', this.onMove, this); this.input.off('pointerup', this.onUp, this);
    this.blink?.stop(); this.hero.setAlpha(1).setTexture(this.texHurt);
    this.status.setVisible(false); this.bannerObj?.destroy(); this.bannerObj = undefined;
    sfx.gameOver();
    const veil = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(300);
    this.tweens.add({ targets: veil, fillAlpha: 0.6, duration: 400 });
    const t = title(this, W / 2, 330, 'Oyun bitti', 44).setDepth(301).setScale(0.3);
    label(this, W / 2, 385, `${this.meters.toLocaleString('tr-TR')} m · ${this.coins} jeton · Seviye ${this.level}`, 18).setDepth(301);
    this.tweens.add({ targets: t, scale: 1, duration: 380, ease: 'Back.Out' });
    this.tweens.add({ targets: this.squash, y: 0.7, x: 1.25, duration: 300, ease: 'Bounce.Out' });
    const opts = getOpts(this);
    opts.onEvent({ type: 'haptic', kind: 'heavy' });
    this.emitArcade();
    this.time.delayedCall(1200, () => {
      opts.onEvent({ type: 'gameover', score: this.score, stats: { Mesafe: this.meters, Jeton: this.coins, Seviye: this.level }, label: this.meters >= APEX_M ? 'Apekse ulaştın!' : `${this.meters} m` });
    });
  }
}


export function mount(parent: HTMLElement, opts: ArcadeOptions): ArcadeHandle {
  return bootGame(parent, opts, [Play], '#f3f0ff');
}
