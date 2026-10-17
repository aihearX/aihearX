import Phaser from 'phaser';
import { COLORS, FONT, GAME_H, GAME_W, flash, floatText, getOpts, heroTexture, sfx, tapToStart, tonotopyColor, tonotopyFreq, type ArcadeOptions } from '../shared';
import { PLAT, buildTextures } from './textures';
import { METER_PX, ZONES, cochleaT, rankLabel, zoneAt } from './zones';

type PlatType = 'normal' | 'moving' | 'thin' | 'drum' | 'spring' | 'ghost';
type Plat = {
  img: Phaser.GameObjects.Image; type: PlatType; x: number; y: number; w: number; vx: number;
  alive: boolean; broken: boolean; serumen: Phaser.GameObjects.Image | null; ghostT: number;
};
type EnemyKind = 'bakteri' | 'bulut';
type Enemy = { img: Phaser.GameObjects.Image; kind: EnemyKind; x0: number; y: number; t: number; alive: boolean; amp: number; speed: number; touched: boolean };
type PickKind = 'coin' | 'ammo' | 'shield' | 'jet';
type Pickup = { img: Phaser.GameObjects.Image; kind: PickKind; alive: boolean; t: number; y0: number };
type Bullet = { img: Phaser.GameObjects.Image; alive: boolean };

const W = GAME_W, H = GAME_H;
const GRAV = 1400;
const V_NORMAL = -850, V_SERUMEN = -780, V_SPRING = -1150, V_DRUM = -1500, V_JET = -950;
const HERO_R = 26;
const MAX_VX = 420;

function rgb(c: number): [number, number, number] { return [(c >> 16) & 255, (c >> 8) & 255, c & 255]; }

export class PlayScene extends Phaser.Scene {
  private opts!: ArcadeOptions;
  private rng!: Phaser.Math.RandomDataGenerator;
  private ts = 1;

  private hero!: Phaser.GameObjects.Image;
  private hx = W / 2; private hy = 0; private vx = 0; private vy = 0; private prevFeet = 0;
  private startY = H - 90; private minY = 0;
  private started = false; private over = false; private dying = false;
  private elapsed = 0; private realElapsed = 0;

  private plats: Plat[] = []; private enemies: Enemy[] = []; private pickups: Pickup[] = []; private bullets: Bullet[] = [];
  private genY = 0; private rowIndex = 0; private lastType: PlatType = 'normal';

  private coins = 0; private ammo = 3; private maxM = 0; private zoneIdx = 0;
  private combo = 0; private sticky = 0; private jetT = 0; private shieldT = 0; private shotCd = 0; private cloudCd = 0;
  private jetImg!: Phaser.GameObjects.Image; private shieldImg!: Phaser.GameObjects.Image;
  private squash?: Phaser.Tweens.Tween;

  private bg!: Phaser.GameObjects.Rectangle; private bgColor = 0xffe4d0; private bgTarget = 0xffe4d0;
  private far: Phaser.GameObjects.TileSprite[] = []; private near: Phaser.GameObjects.TileSprite[] = [];
  private bolt!: Phaser.GameObjects.Graphics; private boltT = 0;

  private hudM!: Phaser.GameObjects.Text; private hudZone!: Phaser.GameObjects.Text; private hudCoins!: Phaser.GameObjects.Text;
  private btn!: Phaser.GameObjects.Container; private btnBadge!: Phaser.GameObjects.Text;
  private buttonPointers = new Set<number>();
  private hint: Phaser.GameObjects.Text[] = [];

  private pGold!: Phaser.GameObjects.Particles.ParticleEmitter; private pViolet!: Phaser.GameObjects.Particles.ParticleEmitter;
  private pGreen!: Phaser.GameObjects.Particles.ParticleEmitter; private pGray!: Phaser.GameObjects.Particles.ParticleEmitter;
  private pJet!: Phaser.GameObjects.Particles.ParticleEmitter; private pSpark!: Phaser.GameObjects.Particles.ParticleEmitter;
  private pRose!: Phaser.GameObjects.Particles.ParticleEmitter;

  /** Harness: tüm bölgeleri 14 s içinde görmek için otomatik jetpack anları (yalnızca debug) */
  private debugJets = [2.5, 5.5, 8.5, 11.5];

  constructor() { super('play'); }

  create() {
    this.opts = getOpts(this);
    this.rng = new Phaser.Math.RandomDataGenerator([String(this.opts.seed ?? 1)]);
    this.ts = this.opts.debug ? 2 : 1;
    buildTextures(this);
    const cam = this.cameras.main; cam.scrollY = 0;

    // arka plan
    this.bg = this.add.rectangle(W / 2, H / 2, W, H, ZONES[0].base).setScrollFactor(0).setDepth(-20);
    this.bgColor = ZONES[0].base; this.bgTarget = ZONES[0].base;
    this.mountLayers(0, true);
    this.bolt = this.add.graphics().setScrollFactor(0).setDepth(-3);

    // parçacıklar
    const mk = (tint: number, cfg: Partial<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> = {}) =>
      this.add.particles(0, 0, 'zz-dot', { speed: { min: 60, max: 220 }, angle: { min: 0, max: 360 }, lifespan: { min: 300, max: 600 }, scale: { start: 1, end: 0 }, alpha: { start: 1, end: 0 }, gravityY: 500, tint, emitting: false, ...cfg }).setDepth(25);
    this.pGold = mk(0xffc93c); this.pViolet = mk(0x8b6cf7); this.pGreen = mk(0x86d13f); this.pGray = mk(0xb0b7c6, { gravityY: 0, speed: { min: 30, max: 120 } });
    this.pRose = mk(0xf9c6cf, { speed: { min: 120, max: 320 }, angle: { min: 200, max: 340 } });
    this.pJet = mk(0x5eead4, { speed: { min: 80, max: 160 }, angle: { min: 70, max: 110 }, gravityY: 0, lifespan: { min: 200, max: 400 }, scale: { start: 0.9, end: 0 }, frequency: 30, quantity: 2 });
    this.pSpark = mk(0x9be7ff, { gravityY: 0, speed: { min: 20, max: 80 }, lifespan: { min: 400, max: 900 }, scale: { start: 0.6, end: 0 } }).setScrollFactor(0);

    // dünya
    this.genY = this.startY;
    this.spawnPlat('normal', W / 2, this.startY, 0).img.setScale(1.7, 1);
    this.plats[0].w = PLAT.normal.w * 1.7;
    while (this.genY > -1400) this.genRow();

    // kahraman Odi
    heroTexture(this, 'odi', 0x6c4cf1, HERO_R * 2 + 4, 'happy'); heroTexture(this, 'odi', 0x6c4cf1, HERO_R * 2 + 4, 'hurt'); heroTexture(this, 'odi', 0x6c4cf1, HERO_R * 2 + 4, 'wow');
    this.hx = W / 2; this.hy = this.startY - HERO_R; this.minY = this.hy; this.prevFeet = this.hy + HERO_R;
    this.hero = this.add.image(this.hx, this.hy, 'odi-happy').setDepth(20);
    this.jetImg = this.add.image(0, 0, 'zz-cihaz').setDepth(19).setVisible(false);
    this.shieldImg = this.add.image(0, 0, 'zz-shield').setDepth(21).setVisible(false);

    this.buildHud();
    this.bindInput();

    if (this.opts.debug) { this.time.delayedCall(300, () => this.start()); }
    else tapToStart(this, 'Başlamak için dokun', () => this.start());
  }

  // ---------- kurulum ----------
  private buildHud() {
    const bar = this.add.rectangle(W / 2, 36, W, 72, 0xffffff, 0.88).setScrollFactor(0).setDepth(100); bar.setStrokeStyle(1, 0xe6e8f0);
    this.hudM = this.add.text(16, 36, '0 m', { fontFamily: FONT, fontSize: '26px', fontStyle: '800', color: COLORS.text }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.hudZone = this.add.text(W / 2 + 10, 36, ZONES[0].name, { fontFamily: FONT, fontSize: '14px', fontStyle: '700', color: COLORS.muted }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this.add.image(W - 62, 36, 'zz-coin').setScale(0.85).setScrollFactor(0).setDepth(101);
    this.hudCoins = this.add.text(W - 46, 36, '0', { fontFamily: FONT, fontSize: '20px', fontStyle: '800', color: COLORS.amber }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

    // ses patlaması butonu
    this.btn = this.add.container(W / 2, H - 66).setScrollFactor(0).setDepth(110);
    const base = this.add.image(0, 0, 'zz-btn'); const icon = this.add.image(0, -2, 'zz-ammo').setScale(0.95);
    const badgeBg = this.add.circle(24, -22, 12, 0x13162a, 1);
    this.btnBadge = this.add.text(24, -22, String(this.ammo), { fontFamily: FONT, fontSize: '14px', fontStyle: '800', color: '#ffffff' }).setOrigin(0.5);
    this.btn.add([base, icon, badgeBg, this.btnBadge]);
    this.btn.setInteractive(new Phaser.Geom.Circle(0, 0, 36), Phaser.Geom.Circle.Contains);
    this.btn.on('pointerdown', (p: Phaser.Input.Pointer) => { this.buttonPointers.add(p.id); if (this.started) this.shoot(); });

    const h1 = this.add.text(W / 2, H - 150, '◀  Sol / sağ yarıya basılı tut  ▶', { fontFamily: FONT, fontSize: '17px', fontStyle: '700', color: COLORS.text, backgroundColor: 'rgba(255,255,255,0.85)', padding: { x: 12, y: 6 } }).setOrigin(0.5).setScrollFactor(0).setDepth(120);
    const h2 = this.add.text(W / 2, H - 116, 'İki parmakla dokun veya butona bas: ses patlaması', { fontFamily: FONT, fontSize: '13px', fontStyle: '600', color: COLORS.muted, backgroundColor: 'rgba(255,255,255,0.85)', padding: { x: 10, y: 4 } }).setOrigin(0.5).setScrollFactor(0).setDepth(120);
    this.hint = [h1, h2];
  }

  private bindInput() {
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => { this.buttonPointers.delete(p.id); });
    this.input.on('pointerdown', () => {
      if (!this.started) return;
      let n = 0;
      for (const p of this.input.manager.pointers) if (p.isDown && !this.buttonPointers.has(p.id)) n++;
      if (n >= 2) this.shoot();
    });
  }

  private start() {
    this.started = true;
    this.tweens.add({ targets: this.hint, alpha: 0, delay: 5000, duration: 600, onComplete: () => this.hint.forEach((t) => t.destroy()) });
    this.vy = V_NORMAL; this.squashNow();
    sfx.jump();
    this.banner(ZONES[0].name, ZONES[0].sub, ZONES[0].accent);
  }

  // ---------- üretim ----------
  private obtain<T extends { alive: boolean; img: Phaser.GameObjects.Image }>(list: T[], make: () => T): T {
    for (const o of list) if (!o.alive) { o.alive = true; o.img.setActive(true).setVisible(true).setAlpha(1).setScale(1).setAngle(0); return o; }
    const o = make(); list.push(o); return o;
  }

  private spawnPlat(type: PlatType, x: number, y: number, m: number): Plat {
    const tex = PLAT[type];
    const p = this.obtain(this.plats, () => ({ img: this.add.image(0, 0, tex.key).setDepth(10), type, x, y, w: tex.w, vx: 0, alive: true, broken: false, serumen: null, ghostT: 0 }));
    p.type = type; p.x = x; p.y = y; p.w = tex.w; p.vx = 0; p.broken = false; p.ghostT = this.rng.realInRange(0, 3);
    if (p.serumen) { p.serumen.setVisible(false).setActive(false); p.serumen = null; }
    p.img.setTexture(tex.key).setPosition(x, y).setOrigin(0.5, 0).clearTint();
    if (type === 'normal') p.img.setTint(ZONES[zoneAt(m)].platTint);
    if (type === 'moving') { const sp = 60 + 100 * Math.min(1, m / 4000); p.vx = this.rng.frac() < 0.5 ? -sp : sp; }
    return p;
  }

  private spawnEnemy(kind: EnemyKind, x: number, y: number, m: number) {
    const e = this.obtain(this.enemies, () => ({ img: this.add.image(0, 0, kind === 'bakteri' ? 'zz-bakteri' : 'zz-bulut').setDepth(15), kind, x0: x, y, t: 0, alive: true, amp: 0, speed: 1, touched: false }));
    e.kind = kind; e.x0 = x; e.y = y; e.t = this.rng.realInRange(0, 6); e.touched = false;
    e.amp = kind === 'bakteri' ? 40 + 60 * this.rng.frac() : 30; e.speed = kind === 'bakteri' ? 1.2 + Math.min(1, m / 4000) * 1.5 : 0.5;
    e.img.setTexture(kind === 'bakteri' ? 'zz-bakteri' : 'zz-bulut').setPosition(x, y);
  }

  private spawnPickup(kind: PickKind, x: number, y: number) {
    const key = kind === 'coin' ? 'zz-coin' : kind === 'ammo' ? 'zz-ammo' : kind === 'shield' ? 'zz-implant' : 'zz-cihaz';
    const pk = this.obtain(this.pickups, () => ({ img: this.add.image(0, 0, key).setDepth(12), kind, alive: true, t: 0, y0: y }));
    pk.kind = kind; pk.y0 = y; pk.t = this.rng.realInRange(0, 6);
    pk.img.setTexture(key).setPosition(x, y).setScale(kind === 'coin' ? 1 : 1.15);
  }

  private genRow() {
    const m = (this.startY - this.genY) / METER_PX;
    const p = Math.max(0, Math.min(1, m / 4000));
    const zone = ZONES[zoneAt(m)].id;
    const gap = this.rng.between(Math.round(62 + 48 * p), Math.round(130 + 68 * p));
    const y = this.genY - gap;
    const x = this.rng.between(44, W - 44);

    const w: [PlatType, number][] = [['normal', 10]];
    if (m > 150) w.push(['moving', 1.5 + 5 * p]);
    if (m > 80) w.push(['drum', 0.9]);
    if (m > 120) w.push(['spring', zone === 'koklea' ? 2.2 : 1]);
    if (m > 2000 && this.lastType !== 'ghost') w.push(['ghost', 2.2]);
    let total = 0; for (const [, k] of w) total += k;
    let r = this.rng.frac() * total; let type: PlatType = 'normal';
    for (const [t, k] of w) { r -= k; if (r <= 0) { type = t; break; } }
    const plat = this.spawnPlat(type, x, y, m);
    this.lastType = type;

    if (type === 'normal' && m > 300 && this.rng.frac() < 0.06 + 0.1 * p) {
      const s = this.add.image(x, y - 10, 'zz-serumen').setDepth(11).setActive(true).setVisible(true);
      plat.serumen = s;
    }

    // ekstra: ince zar
    if (m > 200 && this.rng.frac() < 0.2 + 0.3 * p) {
      let ex = this.rng.between(44, W - 44); if (Math.abs(ex - x) < 90) ex = (ex + W / 2) % (W - 88) + 44;
      this.spawnPlat('thin', ex, y + gap * 0.5, m);
    }

    // düşman
    const midY = y + gap * 0.5;
    if (m > 250 && this.rng.frac() < 0.03 + 0.1 * p) {
      let ex = this.rng.between(50, W - 50); if (Math.abs(ex - x) < 80) ex = (ex + W / 2) % (W - 100) + 50;
      this.spawnEnemy('bakteri', ex, midY - 10, m);
    } else if (m > 600 && this.rng.frac() < 0.03 + 0.07 * p) {
      this.spawnEnemy('bulut', this.rng.between(60, W - 60), midY, m);
    }

    // toplanabilir
    const f = this.rng.frac();
    if (this.rowIndex === 6) this.spawnPickup('ammo', x, y - 34);
    else if (this.rowIndex === 16) this.spawnPickup('jet', x, y - 34);
    else if (f < 0.26 && type !== 'moving') { this.spawnPickup('coin', x - 26, y - 44); this.spawnPickup('coin', x, y - 54); this.spawnPickup('coin', x + 26, y - 44); }
    else if (f < 0.31 && m > 150) this.spawnPickup('ammo', x, y - 34);
    else if (f < 0.34 && m > 400) this.spawnPickup('shield', x, y - 34);
    else if (f < 0.36 && m > 300) this.spawnPickup('jet', x, y - 34);

    this.genY = y; this.rowIndex++;
  }

  // ---------- döngü ----------
  update(_t: number, deltaMs: number) {
    const dt = (Math.min(deltaMs, 40) / 1000) * this.ts;
    const cam = this.cameras.main;
    this.updateBackground(dt, cam.scrollY);
    if (!this.started || this.over) return;
    this.elapsed += dt; this.realElapsed += deltaMs / 1000;

    // giriş
    let dir = 0;
    if (this.opts.debug) dir = this.aiDir();
    else for (const p of this.input.manager.pointers) { if (p.isDown && !this.buttonPointers.has(p.id)) { dir = p.x < W / 2 ? -1 : 1; break; } }
    if (this.dying) dir = 0;
    const maxV = MAX_VX * (this.sticky > 0 ? 0.5 : 1);
    const target = dir * maxV;
    this.vx += (target - this.vx) * Math.min(1, dt * (dir ? 9 : 6));
    if (this.sticky > 0) this.sticky -= dt;
    if (this.shotCd > 0) this.shotCd -= dt;
    if (this.cloudCd > 0) this.cloudCd -= dt;

    // jetpack / kalkan
    if (this.jetT > 0) { this.jetT -= dt; this.vy = V_JET; if (this.jetT <= 0) this.endJet(); }
    if (this.shieldT > 0) { this.shieldT -= dt; if (this.shieldT <= 0) { this.shieldImg.setVisible(false); } }

    // fizik
    this.vy += GRAV * dt;
    if (this.jetT > 0) this.vy = V_JET;
    this.hx += this.vx * dt; this.hy += this.vy * dt;
    if (this.hx < -HERO_R) this.hx += W + HERO_R * 2; else if (this.hx > W + HERO_R) this.hx -= W + HERO_R * 2;
    const feet = this.hy + HERO_R;

    // platformlar
    const bottom = cam.scrollY + H + 140;
    for (const p of this.plats) {
      if (!p.alive) continue;
      if (p.y > bottom) { this.killPlat(p); continue; }
      if (p.type === 'moving') {
        p.x += p.vx * dt;
        if (p.x < 44) { p.x = 44; p.vx = Math.abs(p.vx); } else if (p.x > W - 44) { p.x = W - 44; p.vx = -Math.abs(p.vx); }
        p.img.x = p.x;
      } else if (p.type === 'ghost') {
        p.ghostT = (p.ghostT + dt) % 3.4;
        const a = p.ghostT < 2.2 ? 1 : p.ghostT < 2.5 ? 1 - (p.ghostT - 2.2) / 0.3 : p.ghostT < 3.1 ? 0 : (p.ghostT - 3.1) / 0.3;
        p.img.setAlpha(Math.max(0.05, a));
      }
      if (p.serumen) { p.serumen.x = p.x; }
      if (this.dying || p.broken || this.jetT > 0 || this.vy <= 0) continue;
      if (p.type === 'ghost' && p.img.alpha < 0.5) continue;
      const top = p.y;
      if (this.prevFeet <= top + 6 && feet >= top - 2 && Math.abs(this.hx - p.x) < p.w / 2 + 12) this.land(p);
    }
    this.prevFeet = this.hy + HERO_R;

    // düşmanlar
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.y > bottom) { e.alive = false; e.img.setActive(false).setVisible(false); continue; }
      e.t += dt;
      if (e.kind === 'bakteri') { e.img.x = e.x0 + Math.sin(e.t * e.speed) * e.amp; e.img.y = e.y + Math.sin(e.t * 2.3) * 5; e.img.setFlipX(Math.cos(e.t * e.speed) < 0); }
      else { e.x0 += 28 * dt; if (e.x0 > W + 60) e.x0 = -60; e.img.x = e.x0; e.img.y = e.y + Math.sin(e.t * 1.4) * 6; }
      if (this.dying) continue;
      const dx = this.hx - e.img.x, dy = this.hy - e.img.y;
      if (e.kind === 'bakteri') {
        if (dx * dx + dy * dy < 46 * 46) {
          if (this.jetT > 0 || this.shieldT > 0) { this.killEnemy(e); if (this.jetT <= 0) { this.shieldT = 0; this.shieldImg.setVisible(false); floatText(this, this.hx, this.hy - 50, 'Kalkan kırıldı', COLORS.coral); } }
          else this.die();
        }
      } else if (Math.abs(dx) < 50 && Math.abs(dy) < 32 && this.jetT <= 0) {
        this.vy = Math.max(this.vy, 0) + 2600 * dt; this.vx *= 0.9;
        if (this.cloudCd <= 0) { this.cloudCd = 0.8; sfx.hit(); this.cameras.main.shake(120, 0.004); floatText(this, this.hx, this.hy - 50, 'Gürültü!', '#5d6378'); }
      }
    }

    // toplanabilirler
    for (const pk of this.pickups) {
      if (!pk.alive) continue;
      if (pk.y0 > bottom) { pk.alive = false; pk.img.setActive(false).setVisible(false); continue; }
      pk.t += dt; pk.img.y = pk.y0 + Math.sin(pk.t * 3) * 4;
      if (this.dying) continue;
      const dx = this.hx - pk.img.x, dy = this.hy - pk.img.y;
      if (dx * dx + dy * dy < 40 * 40) this.collect(pk);
    }

    // mermiler
    for (const b of this.bullets) {
      if (!b.alive) continue;
      b.img.y -= 1000 * dt;
      if (b.img.y < cam.scrollY - 40) { b.alive = false; b.img.setActive(false).setVisible(false); continue; }
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const dx = b.img.x - e.img.x, dy = b.img.y - e.img.y;
        if (Math.abs(dx) < (e.kind === 'bulut' ? 48 : 30) && Math.abs(dy) < 30) { this.killEnemy(e); b.alive = false; b.img.setActive(false).setVisible(false); break; }
      }
    }

    // kahraman görseli
    this.hero.setPosition(this.hx, this.hy);
    if (Math.abs(this.vx) > 30) this.hero.setFlipX(this.vx < 0);
    if (this.jetT > 0) { this.jetImg.setVisible(true).setPosition(this.hx + (this.hero.flipX ? 22 : -22), this.hy + 4).setFlipX(!this.hero.flipX); }
    if (this.shieldT > 0) { this.shieldImg.setVisible(true).setPosition(this.hx, this.hy).setAlpha(this.shieldT < 3 ? (Math.sin(this.elapsed * 14) > 0 ? 0.9 : 0.3) : 0.9); }

    // kamera (sadece yukarı)
    if (!this.dying) {
      const want = this.hy - H * 0.5;
      if (want < cam.scrollY) cam.scrollY += (want - cam.scrollY) * Math.min(1, dt * 9);
      if (this.hy - cam.scrollY < 130) cam.scrollY = this.hy - 130;
    }
    while (this.genY > cam.scrollY - 1400) this.genRow();

    // yükseklik, bölge
    if (this.hy < this.minY) this.minY = this.hy;
    const m = Math.floor((this.startY - this.minY) / METER_PX);
    if (m !== this.maxM) { this.maxM = m; this.hudM.setText(`${m.toLocaleString('tr-TR')} m`); }
    const zi = zoneAt(m);
    if (zi !== this.zoneIdx) this.enterZone(zi);
    if (ZONES[this.zoneIdx].id === 'koklea') {
      const [r, g, b] = rgb(tonotopyColor(cochleaT(m)));
      this.bgTarget = Phaser.Display.Color.GetColor(Math.round(r * 0.35 + 255 * 0.65), Math.round(g * 0.35 + 255 * 0.65), Math.round(b * 0.35 + 255 * 0.65));
    }

    // düşüş = oyun bitti
    if (this.hy > cam.scrollY + H + 60) this.gameOver();

    // debug
    if (this.opts.debug) this.debugTick();
  }

  // ---------- etkileşimler ----------
  private land(p: Plat) {
    let v = V_NORMAL;
    const zone = ZONES[this.zoneIdx].id;
    this.hy = p.y - HERO_R + 2;
    if (p.type === 'drum') {
      v = V_DRUM; sfx.bounce(); this.haptic('medium');
      this.pRose.explode(18, p.x, p.y);
      const ring = this.add.image(p.x, p.y + 10, 'zz-ring').setDepth(14).setTint(0xf9c6cf).setScale(0.4);
      this.tweens.add({ targets: ring, scaleX: 2.6, scaleY: 1.2, alpha: 0, duration: 500, ease: 'Cubic.Out', onComplete: () => ring.destroy() });
      this.hero.setTexture('odi-wow'); this.time.delayedCall(600, () => { if (!this.dying) this.hero.setTexture('odi-happy'); });
      floatText(this, p.x, p.y - 30, 'Kulak zarı!', COLORS.coral);
    } else if (p.type === 'spring') {
      v = V_SPRING; sfx.doubleJump(); this.pViolet.explode(14, p.x, p.y + 8); this.haptic('light');
    } else if (p.type === 'thin') {
      this.breakPlat(p);
    }
    if (p.serumen) { v = V_SERUMEN; this.sticky = 1.6; sfx.tick(); floatText(this, p.x, p.y - 24, 'Yapışkan serumen', '#b8860b'); }
    if (zone === 'koklea') sfx.toneAt(tonotopyFreq(cochleaT(this.maxM)), 0.14);
    else if (p.type === 'normal' || p.type === 'moving' || p.type === 'ghost' || p.type === 'thin') sfx.jump();
    this.vy = v;
    this.squashNow();
    // mükemmel sıçrama
    if (p.type !== 'thin' && Math.abs(this.hx - p.x) <= p.w * 0.17) {
      this.combo++;
      floatText(this, Phaser.Math.Clamp(this.hx, 80, W - 80), this.hy - 44, this.combo >= 2 ? `Mükemmel ×${this.combo}` : 'Mükemmel!', COLORS.accent2);
      if (this.combo === 3) {
        this.coins += 3; this.hudCoins.setText(String(this.coins));
        this.banner('3 Ardışık Mükemmel Sıçrama!', '+3 jeton', 0x0e9c98, 22, 13);
        sfx.power(); this.haptic('light'); this.combo = 0;
        this.pGold.explode(20, this.hx, this.hy);
      }
    } else this.combo = 0;
    // platform tepki
    this.tweens.add({ targets: p.img, scaleY: 0.78, duration: 70, yoyo: true });
  }

  private squashNow() {
    this.squash?.stop();
    this.hero.setScale(1.28, 0.74);
    this.squash = this.tweens.add({ targets: this.hero, scaleX: 1, scaleY: 1, duration: 260, ease: 'Back.Out' });
  }

  private breakPlat(p: Plat) {
    p.broken = true; p.img.setTexture(PLAT.thinCrack.key);
    sfx.hit();
    this.time.delayedCall(90, () => {
      this.tweens.add({ targets: p.img, y: p.y + 60, angle: this.rng.frac() < 0.5 ? -16 : 16, alpha: 0, duration: 420, ease: 'Quad.In', onComplete: () => this.killPlat(p) });
    });
  }

  private killPlat(p: Plat) {
    p.alive = false; p.img.setActive(false).setVisible(false);
    if (p.serumen) { p.serumen.destroy(); p.serumen = null; }
  }

  private killEnemy(e: Enemy) {
    e.alive = false; e.img.setActive(false).setVisible(false);
    if (e.kind === 'bakteri') { this.pGreen.explode(16, e.img.x, e.img.y); this.coins += 2; this.hudCoins.setText(String(this.coins)); floatText(this, e.img.x, e.img.y - 20, '+10', COLORS.accent2); sfx.coin(); }
    else { this.pGray.explode(22, e.img.x, e.img.y); floatText(this, e.img.x, e.img.y - 20, 'Sessizlik', '#5d6378'); sfx.tick(); }
    this.haptic('light');
  }

  private collect(pk: Pickup) {
    pk.alive = false; pk.img.setActive(false).setVisible(false);
    const x = pk.img.x, y = pk.img.y;
    if (pk.kind === 'coin') { this.coins++; this.hudCoins.setText(String(this.coins)); sfx.coin(); this.pGold.explode(5, x, y); return; }
    sfx.power(); this.haptic('success'); this.pGold.explode(16, x, y);
    if (pk.kind === 'ammo') { this.ammo = Math.min(9, this.ammo + 3); this.updateBadge(); floatText(this, x, y - 30, '+3 ses patlaması', '#f97316'); }
    else if (pk.kind === 'shield') { this.shieldT = 15; floatText(this, x, y - 30, 'Koklear implant: kalkan!', COLORS.accent); }
    else this.startJet();
  }

  private startJet() {
    this.jetT = 2; this.vy = V_JET; this.hero.setTexture('odi-wow');
    this.pJet.startFollow(this.hero, 0, 24); this.pJet.start();
    floatText(this, this.hx, this.hy - 40, 'İşitme cihazı: uçuş!', '#14a39e');
    flash(this, 0x5eead4, 0.25, 220);
  }
  private endJet() {
    this.jetT = 0; this.jetImg.setVisible(false); this.pJet.stop(); this.pJet.stopFollow();
    if (!this.dying) this.hero.setTexture('odi-happy');
  }

  private shoot() {
    if (this.over || this.dying || this.shotCd > 0) return;
    if (this.ammo <= 0) { sfx.tick(); this.tweens.add({ targets: this.btn, x: W / 2 + 5, duration: 40, yoyo: true, repeat: 3 }); return; }
    this.ammo--; this.updateBadge(); this.shotCd = 0.22;
    const b = this.obtain(this.bullets, () => ({ img: this.add.image(0, 0, 'zz-bullet').setDepth(18), alive: true }));
    b.img.setPosition(this.hx, this.hy - 30);
    sfx.doubleJump();
    this.tweens.add({ targets: this.btn, scaleX: 0.88, scaleY: 0.88, duration: 60, yoyo: true });
  }

  private updateBadge() { this.btnBadge.setText(String(this.ammo)); this.btn.setAlpha(this.ammo > 0 ? 1 : 0.55); }

  private die() {
    if (this.dying) return;
    this.dying = true; this.combo = 0;
    this.hero.setTexture('odi-hurt'); this.vy = -250; this.vx = 0;
    if (this.jetT > 0) this.endJet();
    sfx.hit(); flash(this, 0xff5c5c, 0.35, 220); this.cameras.main.shake(260, 0.012); this.haptic('error');
    this.tweens.add({ targets: this.hero, angle: 360, duration: 900, repeat: -1 });
  }

  private gameOver() {
    if (this.over) return;
    this.over = true; this.pJet.stop();
    if (!this.dying) { this.hero.setTexture('odi-hurt'); this.haptic('error'); flash(this, 0xff5c5c, 0.3, 260); this.cameras.main.shake(240, 0.01); }
    sfx.gameOver();
    const zone = ZONES[this.zoneIdx];
    const t1 = this.add.text(W / 2, H * 0.42, 'Oyun bitti', { fontFamily: FONT, fontSize: '44px', fontStyle: '800', color: COLORS.text, backgroundColor: 'rgba(255,255,255,0.9)', padding: { x: 20, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);
    const t2 = this.add.text(W / 2, H * 0.42 + 54, `${this.maxM.toLocaleString('tr-TR')} m · ${zone.name}`, { fontFamily: FONT, fontSize: '18px', fontStyle: '700', color: COLORS.muted, backgroundColor: 'rgba(255,255,255,0.9)', padding: { x: 12, y: 4 } }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);
    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 300 });
    const score = this.maxM + this.coins * 5;
    this.time.delayedCall(1100, () => {
      this.opts.onEvent({ type: 'gameover', score, stats: { Yükseklik: this.maxM, Jeton: this.coins, Bölge: zone.name }, label: rankLabel(this.maxM) });
    });
  }

  private haptic(kind: 'light' | 'medium' | 'heavy' | 'success' | 'error') { this.opts.onEvent({ type: 'haptic', kind }); }

  // ---------- bölge ve arka plan ----------
  private enterZone(i: number) {
    this.zoneIdx = i;
    const z = ZONES[i];
    this.hudZone.setText(z.name); this.bgTarget = z.base;
    this.hudZone.setColor(z.id === 'sinir' ? COLORS.text : COLORS.muted);
    this.mountLayers(i, false);
    this.banner(z.name, z.sub, z.accent);
    sfx.levelUp(); this.haptic('medium');
  }

  private mountLayers(i: number, instant: boolean) {
    const z = ZONES[i];
    const old = [...this.far, ...this.near];
    const f = this.add.tileSprite(W / 2, H / 2, W, H, `zz-bgF-${z.id}`).setScrollFactor(0).setDepth(-10).setAlpha(instant ? 1 : 0);
    const n = this.add.tileSprite(W / 2, H / 2, W, H, `zz-bgN-${z.id}`).setScrollFactor(0).setDepth(-8).setAlpha(instant ? 1 : 0);
    this.far = [f]; this.near = [n];
    if (!instant) {
      this.tweens.add({ targets: [f, n], alpha: 1, duration: 1200 });
      this.tweens.add({ targets: old, alpha: 0, duration: 1200, onComplete: () => old.forEach((o) => o.destroy()) });
    }
  }

  private updateBackground(dt: number, scrollY: number) {
    if (this.bgColor !== this.bgTarget) {
      const a = rgb(this.bgColor), b = rgb(this.bgTarget);
      const k = Math.min(1, dt * 2.2);
      const c = Phaser.Display.Color.GetColor(Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k), Math.round(a[2] + (b[2] - a[2]) * k));
      this.bgColor = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 3 ? this.bgTarget : c;
      this.bg.setFillStyle(this.bgColor);
    }
    for (const f of this.far) f.tilePositionY = scrollY * 0.3;
    for (const n of this.near) n.tilePositionY = scrollY * 0.6;
    if (ZONES[this.zoneIdx].id === 'sinir' && this.started && !this.over) {
      this.boltT -= dt;
      if (this.boltT <= 0) {
        this.boltT = 0.9 + Math.random() * 1.4;
        const g = this.bolt; g.clear(); g.lineStyle(3, 0x9be7ff, 1);
        let x = 40 + Math.random() * (W - 80), y = 60 + Math.random() * 200;
        g.beginPath(); g.moveTo(x, y);
        for (let i = 0; i < 7; i++) { x += (Math.random() - 0.5) * 70; y += 30 + Math.random() * 30; g.lineTo(x, y); }
        g.strokePath(); g.setAlpha(1);
        this.tweens.add({ targets: g, alpha: 0, duration: 260, ease: 'Quad.Out' });
        this.pSpark.explode(10, x, y);
      }
    }
  }

  private banner(text: string, sub: string, color: number, size = 28, subSize = 14) {
    const c = this.add.container(W / 2, H * 0.3).setScrollFactor(0).setDepth(150);
    const bg = this.add.graphics();
    const hex = '#' + color.toString(16).padStart(6, '0');
    const t1 = this.add.text(4, -12, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: '800', color: hex }).setOrigin(0.5);
    const t2 = this.add.text(4, 18, sub, { fontFamily: FONT, fontSize: `${subSize}px`, fontStyle: '700', color: COLORS.muted }).setOrigin(0.5);
    const bw = Math.min(W - 24, Math.max(300, Math.max(t1.width, t2.width) + 64)), bh = 84;
    bg.fillStyle(0xffffff, 0.94); bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 22);
    bg.lineStyle(3, color, 1); bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 22);
    bg.fillStyle(color, 1); bg.fillRoundedRect(-bw / 2 + 14, -bh / 2 + 10, 6, bh - 20, 3);
    c.add([bg, t1, t2]); c.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, alpha: 1, duration: 380, ease: 'Back.Out' });
    this.tweens.add({ targets: c, alpha: 0, y: H * 0.3 - 30, delay: 1700, duration: 420, onComplete: () => c.destroy() });
  }

  // ---------- debug / yapay zeka ----------
  private aiDir(): number {
    if (this.dying) return 0;
    const reach = this.vy < 0 ? (this.vy * this.vy) / (2 * GRAV) : 0;
    const apex = this.hy - reach;
    const floor = this.cameras.main.scrollY + H - 40;
    let best: Plat | null = null; let bestScore = Infinity;
    for (const p of this.plats) {
      if (!p.alive || p.broken) continue;
      if (p.y < apex + HERO_R + 8 || p.y > floor) continue;
      if (p.type === 'ghost' && p.img.alpha < 0.8) continue;
      let s = p.y + (p.serumen ? 70 : 0) + (p.type === 'thin' ? 60 : 0);
      let dx = p.x - this.hx; if (Math.abs(dx) > W / 2) dx -= Math.sign(dx) * W;
      s += Math.abs(dx) * 0.25;
      if (this.ammo === 0) for (const pk of this.pickups) if (pk.alive && pk.kind === 'ammo' && Math.abs(pk.img.x - p.x) < 50 && pk.y0 < p.y && pk.y0 > p.y - 120) s -= 120;
      for (const e of this.enemies) if (e.alive && e.kind === 'bakteri' && Math.abs(e.img.x - p.x) < 60 && e.y < p.y && e.y > p.y - 220) s += 90;
      if (s < bestScore) { bestScore = s; best = p; }
    }
    // tehdit: üstte bakteri → ateş; yakınsa kaç
    let dodge = 0;
    for (const e of this.enemies) {
      if (!e.alive || e.kind !== 'bakteri') continue;
      const dy = this.hy - e.img.y; const ex = e.img.x - this.hx;
      if (dy > -20 && dy < 300 && Math.abs(ex) < 44 && this.ammo > 0) this.shoot();
      if (dy > -60 && dy < 150 && Math.abs(ex) < 95) dodge = ex > 0 ? -1 : 1;
    }
    if (dodge && this.jetT <= 0 && this.shieldT <= 0) return dodge;
    if (!best) return 0;
    let dx = best.x - this.hx; if (Math.abs(dx) > W / 2) dx -= Math.sign(dx) * W;
    if (best.type === 'moving') dx += best.vx * 0.3;
    return Math.abs(dx) < 6 ? 0 : Math.sign(dx);
  }

  private debugTick() {
    if (this.debugJets.length && this.realElapsed >= this.debugJets[0]) { this.debugJets.shift(); if (!this.dying) this.startJet(); }
    (window as unknown as { __arcade?: unknown }).__arcade = { score: this.maxM + this.coins * 5, zone: ZONES[this.zoneIdx].name };
    if (this.realElapsed >= 14 && !this.over) this.gameOver();
  }
}
