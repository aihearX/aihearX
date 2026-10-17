import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../shared';
import type { ZoneId } from './zones';

/** Platform dokuları (genişlik × yükseklik) */
export const PLAT = {
  normal: { key: 'zz-p-normal', w: 72, h: 20 },
  moving: { key: 'zz-p-bone', w: 84, h: 24 },
  thin: { key: 'zz-p-thin', w: 72, h: 14 },
  thinCrack: { key: 'zz-p-thin-crack', w: 72, h: 14 },
  drum: { key: 'zz-p-drum', w: 88, h: 30 },
  spring: { key: 'zz-p-spring', w: 72, h: 40 },
  ghost: { key: 'zz-p-ghost', w: 72, h: 20 },
} as const;

type G = Phaser.GameObjects.Graphics;

function gfx(scene: Phaser.Scene): G { return scene.add.graphics({ x: 0, y: 0 }); }
function done(g: G, key: string, w: number, h: number) { g.generateTexture(key, w, h); g.destroy(); }

/** Küçük deterministik rastgele (arka plan desenleri için) */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function buildTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('zz-dot')) return;
  let g: G;

  // parçacık noktası
  g = gfx(scene); g.fillStyle(0xffffff, 1); g.fillCircle(4, 4, 4); done(g, 'zz-dot', 8, 8);

  // --- Platformlar ---
  // Kıkırdak (beyaz, bölgeye göre tint)
  g = gfx(scene);
  g.fillStyle(0xffffff, 1); g.fillRoundedRect(0, 2, 72, 18, 9);
  g.fillStyle(0x000000, 0.16); g.fillRoundedRect(0, 13, 72, 7, { tl: 0, tr: 0, bl: 9, br: 9 });
  g.fillStyle(0xffffff, 0.55); g.fillRoundedRect(8, 5, 34, 4, 2);
  g.fillStyle(0x000000, 0.08); g.fillCircle(20, 12, 2); g.fillCircle(38, 13, 2); g.fillCircle(56, 12, 2);
  done(g, PLAT.normal.key, 72, 20);

  // Kemikçik (hareketli): kemik şekli
  g = gfx(scene);
  const bone = 0xfff6e0, boneLine = 0xcfb07f;
  g.lineStyle(3, boneLine, 1); g.fillStyle(bone, 1);
  for (const [x, y] of [[10, 7], [10, 17], [74, 7], [74, 17]]) { g.fillCircle(x, y, 7); g.strokeCircle(x, y, 7); }
  g.fillStyle(bone, 1); g.fillRect(12, 5, 60, 14);
  g.lineStyle(3, boneLine, 1); g.lineBetween(14, 5, 70, 5); g.lineBetween(14, 19, 70, 19);
  g.fillStyle(0xffffff, 0.6); g.fillRoundedRect(20, 8, 26, 3, 1.5);
  done(g, PLAT.moving.key, 84, 24);

  // İnce zar (kırılgan)
  const thin = (key: string, extra: boolean) => {
    const q = gfx(scene);
    q.fillStyle(0xcfe8ff, 0.95); q.fillRoundedRect(0, 2, 72, 10, 5);
    q.fillStyle(0xffffff, 0.65); q.fillRoundedRect(6, 4, 28, 3, 1.5);
    q.lineStyle(1.5, 0x4f86c6, 0.85);
    q.lineBetween(30, 3, 34, 8); q.lineBetween(34, 8, 31, 12); q.lineBetween(34, 8, 39, 7);
    if (extra) {
      q.lineBetween(12, 3, 16, 9); q.lineBetween(16, 9, 13, 12); q.lineBetween(52, 2, 48, 8); q.lineBetween(48, 8, 53, 12); q.lineBetween(60, 4, 66, 10);
    }
    done(q, key, 72, 14);
  };
  thin(PLAT.thin.key, false); thin(PLAT.thinCrack.key, true);

  // Kulak zarı trambolini
  g = gfx(scene);
  g.fillStyle(0xc2415f, 1); g.fillRoundedRect(0, 10, 88, 20, 10);
  g.fillStyle(0xf9c6cf, 1); g.fillEllipse(44, 14, 78, 20);
  g.lineStyle(2, 0xd46f85, 0.95); g.strokeEllipse(44, 14, 78, 20); g.strokeEllipse(44, 14, 52, 13); g.strokeEllipse(44, 14, 26, 7);
  g.fillStyle(0xc2415f, 1); g.fillCircle(44, 14, 2.5);
  g.fillStyle(0xffffff, 0.7); g.fillEllipse(30, 10, 16, 4);
  done(g, PLAT.drum.key, 88, 30);

  // Kıl hücresi yayı
  g = gfx(scene);
  g.fillStyle(0xd9ccff, 1); g.fillRoundedRect(0, 22, 72, 18, 9);
  g.fillStyle(0x000000, 0.14); g.fillRoundedRect(0, 33, 72, 7, { tl: 0, tr: 0, bl: 9, br: 9 });
  g.fillStyle(0x8b6cf7, 1); g.fillRoundedRect(24, 18, 24, 7, 3);
  g.lineStyle(3, 0x6c4cf1, 1);
  for (let i = 0; i < 5; i++) { const x = 26 + i * 5; const top = 4 + Math.abs(i - 2) * 3; g.lineBetween(x, 20, x + (i - 2) * 1.5, top); g.fillStyle(0x6c4cf1, 1); g.fillCircle(x + (i - 2) * 1.5, top, 2.2); }
  done(g, PLAT.spring.key, 72, 40);

  // Kaybolan platform (hayalet)
  g = gfx(scene);
  g.fillStyle(0xffffff, 0.45); g.fillRoundedRect(0, 2, 72, 18, 9);
  g.lineStyle(2, 0x7f93ff, 0.95);
  for (let x = 6; x < 66; x += 12) g.lineBetween(x, 3, x + 6, 3);
  for (let x = 6; x < 66; x += 12) g.lineBetween(x, 19, x + 6, 19);
  g.lineBetween(1, 7, 1, 15); g.lineBetween(71, 7, 71, 15);
  done(g, PLAT.ghost.key, 72, 20);

  // Serumen
  g = gfx(scene);
  g.fillStyle(0xe0a823, 1); g.fillEllipse(22, 15, 44, 20); g.fillCircle(14, 10, 10); g.fillCircle(30, 9, 9);
  g.fillStyle(0xc48a12, 1); g.fillCircle(35, 23, 4);
  g.fillStyle(0xffffff, 0.35); g.fillEllipse(16, 8, 10, 5);
  done(g, 'zz-serumen', 44, 26);

  // --- Düşmanlar ---
  g = gfx(scene);
  g.lineStyle(2, 0x4f8f1f, 1);
  g.lineBetween(5, 20, 1, 9); g.lineBetween(4, 30, 0, 38); g.lineBetween(43, 20, 47, 9); g.lineBetween(44, 30, 48, 38); g.lineBetween(24, 10, 24, 1);
  g.fillStyle(0x86d13f, 1); g.fillEllipse(24, 26, 42, 30);
  g.lineStyle(2, 0x4f8f1f, 1); g.strokeEllipse(24, 26, 42, 30);
  g.fillStyle(0x5fae2a, 1); g.fillCircle(12, 32, 3); g.fillCircle(36, 33, 2.5); g.fillCircle(26, 38, 2);
  g.fillStyle(0xffffff, 1); g.fillCircle(17, 23, 6); g.fillCircle(31, 23, 6);
  g.fillStyle(0x13162a, 1); g.fillCircle(18, 24, 3); g.fillCircle(32, 24, 3);
  g.lineStyle(2.5, 0x2f5e12, 1); g.lineBetween(11, 15, 21, 19); g.lineBetween(37, 15, 27, 19);
  g.lineBetween(19, 33, 29, 33);
  done(g, 'zz-bakteri', 48, 48);

  g = gfx(scene);
  g.fillStyle(0x9aa3b4, 1); g.fillCircle(26, 34, 20); g.fillCircle(48, 24, 24); g.fillCircle(72, 34, 20); g.fillRoundedRect(12, 34, 74, 18, 9);
  g.fillStyle(0xffffff, 0.25); g.fillCircle(44, 20, 12);
  g.fillStyle(0x3b4252, 1); g.fillCircle(40, 30, 3); g.fillCircle(58, 30, 3);
  g.lineStyle(2.5, 0x3b4252, 1); g.lineBetween(43, 40, 55, 40);
  g.lineStyle(3, 0xffffff, 0.85);
  g.beginPath(); g.moveTo(18, 46); for (let i = 1; i <= 8; i++) g.lineTo(18 + i * 8, 46 + (i % 2 ? -4 : 4)); g.strokePath();
  done(g, 'zz-bulut', 96, 56);

  // --- Toplanabilirler ---
  if (!scene.textures.exists('zz-coin')) {
    const c = document.createElement('canvas'); c.width = 28; c.height = 28;
    const x = c.getContext('2d')!;
    const grad = x.createRadialGradient(11, 10, 2, 14, 14, 14); grad.addColorStop(0, '#ffe58a'); grad.addColorStop(1, '#f0a500');
    x.fillStyle = grad; x.beginPath(); x.arc(14, 14, 12.5, 0, Math.PI * 2); x.fill();
    x.lineWidth = 2; x.strokeStyle = '#c47d00'; x.stroke();
    x.fillStyle = '#6b4100'; x.font = 'bold 17px Arial, Helvetica, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('♪', 14, 15);
    scene.textures.addCanvas('zz-coin', c);
  }

  // İşitme cihazı (jetpack)
  g = gfx(scene);
  g.lineStyle(4, 0x14a39e, 1);
  g.beginPath(); g.arc(21, 9, 8, Math.PI, 0, false); g.strokePath();
  g.lineBetween(29, 9, 29, 18);
  g.fillStyle(0x14a39e, 1); g.fillRoundedRect(7, 7, 13, 24, 6);
  g.fillStyle(0xffffff, 0.35); g.fillRoundedRect(10, 10, 4, 14, 2);
  g.fillStyle(0x7dd3fc, 1); g.fillCircle(13.5, 26, 2.2);
  g.fillStyle(0x6ee7e0, 1); g.fillCircle(29, 22, 4.5);
  done(g, 'zz-cihaz', 36, 36);

  // Koklear implant (kalkan)
  g = gfx(scene);
  g.lineStyle(2.5, 0x6c4cf1, 1); g.lineBetween(20, 14, 27, 8);
  g.fillStyle(0x6c4cf1, 1); g.fillCircle(15, 20, 11);
  g.lineStyle(2, 0xffffff, 0.8); g.strokeCircle(15, 20, 6.5);
  g.fillStyle(0xffffff, 1); g.fillCircle(15, 20, 2.5);
  g.fillStyle(0xa78bfa, 1); g.fillCircle(29, 7, 5); g.lineStyle(1.5, 0xffffff, 0.8); g.strokeCircle(29, 7, 2.5);
  done(g, 'zz-implant', 36, 36);

  // Ses patlaması mühimmatı
  g = gfx(scene);
  g.fillStyle(0xf97316, 1); g.fillCircle(16, 16, 15);
  g.fillStyle(0xffffff, 0.25); g.fillCircle(11, 11, 5);
  g.lineStyle(2.5, 0xffffff, 1);
  for (const r of [4, 8, 12]) { g.beginPath(); g.arc(10, 16, r, -Math.PI / 3, Math.PI / 3, false); g.strokePath(); }
  done(g, 'zz-ammo', 32, 32);

  // Mermi: ses dalgası
  g = gfx(scene);
  g.lineStyle(3.5, 0xffffff, 0.9);
  for (const r of [6, 11, 16]) { g.beginPath(); g.arc(12, 30, r, Math.PI * 1.17, Math.PI * 1.83, false); g.strokePath(); }
  g.lineStyle(2, 0x6c4cf1, 1);
  for (const r of [6, 11, 16]) { g.beginPath(); g.arc(12, 30, r, Math.PI * 1.17, Math.PI * 1.83, false); g.strokePath(); }
  done(g, 'zz-bullet', 24, 32);

  // Halka (dalga) ve kalkan
  g = gfx(scene); g.lineStyle(5, 0xffffff, 1); g.strokeCircle(40, 40, 36); done(g, 'zz-ring', 80, 80);
  g = gfx(scene); g.fillStyle(0x22d3ee, 0.14); g.fillCircle(42, 42, 38); g.lineStyle(4, 0x22d3ee, 0.95); g.strokeCircle(42, 42, 38); g.lineStyle(2, 0xffffff, 0.5); g.strokeCircle(42, 42, 32); done(g, 'zz-shield', 84, 84);

  // Ateş butonu tabanı
  g = gfx(scene); g.fillStyle(0x000000, 0.12); g.fillCircle(36, 38, 34); g.fillStyle(0xf97316, 1); g.fillCircle(36, 36, 32); g.fillStyle(0xffffff, 0.22); g.fillCircle(28, 26, 12); g.lineStyle(3, 0xffffff, 0.9); g.strokeCircle(36, 36, 32); done(g, 'zz-btn', 72, 76);

  // --- Arka planlar ---
  for (const z of ['kanal', 'orta', 'koklea', 'sinir'] as ZoneId[]) buildBackground(scene, z);
}

const TWO_PI = Math.PI * 2;

/** Bölge arka planı: 'zz-bgF-<zone>' (uzak) ve 'zz-bgN-<zone>' (yakın). Dikeyde dönecek şekilde çizilir. */
function buildBackground(scene: Phaser.Scene, zone: ZoneId) {
  const W = GAME_W, H = GAME_H;
  const rnd = lcg(zone.length * 7919 + 17);
  let g = gfx(scene);
  // uzak katman
  if (zone === 'kanal') {
    const wall = (side: -1 | 1, color: number, alpha: number, base: number, amp: number, phase: number) => {
      const pts: Phaser.Types.Math.Vector2Like[] = [];
      for (let y = 0; y <= H; y += 12) { const x = base + amp * Math.sin((y / H) * TWO_PI * 2 + phase); pts.push({ x: side < 0 ? x : W - x, y }); }
      pts.push({ x: side < 0 ? 0 : W, y: H }); pts.push({ x: side < 0 ? 0 : W, y: 0 });
      g.fillStyle(color, alpha); g.fillPoints(pts, true);
    };
    wall(-1, 0xf3b58d, 0.7, 84, 22, 0); wall(1, 0xf3b58d, 0.7, 84, 22, 1.1);
    wall(-1, 0xe89a6c, 0.55, 48, 14, 0.4); wall(1, 0xe89a6c, 0.55, 48, 14, 1.5);
    g.fillStyle(0xffffff, 0.16); g.fillRect(120, 0, 150, H);
  } else if (zone === 'orta') {
    for (const [cx, cy, maxR] of [[100, 220, 150], [305, 560, 120]]) {
      for (let r = 26; r <= maxR; r += 24) { g.lineStyle(9, 0xf5a7bb, 0.35 - r / maxR * 0.2); g.strokeCircle(cx, cy, r); }
      g.fillStyle(0xffffff, 0.35); g.fillCircle(cx, cy, 10);
    }
  } else if (zone === 'koklea') {
    const cx = W / 2, cy = H / 2;
    g.lineStyle(18, 0xffffff, 0.42);
    g.beginPath();
    for (let a = 0; a <= TWO_PI * 2.6; a += 0.06) { const r = 18 + a * 26; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) * 0.9; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.strokePath();
    g.lineStyle(4, 0x6c4cf1, 0.18);
    g.beginPath();
    for (let a = 0; a <= TWO_PI * 2.6; a += 0.06) { const r = 18 + a * 26; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) * 0.9; if (a === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.strokePath();
  } else {
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 16; i++) nodes.push({ x: 20 + rnd() * (W - 40), y: 24 + rnd() * (H - 48) });
    g.lineStyle(2, 0x4cc9ff, 0.28);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const near = nodes.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) })).filter((o) => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 2);
      for (const n of near) g.lineBetween(a.x, a.y, nodes[n.j].x, nodes[n.j].y);
    }
    for (const n of nodes) { g.fillStyle(0x4cc9ff, 0.35); g.fillCircle(n.x, n.y, 5); }
  }
  g.generateTexture(`zz-bgF-${zone}`, W, H); g.destroy();

  // yakın katman
  g = gfx(scene);
  if (zone === 'kanal') {
    for (let i = 0; i < 26; i++) {
      const y = 10 + rnd() * (H - 20); const side = rnd() < 0.5 ? -1 : 1; const x0 = side < 0 ? 30 + rnd() * 40 : W - 30 - rnd() * 40;
      g.lineStyle(2, 0xb8743f, 0.5); g.lineBetween(x0, y, x0 + side * -1 * (14 + rnd() * 10), y - 10 + rnd() * 20);
    }
    for (let i = 0; i < 10; i++) { g.fillStyle(0xe3b23c, 0.45); g.fillCircle(40 + rnd() * (W - 80), 10 + rnd() * (H - 20), 2 + rnd() * 3); }
  } else if (zone === 'orta') {
    const boneAt = (x1: number, y1: number, x2: number, y2: number) => {
      g.lineStyle(10, 0xffffff, 0.55); g.lineBetween(x1, y1, x2, y2);
      g.fillStyle(0xffffff, 0.55); g.fillCircle(x1, y1, 9); g.fillCircle(x2, y2, 9);
    };
    boneAt(60, 90, 110, 150); boneAt(300, 300, 340, 250); boneAt(70, 450, 120, 430); boneAt(290, 650, 330, 700);
    for (let i = 0; i < 14; i++) { g.fillStyle(0xffffff, 0.6); g.fillCircle(20 + rnd() * (W - 40), 10 + rnd() * (H - 20), 1.5 + rnd() * 2); }
  } else if (zone === 'koklea') {
    const cx = W / 2, cy = H / 2;
    for (let a = 0.6; a <= TWO_PI * 2.6; a += 0.55) {
      const r = 18 + a * 26 + 16; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) * 0.9;
      if (x < 12 || x > W - 12 || y < 12 || y > H - 12) continue;
      g.lineStyle(2, 0x6c4cf1, 0.35);
      for (let k = -1; k <= 1; k++) g.lineBetween(x, y, x + Math.cos(a) * 10 + k * 3, y + Math.sin(a) * 10 + k * 2);
      g.fillStyle(0xffffff, 0.5); g.fillCircle(x, y, 3);
    }
    for (let i = 0; i < 12; i++) { g.fillStyle(0xffffff, 0.5); g.fillCircle(20 + rnd() * (W - 40), 10 + rnd() * (H - 20), 2 + rnd() * 2); }
  } else {
    for (let i = 0; i < 9; i++) {
      const x = 24 + rnd() * (W - 48), y = 24 + rnd() * (H - 48);
      g.fillStyle(0x9be7ff, 0.12); g.fillCircle(x, y, 16);
      g.fillStyle(0x9be7ff, 0.6); g.fillCircle(x, y, 6);
      g.lineStyle(2, 0x9be7ff, 0.35);
      for (let k = 0; k < 3; k++) { const a = rnd() * TWO_PI; g.lineBetween(x, y, x + Math.cos(a) * (18 + rnd() * 14), y + Math.sin(a) * (18 + rnd() * 14)); }
    }
  }
  g.generateTexture(`zz-bgN-${zone}`, W, H); g.destroy();
}
