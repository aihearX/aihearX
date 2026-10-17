import Phaser from 'phaser';
import { bootGame, COLORS, flash, floatText, FONT, GAME_H, GAME_W, getOpts, heroTexture, Hud, label, sfx, title, tonotopyFreq, type ArcadeHandle, type ArcadeOptions } from '../shared';
import { LEVELS, TILE, levelByMode, type LevelDef } from './levels';
import { boneTexture, coinTexture, controlTextures, drawTiles, dropTexture, drumTexture, dustTexture, enemyTexture, flagTexture, gateTexture, goldCochleaTexture, isSolidChar, makeMidDecor, makeParallax, moverTexture, sparkTexture, springTexture, timedTexture } from './art';

/** Bölümler arası taşınan koşu durumu. */
type Run = { level: number; score: number; coins: number; lives: number; time: number; highest: number; unlocked: number; startedAt: number };

type Sprite = Phaser.Physics.Arcade.Sprite;
type Image = Phaser.Physics.Arcade.Image;
type Body = Phaser.Physics.Arcade.Body;

const DEBUG_END_MS = 14000;
const JUMP_BUFFER = 120;
const COYOTE = 100;
/** Yerdeyken kahramanın ekrandaki hedef y'si (HUD altı, kontrollerin üstü). */
const CAM_ANCHOR_Y = 470;

declare global { interface Window { __arcade?: { score: number; level: number } } }

const PMath = Phaser.Math;
const PColor = Phaser.Display.Color;

function run(scene: Phaser.Scene): Run { return scene.registry.get('run') as Run; }

/* ------------------------------------------------------------------ */
/* Menü: bölüm seçimi                                                  */
/* ------------------------------------------------------------------ */
class Menu extends Phaser.Scene {
  constructor() { super('menu'); }
  create() {
    const opts = getOpts(this);
    const w = GAME_W;
    const start = levelByMode(opts.mode);
    let r = this.registry.get('run') as Run | undefined;
    if (!r) {
      r = { level: start.index, score: 0, coins: 0, lives: 3, time: 0, highest: start.index, unlocked: start.index, startedAt: performance.now() };
      this.registry.set('run', r);
    }
    this.cameras.main.setBackgroundColor('#ffffff');
    const bg = this.add.graphics();
    bg.fillStyle(0xf3efff, 1); bg.fillCircle(w * 0.85, 120, 160);
    bg.fillStyle(0xe6f7f6, 1); bg.fillCircle(w * 0.1, GAME_H - 160, 140);

    const hero = this.add.image(w / 2, 118, heroTexture(this, 'odi', 0x6c4cf1, 64, 'happy'));
    this.tweens.add({ targets: hero, y: 108, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const ring = this.add.graphics({ x: w / 2, y: 118 }); ring.lineStyle(3, 0x6c4cf1, 0.35); ring.strokeCircle(0, 0, 46); ring.lineStyle(2, 0x6c4cf1, 0.18); ring.strokeCircle(0, 0, 60);
    this.tweens.add({ targets: ring, scale: 1.25, alpha: 0, duration: 1400, repeat: -1 });

    title(this, w / 2, 196, 'Kulak Yolculuğu', 36);
    label(this, w / 2, 236, "Odi'yi dış kulaktan beyne taşı. Sesi teslim et!", 15);

    const unlocked = r.unlocked;
    LEVELS.forEach((lv, i) => {
      const y = 300 + i * 92;
      const open = lv.index <= unlocked;
      const c = this.add.container(w / 2, y);
      const g = this.add.graphics();
      g.fillStyle(open ? 0xffffff : 0xf3f4f8, 1); g.fillRoundedRect(-w / 2 + 20, -36, w - 40, 72, 18);
      g.lineStyle(2, open ? (lv.index === r!.level ? 0x6c4cf1 : 0xe6e8f0) : 0xe6e8f0, 1); g.strokeRoundedRect(-w / 2 + 20, -36, w - 40, 72, 18);
      g.fillStyle(open ? 0x6c4cf1 : 0xc3c7d4, 1); g.fillCircle(-w / 2 + 56, 0, 22);
      const num = this.add.text(-w / 2 + 56, 0, open ? `${lv.index}` : '🔒', { fontFamily: FONT, fontSize: '20px', fontStyle: '800', color: '#ffffff' }).setOrigin(0.5);
      const name = this.add.text(-w / 2 + 92, -14, lv.name, { fontFamily: FONT, fontSize: '19px', fontStyle: '800', color: open ? COLORS.text : '#9aa0b4' }).setOrigin(0, 0.5);
      const hint = this.add.text(-w / 2 + 92, 12, open ? lv.hint : 'Önceki bölümü bitir', { fontFamily: FONT, fontSize: '13px', fontStyle: '600', color: COLORS.muted }).setOrigin(0, 0.5);
      c.add([g, num, name, hint]);
      c.setSize(w - 40, 72);
      if (open) {
        c.setInteractive({ useHandCursor: true });
        c.on('pointerdown', () => this.startLevel(lv));
      } else c.setAlpha(0.7);
    });

    label(this, w / 2, GAME_H - 72, 'Sol / sağ: yürü · Üste dokun veya ZIPLA: zıpla', 13);
    label(this, w / 2, GAME_H - 46, 'Bir bölüme dokunarak başla', 15, COLORS.accent);

    if (opts.debug) this.time.delayedCall(600, () => this.startLevel(start));
  }
  startLevel(lv: LevelDef) {
    const r = run(this);
    r.level = lv.index; r.score = 0; r.coins = 0; r.lives = 3; r.time = 0; r.highest = Math.max(r.highest, lv.index);
    sfx.tick();
    this.scene.start('play');
  }
}

/* ------------------------------------------------------------------ */
/* Oyun                                                                */
/* ------------------------------------------------------------------ */
class Play extends Phaser.Scene {
  lv!: LevelDef;
  grid: string[][] = [];
  cols = 0; rows = 0; worldW = 0; worldH = 0;
  hero!: Sprite;
  hud!: Hud;
  solids!: Phaser.Physics.Arcade.StaticGroup;
  oneway!: Phaser.Physics.Arcade.StaticGroup;
  wax!: Phaser.Physics.Arcade.StaticGroup;
  hazards!: Phaser.Physics.Arcade.StaticGroup;
  coins!: Phaser.Physics.Arcade.StaticGroup;
  enemies!: Phaser.Physics.Arcade.Group;
  drops!: Phaser.Physics.Arcade.Group;
  movers!: Phaser.Physics.Arcade.Group;
  bouncers!: Phaser.Physics.Arcade.StaticGroup;
  timed: { img: Image; phase: number }[] = [];
  orbits: { img: Image; cx: number; cy: number; r: number; a0: number; label: Phaser.GameObjects.Text }[] = [];
  coinBase = new Map<Phaser.GameObjects.GameObject, number>();
  checkpoint = { x: 0, y: 0 };
  flags: { img: Phaser.GameObjects.Image; x: number; on: boolean }[] = [];
  exit!: Phaser.GameObjects.Image;
  gold?: Phaser.GameObjects.Image;
  parallax!: Phaser.GameObjects.TileSprite;
  sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  dust!: Phaser.GameObjects.Particles.ParticleEmitter;
  tint?: Phaser.GameObjects.Rectangle;

  // kontrol
  ctl = { left: false, right: false, jumpHeld: false, jumpPointer: -1 };
  jumpBufferedAt = -1e9; groundedAt = -1e9; jumpedAt = -1e9;
  facing = 1;
  stickyUntil = 0;
  invulnUntil = 0;
  wasGrounded = false;
  groundY = 0; camTX = 0; camTY = 0;
  done = false; frozen = false;
  elapsed = 0;
  ctlLeft!: Phaser.GameObjects.Image; ctlRight!: Phaser.GameObjects.Image; ctlJump!: Phaser.GameObjects.Image;
  hint?: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;
  lastTimerSec = -1;

  constructor() { super('play'); }

  create() {
    const r = run(this);
    this.lv = LEVELS[Math.min(LEVELS.length, Math.max(1, r.level)) - 1];
    const th = this.lv.theme;
    this.grid = this.lv.map.map((row) => row.split(''));
    this.rows = this.grid.length; this.cols = this.grid[0].length;
    this.worldW = this.cols * TILE; this.worldH = this.rows * TILE;
    this.done = false; this.frozen = false; this.elapsed = 0; this.timed = []; this.orbits = []; this.flags = []; this.coinBase.clear();
    this.ctl = { left: false, right: false, jumpHeld: false, jumpPointer: -1 };
    this.jumpBufferedAt = -1e9; this.groundedAt = -1e9; this.jumpedAt = -1e9; this.invulnUntil = 0; this.stickyUntil = 0;
    this.gold = undefined; this.lastTimerSec = -1;

    this.physics.world.gravity.y = th.gravity;
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH + 600);
    this.cameras.main.setBackgroundColor(PColor.IntegerToColor(th.bg).rgba);
    this.parallax = makeParallax(this, th);
    makeMidDecor(this, th, this.worldW);
    drawTiles(this, `ky-tiles-${this.lv.id}`, this.grid, th, 260).setDepth(0);

    this.solids = this.physics.add.staticGroup();
    this.oneway = this.physics.add.staticGroup();
    this.wax = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.bouncers = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.movers = this.physics.add.group({ allowGravity: false, immovable: true });
    this.drops = this.physics.add.group({ maxSize: 14 });

    this.buildWorld();

    // kahraman
    const happy = heroTexture(this, 'odi', 0x6c4cf1, 44, 'happy');
    heroTexture(this, 'odi', 0x6c4cf1, 44, 'hurt'); heroTexture(this, 'odi', 0x6c4cf1, 44, 'wow');
    this.hero = this.physics.add.sprite(this.checkpoint.x, this.checkpoint.y, happy).setDepth(20);
    this.hero.setSize(28, 38).setOffset(8, 4);
    this.hero.setCollideWorldBounds(true);
    (this.hero.body as Body).onWorldBounds = false;
    this.hero.setMaxVelocity(400, 1100);

    // parçacıklar
    this.sparks = this.add.particles(0, 0, sparkTexture(this), { speed: { min: 60, max: 160 }, scale: { start: 0.9, end: 0 }, lifespan: 450, gravityY: 300, emitting: false, tint: [0xffd166, 0xffffff, 0xf59e0b] }).setDepth(30);
    this.dust = this.add.particles(0, 0, dustTexture(this), { speed: { min: 20, max: 70 }, angle: { min: 200, max: 340 }, scale: { start: 0.7, end: 0 }, alpha: { start: 0.7, end: 0 }, lifespan: 350, emitting: false, tint: th.tonotopy ? 0xbfe9ff : 0xffffff }).setDepth(19);

    // çarpışmalar
    this.physics.add.collider(this.hero, this.solids);
    this.physics.add.collider(this.hero, this.oneway);
    this.physics.add.collider(this.hero, this.wax, () => { this.stickyUntil = this.time.now + 120; });
    this.physics.add.collider(this.hero, this.movers);
    this.physics.add.collider(this.hero, this.bouncers, (_h, b) => this.onBouncer(b as Image));
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.collider(this.enemies, this.oneway);
    this.physics.add.collider(this.enemies, this.wax);
    this.physics.add.collider(this.enemies, this.movers);
    this.physics.add.overlap(this.hero, this.coins, (_h, c) => this.collectCoin(c as Image));
    this.physics.add.overlap(this.hero, this.enemies, (_h, e) => this.touchEnemy(e as Sprite));
    this.physics.add.overlap(this.hero, this.hazards, () => this.damage(this.facing));
    this.physics.add.collider(this.drops, this.solids, (d) => this.splash(d as Sprite));
    this.physics.add.collider(this.drops, this.wax, (d) => this.splash(d as Sprite));
    this.physics.add.overlap(this.hero, this.drops, (_h, d) => { this.splash(d as Sprite); this.damage(this.facing); });
    this.physics.add.overlap(this.hero, this.exit, () => this.completeLevel());
    if (this.gold) this.physics.add.overlap(this.hero, this.gold, () => this.collectGold());

    // kamera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, this.worldH + 260);
    cam.setBackgroundColor(PColor.IntegerToColor(th.bg).rgba);
    this.groundY = this.hero.y; this.camTX = this.hero.x - GAME_W / 2; this.camTY = this.groundY - CAM_ANCHOR_Y;
    this.snapCamera();

    // tonotopi renk katmanı (L4)
    if (th.tonotopy) {
      this.tint = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x6c4cf1, 0.12).setScrollFactor(0).setDepth(-5);
    }

    // HUD + kontroller
    this.hud = new Hud(this);
    this.hud.set(r.score, r.lives, `${this.lv.index}. ${this.lv.name}`);
    this.timerText = this.add.text(GAME_W / 2, 56, '', { fontFamily: FONT, fontSize: '12px', fontStyle: '700', color: COLORS.muted }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this.buildControls();
    this.levelBanner();

    const opts = getOpts(this);
    if (opts.debug && (!r.startedAt || r.startedAt <= 0)) r.startedAt = performance.now();
    window.__arcade = { score: r.score, level: this.lv.index };
    if (opts.debug) {
      // Harness / görsel inceleme: kahramanı bir karo sütununa ışınla.
      (window as unknown as { __kyTeleport?: (col: number) => void }).__kyTeleport = (col: number) => {
        let row = 0;
        while (row < this.rows && isSolidChar(this.grid[row][col])) row++;      // tavanı atla
        while (row < this.rows && !isSolidChar(this.grid[row][col])) row++;     // ilk zemini bul
        (this.hero.body as Body).reset(col * TILE + TILE / 2, row * TILE - 24);
        this.invulnUntil = this.time.now + 1500;
        this.snapCamera();
      };
    }
  }

  /* ---------------- dünya kurulumu ---------------- */
  buildWorld() {
    const th = this.lv.theme;
    const g = this.grid;
    // yatay bitişik katı karoları tek gövdede birleştir
    const mergeRuns = (chars: string[], group: Phaser.Physics.Arcade.StaticGroup, h = TILE, yOff = 0, oneWay = false) => {
      for (let r = 0; r < this.rows; r++) {
        let c = 0;
        while (c < this.cols) {
          if (!chars.includes(g[r][c])) { c++; continue; }
          const c0 = c; while (c < this.cols && chars.includes(g[r][c])) c++;
          const w = (c - c0) * TILE;
          const rect = this.add.rectangle(c0 * TILE + w / 2, r * TILE + yOff + h / 2, w, h).setVisible(false);
          group.add(rect);
          if (oneWay) { const b = rect.body as Phaser.Physics.Arcade.StaticBody; b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false; }
        }
      }
    };
    mergeRuns(['#'], this.solids);
    mergeRuns(['w'], this.wax);
    mergeRuns(['-'], this.oneway, 12, 2, true);
    mergeRuns(['^'], this.hazards, 16, 16);

    coinTexture(this);
    let orbitIndex = 0;
    const ossicles = ['Çekiç', 'Örs', 'Üzengi'];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const ch = g[r][c];
        const x = c * TILE + TILE / 2, y = r * TILE + TILE / 2;
        if (ch === 'S') { this.checkpoint = { x, y: y - 4 }; }
        else if (ch === 'o') {
          const coin = this.coins.create(x, y, 'ky-coin') as Image;
          coin.setDepth(10);
          coin.setData('note', this.add.image(x, y, 'ky-note').setDepth(11).setScale(0.6));
          this.coinBase.set(coin, y);
        }
        else if (ch === 'e') {
          const e = this.enemies.create(x, y - 2, enemyTexture(this, th.enemy)) as Sprite;
          e.setDepth(15); e.setSize(30, 30).setOffset(7, 12);
          e.setData('dir', (c % 2 === 0) ? -1 : 1);
          e.setVelocityX(th.enemySpeed * (e.getData('dir') as number));
          e.setBounce(0); e.setCollideWorldBounds(true);
          if (th.enemy.kind === 'emoji') e.setFlipX(e.getData('dir') > 0);
        }
        else if (ch === 'C') {
          flagTexture(this, true);
          const img = this.add.image(x, y - 16, flagTexture(this, false)).setDepth(5);
          this.flags.push({ img, x, on: false });
        }
        else if (ch === 'E') {
          if (this.lv.index === 4) {
            const key = 'ky-portal';
            if (!this.textures.exists(key)) {
              const canvas = document.createElement('canvas'); canvas.width = 72; canvas.height = 72;
              const cx = canvas.getContext('2d')!;
              cx.font = '48px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
              cx.fillText('⚡', 36, 40);
              this.textures.addCanvas(key, canvas);
            }
            const ring = this.add.graphics({ x, y: y - 12 }); ring.lineStyle(4, 0xffd166, 0.9); ring.strokeCircle(0, 0, 40); ring.lineStyle(2, 0xffffff, 0.5); ring.strokeCircle(0, 0, 30); ring.setDepth(4);
            this.tweens.add({ targets: ring, angle: 360, duration: 4000, repeat: -1 });
            this.tweens.add({ targets: ring, scale: 1.15, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.exit = this.physics.add.staticImage(x, y - 12, key).setDepth(5);
            this.add.text(x, y - 86, 'İşitme siniri', { fontFamily: FONT, fontSize: '12px', fontStyle: '700', color: '#ffffff' }).setOrigin(0.5).setDepth(5);
          } else {
            this.exit = this.physics.add.staticImage(x, y - 20, gateTexture(this)).setDepth(5);
            const next = LEVELS[this.lv.index];
            this.add.text(x, y - 68, next ? `→ ${next.name}` : 'Çıkış', { fontFamily: FONT, fontSize: '12px', fontStyle: '700', color: COLORS.accent }).setOrigin(0.5).setDepth(5);
            this.tweens.add({ targets: this.exit, alpha: 0.7, duration: 800, yoyo: true, repeat: -1 });
          }
          (this.exit.body as Phaser.Physics.Arcade.StaticBody).setSize(30, 50);
        }
        else if (ch === 'G') {
          this.gold = this.physics.add.staticImage(x, y, goldCochleaTexture(this)).setDepth(12);
          this.tweens.add({ targets: this.gold, angle: 360, duration: 6000, repeat: -1 });
        }
        else if (ch === 'M' || ch === 'V') {
          const key = moverTexture(this, `ky-mover-${this.lv.id}`, 64, 18, th.mover, th.solidDark);
          const img = this.movers.create(x + TILE / 2, y - 7, key) as Image;
          img.setDepth(8);
          (img.body as Body).setDirectControl(true);
          if (ch === 'M') this.tweens.add({ targets: img, x: img.x + TILE * 4, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
          else this.tweens.add({ targets: img, y: img.y - TILE * 5, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
        else if (ch === 'R') {
          const img = this.movers.create(x, y, boneTexture(this)) as Image;
          img.setDepth(8);
          (img.body as Body).setDirectControl(true);
          const name = ossicles[orbitIndex % 3];
          const lab = this.add.text(x, y, name, { fontFamily: FONT, fontSize: '11px', fontStyle: '700', color: '#7a6446' }).setOrigin(0.5).setDepth(9);
          this.orbits.push({ img, cx: x, cy: y, r: 80, a0: (orbitIndex * Math.PI * 2) / 3, label: lab });
          orbitIndex++;
        }
        else if (ch === 't') {
          // bitişik t'leri tek platform yap
          if (c > 0 && g[r][c - 1] === 't') continue;
          let n = 1; while (c + n < this.cols && g[r][c + n] === 't') n++;
          const w = n * TILE;
          const img = this.movers.create(c * TILE + w / 2, y - 7, timedTexture(this, w)) as Image;
          img.setDepth(8);
          this.timed.push({ img, phase: ((Math.floor(c / 4)) % 2) * 1.8 });
        }
        else if (ch === 'T') {
          if (c > 0 && g[r][c - 1] === 'T') continue;
          let n = 1; while (c + n < this.cols && g[r][c + n] === 'T') n++;
          const w = n * TILE;
          const img = this.bouncers.create(c * TILE + w / 2, y, drumTexture(this, w)) as Image;
          img.setDepth(8).setData('kind', 'drum');
          (img.body as Phaser.Physics.Arcade.StaticBody).setSize(w, 20).setOffset(0, 6);
          this.add.text(c * TILE + w / 2, y - 26, 'Kulak zarı', { fontFamily: FONT, fontSize: '11px', fontStyle: '700', color: '#b14a6b' }).setOrigin(0.5).setDepth(9);
        }
        else if (ch === 's') {
          const img = this.bouncers.create(x, y, springTexture(this)) as Image;
          img.setDepth(8).setData('kind', 'spring');
          (img.body as Phaser.Physics.Arcade.StaticBody).setSize(30, 14).setOffset(1, 18);
        }
        else if (ch === 'D') {
          dropTexture(this);
          this.time.addEvent({ delay: 2400, startAt: (c * 400) % 2400, loop: true, callback: () => this.spawnDrop(x, y + 12) });
          const src = this.add.graphics({ x, y: y + 10 }); src.fillStyle(0x7fc8ff, 0.9); src.fillEllipse(0, 0, 22, 10); src.setDepth(6);
        }
      }
    }
  }

  spawnDrop(x: number, y: number) {
    if (this.done) return;
    const d = this.drops.get(x, y, 'ky-drop') as Sprite | null;
    if (!d) return;
    d.setActive(true).setVisible(true).setDepth(14).setScale(1).setAlpha(1);
    d.body!.enable = true; (d.body as Body).reset(x, y);
    d.setSize(12, 16).setOffset(3, 6);
    d.setVelocity(0, 0);
  }
  splash(d: Sprite) {
    if (!d.active) return;
    this.dust.explode(5, d.x, d.y + 8);
    d.setActive(false).setVisible(false); d.body!.enable = false;
  }

  /* ---------------- kontroller ---------------- */
  buildControls() {
    controlTextures(this);
    const y = GAME_H - 84;
    this.ctlLeft = this.add.image(58, y, 'ky-ctl-arrow').setScrollFactor(0).setDepth(110).setAlpha(0.75);
    this.ctlRight = this.add.image(146, y, 'ky-ctl-arrow').setFlipX(true).setScrollFactor(0).setDepth(110).setAlpha(0.75);
    this.ctlJump = this.add.image(GAME_W - 66, y - 6, 'ky-ctl-jump').setScrollFactor(0).setDepth(110).setAlpha(0.85);
    this.add.text(GAME_W - 66, y - 6, 'ZIPLA', { fontFamily: FONT, fontSize: '16px', fontStyle: '800', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(111);

    this.hint = this.add.text(GAME_W / 2, GAME_H - 190, 'Sol / sağ tarafa bas: yürü\nÜst yarıya dokun veya ZIPLA: zıpla (basılı tut: yüksek)', { fontFamily: FONT, fontSize: '13px', fontStyle: '700', color: '#ffffff', align: 'center', backgroundColor: 'rgba(19,22,42,0.55)', padding: { x: 12, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(112);
    this.time.delayedCall(5000, () => { if (this.hint) this.tweens.add({ targets: this.hint, alpha: 0, duration: 400, onComplete: () => { this.hint?.destroy(); this.hint = undefined; } }); });

    const inJump = (p: Phaser.Input.Pointer) => PMath.Distance.Between(p.x, p.y, this.ctlJump.x, this.ctlJump.y) < 54;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (inJump(p) || p.y < GAME_H / 2) {
        this.jumpBufferedAt = this.time.now; this.ctl.jumpHeld = true; this.ctl.jumpPointer = p.id;
      }
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.ctl.jumpPointer) { this.ctl.jumpHeld = false; this.ctl.jumpPointer = -1; this.cutJump(); }
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
  }

  readPointers() {
    this.ctl.left = false; this.ctl.right = false;
    const ptrs = this.input.manager.pointers;
    for (const p of ptrs) {
      if (!p.isDown) continue;
      if (PMath.Distance.Between(p.x, p.y, this.ctlJump.x, this.ctlJump.y) < 54) continue;
      if (p.y < GAME_H / 2) continue;
      if (p.x < GAME_W / 3) this.ctl.left = true;
      else if (p.x > (GAME_W * 2) / 3) this.ctl.right = true;
    }
  }

  cutJump() {
    const b = this.hero.body as Body;
    if (b.velocity.y < -200) b.velocity.y *= 0.45;
  }

  /* ---------------- oyun olayları ---------------- */
  collectCoin(c: Image) {
    if (!c.active) return;
    const r = run(this);
    r.coins += 1; r.score += 10;
    this.sparks.explode(8, c.x, c.y);
    sfx.coin();
    if (this.lv.theme.tonotopy) sfx.toneAt(tonotopyFreq(c.x / this.worldW), 0.15);
    floatText(this, c.x, c.y - 10, '+10', '#d98b00');
    this.coinBase.delete(c);
    (c.getData('note') as Phaser.GameObjects.Image | undefined)?.destroy();
    c.destroy();
    this.hud.set(r.score, r.lives);
    getOpts(this).onEvent({ type: 'haptic', kind: 'light' });
  }

  collectGold() {
    if (!this.gold || !this.gold.active) return;
    const r = run(this);
    r.score += 500;
    this.sparks.explode(24, this.gold.x, this.gold.y);
    sfx.power();
    floatText(this, this.gold.x, this.gold.y - 20, 'Altın koklea +500', '#d98b00');
    flash(this, 0xffd166, 0.25, 220);
    this.gold.destroy(); this.gold = undefined;
    this.hud.set(r.score, r.lives);
    getOpts(this).onEvent({ type: 'haptic', kind: 'success' });
  }

  onBouncer(b: Image) {
    const hb = this.hero.body as Body;
    if (!hb.touching.down) return;
    const drum = b.getData('kind') === 'drum';
    hb.velocity.y = drum ? -1100 : -800;
    this.hero.setTexture(heroTexture(this, 'odi', 0x6c4cf1, 44, 'wow'));
    this.time.delayedCall(500, () => { if (!this.done) this.hero.setTexture(heroTexture(this, 'odi', 0x6c4cf1, 44, 'happy')); });
    this.tweens.add({ targets: b, scaleY: 0.55, duration: 90, yoyo: true, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.hero, scaleX: 0.8, scaleY: 1.3, duration: 110, yoyo: true });
    this.dust.explode(6, this.hero.x, this.hero.y + 20);
    sfx.bounce();
    getOpts(this).onEvent({ type: 'haptic', kind: 'medium' });
  }

  touchEnemy(e: Sprite) {
    if (!e.active || this.done || e.getData('dead')) return;
    const hb = this.hero.body as Body, eb = e.body as Body;
    if (hb.velocity.y > 60 && hb.bottom < eb.top + 16) {
      // tepeden ezme
      e.setData('dead', true); eb.enable = false;
      const r = run(this);
      r.score += 50;
      hb.velocity.y = -460;
      this.tweens.add({ targets: e, scaleY: 0.2, scaleX: 1.5, alpha: 0, duration: 260, ease: 'Quad.easeOut', onComplete: () => e.destroy() });
      floatText(this, e.x, e.y - 20, '+50');
      this.sparks.explode(6, e.x, e.y);
      sfx.doubleJump();
      this.hud.set(r.score, r.lives);
      getOpts(this).onEvent({ type: 'haptic', kind: 'medium' });
      return;
    }
    this.damage(e.x < this.hero.x ? -1 : 1);
  }

  /** dir: hasar hangi yönden geldi (kahraman ters yöne savrulur). */
  damage(dir: number) {
    if (this.done || this.time.now < this.invulnUntil) return;
    const r = run(this);
    r.lives -= 1;
    this.invulnUntil = this.time.now + 1200;
    this.hud.set(r.score, r.lives);
    flash(this); this.cameras.main.shake(200, 0.012);
    sfx.hit();
    getOpts(this).onEvent({ type: 'haptic', kind: 'error' });
    this.hero.setTexture(heroTexture(this, 'odi', 0x6c4cf1, 44, 'hurt'));
    const hb = this.hero.body as Body;
    hb.velocity.x = -dir * 220; hb.velocity.y = -360;
    this.tweens.add({ targets: this.hero, alpha: 0.25, duration: 100, yoyo: true, repeat: 5, onComplete: () => { this.hero.setAlpha(1); if (!this.done) this.hero.setTexture(heroTexture(this, 'odi', 0x6c4cf1, 44, 'happy')); } });
    if (r.lives <= 0) this.gameOver('Ses yolda kayboldu…');
  }

  fallOut() {
    if (this.done) return;
    const r = run(this);
    r.lives -= 1;
    this.hud.set(r.score, r.lives);
    flash(this); this.cameras.main.shake(220, 0.014);
    sfx.hit();
    getOpts(this).onEvent({ type: 'haptic', kind: 'error' });
    if (r.lives <= 0) { this.gameOver('Ses yolda kayboldu…'); return; }
    this.invulnUntil = this.time.now + 1200;
    const hb = this.hero.body as Body;
    hb.reset(this.checkpoint.x, this.checkpoint.y);
    hb.velocity.set(0, 0);
    this.hero.setAlpha(1);
    this.groundY = this.checkpoint.y;
    this.snapCamera();
    this.cameras.main.flash(250, 255, 255, 255);
  }

  completeLevel() {
    if (this.done) return;
    this.done = true;
    const r = run(this);
    const hb = this.hero.body as Body;
    hb.velocity.set(0, 0); hb.allowGravity = false; hb.moves = false;
    const bonus = Math.max(0, Math.round(this.lv.par - this.elapsed)) * 5 + 200;
    r.score += bonus;
    r.highest = Math.max(r.highest, this.lv.index);
    r.time += this.elapsed; this.elapsed = 0;
    if (this.lv.index < LEVELS.length) r.unlocked = Math.max(r.unlocked, this.lv.index + 1);
    this.hud.set(r.score, r.lives);
    this.groundY = this.hero.y;
    sfx.levelUp();
    this.sparks.explode(30, this.hero.x, this.hero.y);
    this.tweens.add({ targets: this.hero, scale: 1.3, angle: 360, duration: 900, ease: 'Back.easeOut' });
    getOpts(this).onEvent({ type: 'haptic', kind: 'success' });
    getOpts(this).onEvent({ type: 'progress', score: r.score, level: this.lv.index });
    const last = this.lv.index >= LEVELS.length;
    this.banner(last ? 'Beyne ulaştın!' : 'Bölüm tamamlandı!', `+${bonus} süre bonusu · ${r.coins} ♪`);
    this.time.delayedCall(1900, () => {
      if (last) { this.finish('Beyne ulaştın!'); return; }
      r.level = this.lv.index + 1;
      this.scene.restart();
    });
  }

  gameOver(reason: string) {
    if (this.done) return;
    this.done = true;
    const hb = this.hero.body as Body;
    hb.velocity.set(0, 0); hb.moves = false;
    sfx.gameOver();
    this.banner('Oyun bitti', reason);
    this.time.delayedCall(1400, () => this.finish(reason));
  }

  finish(labelText: string) {
    const r = run(this);
    const seconds = Math.round(r.time + this.elapsed);
    getOpts(this).onEvent({ type: 'gameover', score: r.score, stats: { 'Bölüm': r.highest, 'Jeton': r.coins, 'Süre': seconds }, label: labelText });
  }

  banner(big: string, small: string) {
    const c = this.add.container(GAME_W / 2, GAME_H * 0.4).setScrollFactor(0).setDepth(150).setAlpha(0);
    const g = this.add.graphics(); g.fillStyle(0x13162a, 0.72); g.fillRoundedRect(-170, -48, 340, 96, 22);
    const t1 = this.add.text(0, -14, big, { fontFamily: FONT, fontSize: '28px', fontStyle: '800', color: '#ffffff' }).setOrigin(0.5);
    const t2 = this.add.text(0, 20, small, { fontFamily: FONT, fontSize: '14px', fontStyle: '700', color: '#ffd166' }).setOrigin(0.5);
    c.add([g, t1, t2]);
    this.tweens.add({ targets: c, alpha: 1, y: GAME_H * 0.38, duration: 300, ease: 'Back.easeOut' });
    return c;
  }

  levelBanner() {
    const c = this.banner(`${this.lv.index}. Bölüm`, this.lv.name);
    sfx.levelUp();
    this.time.delayedCall(1500, () => this.tweens.add({ targets: c, alpha: 0, y: GAME_H * 0.34, duration: 350, onComplete: () => c.destroy() }));
  }

  activateFlag(f: { img: Phaser.GameObjects.Image; x: number; on: boolean }) {
    f.on = true;
    f.img.setTexture(flagTexture(this, true));
    this.tweens.add({ targets: f.img, y: f.img.y - 10, duration: 200, yoyo: true, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: f.img, scaleX: 1.25, duration: 120, yoyo: true, repeat: 2 });
    this.sparks.explode(10, f.x, f.img.y - 20);
    this.checkpoint = { x: f.x, y: f.img.y };
    floatText(this, f.x, f.img.y - 40, 'Kontrol noktası!', COLORS.accent);
    sfx.power();
  }

  /**
   * Kamera: yatayda ölü bölge + bakış yönüne doğru ufak öne alma; dikeyde kahraman yerdeyken zemin hizasına
   * yumuşakça kilitlenir, zıplarken sadece pencereden çıkarsa takip eder (zıplamada ekran sallanmaz).
   */
  updateCamera(grounded: boolean, dt: number) {
    const cam = this.cameras.main;
    // kare hızından bağımsız yumuşatma (60 fps'te 0.14 / 0.10)
    const kx = 1 - Math.pow(0.86, dt * 60), ky = 1 - Math.pow(0.9, dt * 60);
    const lookX = this.hero.x + this.facing * 36 - GAME_W / 2;
    if (lookX > this.camTX + 28) this.camTX = lookX - 28;
    else if (lookX < this.camTX - 28) this.camTX = lookX + 28;
    if (grounded) this.groundY = this.hero.y;
    const heroScreenY = this.hero.y - cam.scrollY;
    if (heroScreenY < 170) this.camTY = this.hero.y - 170;
    else if (heroScreenY > 560) this.camTY = this.hero.y - 560;
    else if (grounded) this.camTY = this.groundY - CAM_ANCHOR_Y;
    const maxX = this.worldW - GAME_W, maxY = this.worldH + 260 - GAME_H;
    this.camTX = PMath.Clamp(this.camTX, 0, maxX); this.camTY = PMath.Clamp(this.camTY, 0, maxY);
    cam.scrollX += (this.camTX - cam.scrollX) * kx;
    cam.scrollY += (this.camTY - cam.scrollY) * ky;
  }
  snapCamera() {
    const cam = this.cameras.main;
    this.camTX = PMath.Clamp(this.hero.x - GAME_W / 2, 0, this.worldW - GAME_W);
    this.camTY = PMath.Clamp(this.groundY - CAM_ANCHOR_Y, 0, this.worldH + 260 - GAME_H);
    cam.scrollX = this.camTX; cam.scrollY = this.camTY;
  }

  /** Basit debug yapay zekâsı: sağa koş, engel/boşluk/düşman varsa zıpla. */
  debugAI(now: number) {
    const hb = this.hero.body as Body;
    this.ctl.left = false; this.ctl.right = true;
    const cx = Math.floor((this.hero.x + 36) / TILE), rowFeet = Math.floor((hb.bottom + 2) / TILE);
    const cell = (c: number, r: number) => (r >= 0 && r < this.rows && c >= 0 && c < this.cols ? this.grid[r][c] : '.');
    const solidAhead = isSolidChar(cell(cx, rowFeet - 1)) || isSolidChar(cell(cx, rowFeet - 2));
    let gapAhead = true;
    for (let r = rowFeet; r < Math.min(this.rows, rowFeet + 3); r++) { const ch = cell(cx, r); if (isSolidChar(ch) || ch === '-' || ch === 'T' || ch === 't' || ch === 's') { gapAhead = false; break; } }
    const gapNow = !isSolidChar(cell(Math.floor(this.hero.x / TILE), rowFeet)) && cell(Math.floor(this.hero.x / TILE), rowFeet) !== '-';
    let enemyNear = false;
    for (const e of this.enemies.getChildren() as Sprite[]) { if (e.active && !e.getData('dead') && e.x > this.hero.x - 10 && e.x - this.hero.x < 130 && Math.abs(e.y - this.hero.y) < 48) enemyNear = true; }
    const want = hb.blocked.right || solidAhead || (gapAhead && gapNow && hb.blocked.down) || (gapAhead && hb.blocked.down) || enemyNear || cell(cx, rowFeet - 1) === '^';
    if (want && hb.blocked.down) { this.jumpBufferedAt = now; this.ctl.jumpHeld = true; }
    if (!want && now - this.jumpedAt > 350) this.ctl.jumpHeld = false;
  }

  /* ---------------- döngü ---------------- */
  update(_t: number, dtMs: number) {
    const r = run(this);
    const now = this.time.now;
    const dt = Math.min(0.2, dtMs / 1000);
    const opts = getOpts(this);
    const hb = this.hero.body as Body;
    const th = this.lv.theme;

    // kamera + paralaks
    this.updateCamera(hb.blocked.down || hb.touching.down, dt);
    const cam = this.cameras.main;
    this.parallax.setTilePosition(cam.scrollX * 0.18, cam.scrollY * 0.12);

    // jetonlar süzülür
    for (const [c, base] of this.coinBase) {
      const img = c as Image;
      img.y = base + Math.sin(now / 260 + img.x * 0.05) * 3;
      (img.getData('note') as Phaser.GameObjects.Image).y = img.y;
    }

    // yörünge kemikçikleri
    for (const o of this.orbits) {
      const a = o.a0 + now / 1100;
      o.img.setPosition(o.cx + Math.cos(a) * o.r, o.cy + Math.sin(a) * o.r * 0.55);
      o.label.setPosition(o.img.x, o.img.y - 18);
    }
    // zamanlı platformlar
    for (const t of this.timed) {
      const ph = ((now / 1000 + t.phase) % 3.6);
      const on = ph < 2.4;
      const warn = on && ph > 1.8;
      const b = t.img.body as Body;
      if (b.enable !== on) { b.enable = on; }
      t.img.setAlpha(on ? (warn ? (Math.floor(now / 90) % 2 ? 0.35 : 1) : 1) : 0.12);
    }

    if (this.done) {
      window.__arcade = { score: r.score, level: this.lv.index };
      return;
    }

    this.elapsed += dt;
    const sec = Math.floor(this.elapsed);
    if (sec !== this.lastTimerSec) { this.lastTimerSec = sec; this.timerText.setText(`⏱ ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}  ·  ♪ ${r.coins}`); }

    // giriş
    if (opts.debug) this.debugAI(now); else this.readPointers();
    const grounded = hb.blocked.down || hb.touching.down;
    if (grounded) this.groundedAt = now;
    const sticky = now < this.stickyUntil;
    const speed = th.runSpeed * (sticky ? 0.45 : 1);
    const accel = grounded ? 2600 : 1600;
    let target = 0;
    if (this.ctl.left) { target = -speed; this.facing = -1; }
    else if (this.ctl.right) { target = speed; this.facing = 1; }
    const vx = hb.velocity.x;
    if (target === 0 && grounded) hb.velocity.x = Math.abs(vx) < 20 ? 0 : vx - Math.sign(vx) * Math.min(Math.abs(vx), accel * dt);
    else if (target !== 0) hb.velocity.x = PMath.Clamp(vx + Math.sign(target - vx) * accel * dt, -Math.abs(target), Math.abs(target));
    else hb.velocity.x = vx * 0.995;
    this.hero.setFlipX(this.facing < 0);

    // zıplama: tampon + coyote
    if (now - this.jumpBufferedAt < JUMP_BUFFER && now - this.groundedAt < COYOTE && now - this.jumpedAt > 150) {
      const jv = th.jumpVel * (sticky ? 0.7 : 1);
      hb.velocity.y = -jv;
      this.jumpBufferedAt = -1e9; this.groundedAt = -1e9; this.jumpedAt = now;
      this.tweens.add({ targets: this.hero, scaleX: 0.82, scaleY: 1.22, duration: 120, yoyo: true });
      this.dust.explode(4, this.hero.x, this.hero.y + 20);
      sfx.jump();
    }
    // değişken yükseklik: basılı değilse yükselişi kes
    if (!this.ctl.jumpHeld && hb.velocity.y < -200 && now - this.jumpedAt < 350) hb.velocity.y *= 0.9;

    // iniş tozu
    if (grounded && !this.wasGrounded && hb.velocity.y >= 0) {
      this.dust.explode(6, this.hero.x, this.hero.y + 20);
      this.tweens.add({ targets: this.hero, scaleX: 1.2, scaleY: 0.8, duration: 90, yoyo: true });
    }
    this.wasGrounded = grounded;

    // bayraklar
    for (const f of this.flags) if (!f.on && this.hero.x > f.x - 6) this.activateFlag(f);

    // düşmanlar: kenar ve duvar dönüşü
    for (const e of this.enemies.getChildren() as Sprite[]) {
      if (!e.active || e.getData('dead')) continue;
      const eb = e.body as Body;
      let dir = e.getData('dir') as number;
      if (eb.blocked.right) dir = -1; else if (eb.blocked.left) dir = 1;
      if (eb.blocked.down) {
        const fc = Math.floor((e.x + dir * 20) / TILE), fr = Math.floor((eb.bottom + 4) / TILE);
        const below = fr < this.rows && fc >= 0 && fc < this.cols ? this.grid[fr][fc] : '.';
        if (!isSolidChar(below) && below !== '-' && below !== 'T' && below !== 't') dir = -dir;
      }
      e.setData('dir', dir); eb.velocity.x = th.enemySpeed * dir;
      if (th.enemy.kind === 'emoji') e.setFlipX(dir > 0);
      else e.setFlipX(dir < 0);
    }

    // düşüş
    if (this.hero.y > this.worldH + 40) this.fallOut();

    // tonotopi tonu (L4)
    if (this.tint) {
      const t = PMath.Clamp(this.hero.x / this.worldW, 0, 1);
      const col = PColor.Interpolate.ColorWithColor(PColor.ValueToColor(0x6c4cf1), PColor.ValueToColor(0xf59e0b), 100, Math.round(t * 100));
      this.tint.setFillStyle(PColor.GetColor(col.r, col.g, col.b), 0.14);
    }

    // kontrol görselleri
    this.ctlLeft.setAlpha(this.ctl.left ? 1 : 0.6); this.ctlRight.setAlpha(this.ctl.right ? 1 : 0.6); this.ctlJump.setAlpha(this.ctl.jumpHeld ? 1 : 0.8);

    window.__arcade = { score: r.score, level: this.lv.index };
    if (opts.debug && performance.now() - r.startedAt > DEBUG_END_MS) {
      this.done = true;
      this.finish('Debug');
    }
  }
}

export function mount(parent: HTMLElement, opts: ArcadeOptions): ArcadeHandle {
  return bootGame(parent, opts, [Menu, Play], '#ffffff');
}
