import Phaser from 'phaser';
import { emojiTexture, GAME_H, GAME_W, tonotopyColor } from '../shared';
import { TILE, type EnemyLook, type Theme } from './levels';

type G = Phaser.GameObjects.Graphics;
const PColor = Phaser.Display.Color;

function gfx(scene: Phaser.Scene): G { return scene.add.graphics({ x: 0, y: 0 }); }
function has(scene: Phaser.Scene, key: string) { return scene.textures.exists(key); }

/** Canvas metniyle tek karakterlik doku (♪ jeton vb.). */
export function glyphTexture(scene: Phaser.Scene, key: string, ch: string, color: string, size: number, stroke?: string): string {
  if (has(scene, key)) return key;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const c = canvas.getContext('2d')!;
  c.font = `800 ${Math.floor(size * 0.82)}px "SF Pro Rounded","Segoe UI",Arial,sans-serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (stroke) { c.lineWidth = Math.max(2, size * 0.1); c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(ch, size / 2, size / 2 + size * 0.05); }
  c.fillStyle = color; c.fillText(ch, size / 2, size / 2 + size * 0.05);
  scene.textures.addCanvas(key, canvas);
  return key;
}

/** Ses jetonu: altın daire içinde ♪ */
export function coinTexture(scene: Phaser.Scene): string {
  const key = 'ky-coin';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0xf59e0b, 1); g.fillCircle(14, 14, 13);
  g.fillStyle(0xffd166, 1); g.fillCircle(14, 14, 10);
  g.fillStyle(0xffffff, 0.5); g.fillCircle(10, 10, 4);
  g.generateTexture(key, 28, 28); g.destroy();
  glyphTexture(scene, 'ky-note', '♪', '#7a4a00', 26);
  return key;
}

export function sparkTexture(scene: Phaser.Scene): string {
  const key = 'ky-spark';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(5, 5, 4);
  g.generateTexture(key, 10, 10); g.destroy();
  return key;
}

export function dustTexture(scene: Phaser.Scene): string {
  const key = 'ky-dust';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0xffffff, 0.9); g.fillCircle(6, 6, 6);
  g.generateTexture(key, 12, 12); g.destroy();
  return key;
}

export function dropTexture(scene: Phaser.Scene): string {
  const key = 'ky-drop';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0x7fc8ff, 0.95);
  g.fillTriangle(9, 0, 1, 14, 17, 14); g.fillCircle(9, 14, 8);
  g.fillStyle(0xffffff, 0.6); g.fillCircle(6, 13, 2.5);
  g.generateTexture(key, 18, 24); g.destroy();
  return key;
}

/** Kemikçik platformu (yuvarlak uçlu kemik). */
export function boneTexture(scene: Phaser.Scene, w = 96, h = 20): string {
  const key = `ky-bone-${w}`;
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0xd9c6a5, 1); g.fillRoundedRect(10, 4, w - 20, h - 6, 7);
  g.fillCircle(12, 8, 8); g.fillCircle(12, h - 8, 8); g.fillCircle(w - 12, 8, 8); g.fillCircle(w - 12, h - 8, 8);
  g.fillStyle(0xfff6e6, 1); g.fillRoundedRect(12, 6, w - 24, h - 12, 6);
  g.fillCircle(12, 8, 6); g.fillCircle(12, h - 8, 6); g.fillCircle(w - 12, 8, 6); g.fillCircle(w - 12, h - 8, 6);
  g.generateTexture(key, w, h); g.destroy();
  return key;
}

/** Hareketli platform (yumuşak dikdörtgen, çizgili). */
export function moverTexture(scene: Phaser.Scene, key: string, w: number, h: number, color: number, dark: number): string {
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(dark, 1); g.fillRoundedRect(0, 0, w, h, 8);
  g.fillStyle(color, 1); g.fillRoundedRect(0, 0, w, h - 4, 8);
  g.lineStyle(2, dark, 0.6);
  for (let x = 12; x < w - 6; x += 12) g.lineBetween(x, 5, x, h - 9);
  g.generateTexture(key, w, h); g.destroy();
  return key;
}

/** Zamanlı platform (teal, yarı saydam). */
export function timedTexture(scene: Phaser.Scene, w: number): string {
  const key = `ky-timed-${w}`;
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0x0e9c98, 1); g.fillRoundedRect(0, 0, w, 18, 6);
  g.fillStyle(0x5ad4d0, 1); g.fillRoundedRect(2, 2, w - 4, 10, 5);
  g.generateTexture(key, w, 18); g.destroy();
  return key;
}

/** Kulak zarı trambolini: pembe zar. */
export function drumTexture(scene: Phaser.Scene, w: number): string {
  const key = `ky-drum-${w}`;
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0xd96a8a, 1); g.fillRoundedRect(0, 6, w, 26, 10);
  g.fillStyle(0xf7a8c0, 1); g.fillRoundedRect(0, 4, w, 22, 10);
  g.lineStyle(2, 0xffffff, 0.7);
  g.beginPath(); g.arc(w / 2, 14, w * 0.3, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
  g.beginPath(); g.arc(w / 2, 14, w * 0.18, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
  g.generateTexture(key, w, 32); g.destroy();
  return key;
}

/** Kıl hücresi yayı: üçlü stereosilya demeti. */
export function springTexture(scene: Phaser.Scene): string {
  const key = 'ky-spring';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0x2bd4c9, 1); g.fillRoundedRect(2, 22, 28, 10, 4);
  g.lineStyle(4, 0x7af5ec, 1);
  g.lineBetween(9, 24, 9, 8); g.lineBetween(16, 24, 16, 3); g.lineBetween(23, 24, 23, 8);
  g.fillStyle(0xffffff, 1); g.fillCircle(9, 7, 3); g.fillCircle(16, 2.5, 3); g.fillCircle(23, 7, 3);
  g.generateTexture(key, 32, 32); g.destroy();
  return key;
}

/** Kontrol noktası bayrağı (pasif / aktif). */
export function flagTexture(scene: Phaser.Scene, active: boolean): string {
  const key = active ? 'ky-flag-on' : 'ky-flag-off';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0x6b7280, 1); g.fillRoundedRect(4, 0, 6, 64, 3);
  g.fillStyle(active ? 0x6c4cf1 : 0xc3c7d4, 1);
  g.fillTriangle(10, 4, 40, 16, 10, 28);
  if (active) { g.fillStyle(0xffffff, 0.9); g.fillCircle(20, 15, 4); }
  g.generateTexture(key, 44, 64); g.destroy();
  return key;
}

/** Altın koklea: spiral. */
export function goldCochleaTexture(scene: Phaser.Scene): string {
  const key = 'ky-gold';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0xffe08a, 0.35); g.fillCircle(22, 22, 21);
  g.lineStyle(5, 0xf59e0b, 1);
  g.beginPath();
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 4.6; const r = 2 + i * 0.3;
    const x = 22 + Math.cos(a) * r, y = 22 + Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.strokePath();
  g.generateTexture(key, 44, 44); g.destroy();
  return key;
}

/** Çıkış kapısı (bölüm 1-3): parlayan kemer. */
export function gateTexture(scene: Phaser.Scene): string {
  const key = 'ky-gate';
  if (has(scene, key)) return key;
  const g = gfx(scene);
  g.fillStyle(0x6c4cf1, 0.18); g.fillRoundedRect(0, 0, 56, 72, { tl: 28, tr: 28, bl: 6, br: 6 });
  g.lineStyle(5, 0x6c4cf1, 1); g.strokeRoundedRect(2, 2, 52, 68, { tl: 26, tr: 26, bl: 6, br: 6 });
  g.fillStyle(0xffffff, 0.9); g.fillTriangle(20, 28, 40, 40, 20, 52);
  g.generateTexture(key, 56, 72); g.destroy();
  return key;
}

export function enemyTexture(scene: Phaser.Scene, look: EnemyLook): string {
  if (look.kind === 'emoji') return emojiTexture(scene, `ky-emoji-${look.emoji}`, look.emoji, 44);
  const key = `ky-enemy-${look.kind}`;
  if (has(scene, key)) return key;
  const g = gfx(scene);
  if (look.kind === 'bacteria') {
    g.fillStyle(0xe5484d, 1); g.fillEllipse(22, 24, 40, 30);
    g.fillStyle(0xff8a8e, 0.8); g.fillCircle(14, 20, 5); g.fillCircle(29, 29, 4);
    g.lineStyle(3, 0xe5484d, 1);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.lineBetween(22 + Math.cos(a) * 18, 24 + Math.sin(a) * 13, 22 + Math.cos(a) * 23, 24 + Math.sin(a) * 18); }
    g.fillStyle(0xffffff, 1); g.fillCircle(16, 21, 5); g.fillCircle(28, 21, 5);
    g.fillStyle(0x13162a, 1); g.fillCircle(17, 22, 2.5); g.fillCircle(29, 22, 2.5);
    g.lineStyle(2, 0x13162a, 1); g.lineBetween(11, 15, 19, 18); g.lineBetween(33, 15, 25, 18);
  } else {
    g.fillStyle(0x2b3150, 1);
    g.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const r = i % 2 ? 13 : 21; const x = 22 + Math.cos(a) * r, y = 22 + Math.sin(a) * r; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.closePath(); g.fillPath();
    g.fillStyle(0xffffff, 1); g.fillCircle(16, 20, 5); g.fillCircle(28, 20, 5);
    g.fillStyle(0xff4d4d, 1); g.fillCircle(16, 20, 2.5); g.fillCircle(28, 20, 2.5);
    g.lineStyle(2, 0xffffff, 0.8); g.lineBetween(17, 29, 27, 29);
  }
  g.generateTexture(key, 44, 44); g.destroy();
  return key;
}

/** Sanal kontrol dokuları. */
export function controlTextures(scene: Phaser.Scene) {
  if (!has(scene, 'ky-ctl-arrow')) {
    const g = gfx(scene);
    g.fillStyle(0x13162a, 0.28); g.fillCircle(34, 34, 34);
    g.lineStyle(2, 0xffffff, 0.7); g.strokeCircle(34, 34, 33);
    g.fillStyle(0xffffff, 0.95); g.fillTriangle(22, 34, 44, 20, 44, 48);
    g.generateTexture('ky-ctl-arrow', 68, 68); g.destroy();
  }
  if (!has(scene, 'ky-ctl-jump')) {
    const g = gfx(scene);
    g.fillStyle(0x6c4cf1, 0.55); g.fillCircle(46, 46, 46);
    g.lineStyle(3, 0xffffff, 0.85); g.strokeCircle(46, 46, 44);
    g.generateTexture('ky-ctl-jump', 92, 92); g.destroy();
  }
}

export function isSolidChar(ch: string): boolean { return ch === '#' || ch === 'w'; }

/**
 * Katı karoları tek Graphics'e çizer (tema renkleri; L4 tonotopi), tek dokuya basar ve Image olarak döner.
 * (Her karede binlerce path yerine tek quad: düşük cihazlarda da akıcı.) Harita altına zemin bandı ekler.
 */
export function drawTiles(scene: Phaser.Scene, key: string, grid: string[][], theme: Theme, extraBottom: number): Phaser.GameObjects.Image {
  const rows = grid.length, cols = grid[0].length;
  if (has(scene, key)) return scene.add.image(0, 0, key).setOrigin(0);
  const g = gfx(scene);
  const colorAt = (c: number) => (theme.tonotopy ? tonotopyColor(c / cols) : theme.solid);
  const darkAt = (c: number) => (theme.tonotopy ? PColor.ValueToColor(tonotopyColor(c / cols)).darken(30).color : theme.solidDark);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = grid[r][c];
      const x = c * TILE, y = r * TILE;
      if (ch === '#') {
        g.fillStyle(colorAt(c), 1); g.fillRect(x, y, TILE, TILE);
        const above = r > 0 ? grid[r - 1][c] : '.';
        const below = r < rows - 1 ? grid[r + 1][c] : '#';
        if (!isSolidChar(above)) { g.fillStyle(theme.solidTop, 1); g.fillRoundedRect(x, y, TILE, 8, { tl: 3, tr: 3, bl: 0, br: 0 }); }
        if (!isSolidChar(below)) { g.fillStyle(darkAt(c), 1); g.fillRect(x, y + TILE - 5, TILE, 5); }
        const left = c > 0 ? grid[r][c - 1] : '#';
        const right = c < cols - 1 ? grid[r][c + 1] : '#';
        if (!isSolidChar(left)) { g.fillStyle(darkAt(c), 0.5); g.fillRect(x, y, 3, TILE); }
        if (!isSolidChar(right)) { g.fillStyle(darkAt(c), 0.5); g.fillRect(x + TILE - 3, y, 3, TILE); }
        // doku noktası
        if ((r * 7 + c * 13) % 5 === 0) { g.fillStyle(darkAt(c), 0.18); g.fillCircle(x + 10 + ((r * c) % 12), y + 14 + ((r + c) % 10), 3); }
      } else if (ch === 'w') {
        g.fillStyle(0xb98a1e, 1); g.fillRoundedRect(x, y + 4, TILE, TILE - 4, 6);
        g.fillStyle(0xe9b63a, 1); g.fillRoundedRect(x, y, TILE, TILE - 6, 7);
        g.fillStyle(0xffe08a, 0.8); g.fillCircle(x + 10, y + 9, 4); g.fillCircle(x + 22, y + 16, 3);
        g.fillStyle(0xe9b63a, 1); g.fillCircle(x + 8, y + TILE + 3, 4); g.fillCircle(x + 24, y + TILE + 6, 3);
      } else if (ch === '-') {
        g.fillStyle(theme.plank, 1); g.fillRoundedRect(x, y + 2, TILE, 10, 4);
        g.fillStyle(0xffffff, 0.35); g.fillRoundedRect(x + 2, y + 3, TILE - 4, 3, 2);
      } else if (ch === '^') {
        g.fillStyle(theme.hazard, 1);
        g.fillTriangle(x + 2, y + TILE, x + 9, y + 8, x + 16, y + TILE);
        g.fillTriangle(x + 16, y + TILE, x + 23, y + 4, x + 30, y + TILE);
        g.fillStyle(0xffffff, 0.5); g.fillTriangle(x + 6, y + TILE, x + 9, y + 14, x + 11, y + TILE);
      }
    }
  }
  // alt zemin bandı (kamera aşağı kaydığında boşluk görünmesin)
  g.fillStyle(theme.solidDark, 1);
  g.fillRect(0, rows * TILE, cols * TILE, extraBottom);
  if (theme.tonotopy) {
    for (let c = 0; c < cols; c++) { g.fillStyle(darkAt(c), 1); g.fillRect(c * TILE, rows * TILE, TILE, extraBottom); }
  }
  // zemin üstü süsleri (kıl / damla / kristal)
  for (let r = 1; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '#' || isSolidChar(grid[r - 1][c]) || grid[r - 1][c] !== '.') continue;
      const x = c * TILE, y = r * TILE;
      const seed = (r * 31 + c * 17) % 7;
      if (theme.pattern === 'auricle' && seed < 3) {
        g.lineStyle(2, 0x9c5a3c, 0.8);
        g.beginPath(); g.moveTo(x + 8 + seed * 6, y + 1); g.lineTo(x + 12 + seed * 6, y - 10 - seed * 3); g.strokePath();
      } else if (theme.pattern === 'cochlea' && seed < 2) {
        g.lineStyle(2, 0x9ad8ff, 0.7);
        g.beginPath(); g.moveTo(x + 10 + seed * 8, y + 1); g.lineTo(x + 10 + seed * 8, y - 8); g.strokePath();
        g.fillStyle(0xffffff, 0.8); g.fillCircle(x + 10 + seed * 8, y - 9, 2);
      } else if (theme.pattern === 'cavity' && seed === 0) {
        g.fillStyle(0xffffff, 0.5); g.fillCircle(x + 16, y + 3, 3);
      }
    }
  }
  g.generateTexture(key, cols * TILE, rows * TILE + extraBottom); g.destroy();
  return scene.add.image(0, 0, key).setOrigin(0);
}

/** Paralaks uzak katman: tema desenli tam ekran TileSprite (kameraya sabit; Play.update tilePosition kaydırır). */
export function makeParallax(scene: Phaser.Scene, theme: Theme): Phaser.GameObjects.TileSprite {
  const W = GAME_W, H = GAME_H;
  const farKey = `ky-bg-far-${theme.pattern}`;
  if (!has(scene, farKey)) {
    const g = gfx(scene);
    if (theme.pattern === 'auricle') {
      g.lineStyle(26, theme.far, 1);
      for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(W * 0.5, H * 0.55, 120 + i * 95, Math.PI * 1.05, Math.PI * 1.95); g.strokePath(); }
      g.lineStyle(18, theme.far, 0.7); g.beginPath(); g.arc(W * 0.5, H * 0.55, 60, Math.PI * 0.9, Math.PI * 2.1); g.strokePath();
    } else if (theme.pattern === 'canal') {
      g.lineStyle(14, theme.far, 1);
      for (let i = 0; i < 4; i++) { g.strokeEllipse(W * (0.15 + i * 0.25), H * 0.5, 120, 520); }
    } else if (theme.pattern === 'cavity') {
      g.fillStyle(theme.far, 1);
      for (let i = 0; i < 9; i++) { g.fillEllipse(((i * 137) % W), ((i * 211) % H), 150, 90); }
    } else {
      g.lineStyle(10, theme.far, 1);
      g.beginPath();
      for (let i = 0; i <= 120; i++) { const a = (i / 120) * Math.PI * 5; const r = 10 + i * 1.9; const x = W * 0.5 + Math.cos(a) * r, y = H * 0.5 + Math.sin(a) * r * 0.9; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
      g.strokePath();
    }
    g.generateTexture(farKey, W, H); g.destroy();
  }
  return scene.add.tileSprite(0, 0, W, H, farKey).setOrigin(0).setScrollFactor(0).setDepth(-20);
}

/** Paralaks orta katman: dünyaya serpiştirilmiş küçük süs sprite'ları (scrollFactor 0.45). Tam ekran doku yerine ucuz. */
export function makeMidDecor(scene: Phaser.Scene, theme: Theme, worldW: number) {
  const key = `ky-mid-${theme.pattern}`;
  if (!has(scene, key)) {
    const g = gfx(scene);
    if (theme.pattern === 'auricle') { g.lineStyle(4, theme.mid, 1); g.beginPath(); g.moveTo(6, 44); g.lineTo(22, 4); g.strokePath(); g.generateTexture(key, 28, 48); }
    else if (theme.pattern === 'canal') { g.fillStyle(theme.mid, 1); g.fillCircle(16, 16, 16); g.fillStyle(0xffffff, 0.12); g.fillCircle(11, 11, 6); g.generateTexture(key, 32, 32); }
    else if (theme.pattern === 'cavity') { g.lineStyle(4, theme.mid, 1); g.strokeCircle(20, 20, 17); g.generateTexture(key, 40, 40); }
    else { g.lineStyle(2, theme.mid, 1); g.strokeCircle(10, 10, 8); g.fillStyle(0xffffff, 0.25); g.fillCircle(7, 7, 2); g.generateTexture(key, 20, 20); }
    g.destroy();
  }
  const span = worldW * 0.45 + GAME_W + 200;
  const n = Math.ceil(span / 110);
  for (let i = 0; i < n; i++) {
    const x = i * 110 + ((i * 37) % 60);
    const y = 90 + ((i * 173) % (GAME_H - 300));
    const s = 0.7 + ((i * 7) % 5) * 0.15;
    scene.add.image(x, y, key).setScrollFactor(0.45, 0.3).setDepth(-10).setScale(s).setAlpha(0.9);
  }
}
