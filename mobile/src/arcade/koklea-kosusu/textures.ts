import Phaser from 'phaser';
import { emojiTexture } from '../shared';

/** Phaser Graphics ile üretilen dokular — varlık dosyası yok. */

function gfx(scene: Phaser.Scene) { return scene.add.graphics({ x: 0, y: 0 }); }

/** Rengin doygunluk/parlaklığını en az minS/minV'ye çeker (HSV). → [r,g,b] 0-255 */
function vivid(color: number, minS: number, minV: number): [number, number, number] {
  const r = ((color >> 16) & 255) / 255, g = ((color >> 8) & 255) / 255, b = (color & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const s = Math.max(max === 0 ? 0 : d / max, minS), v = Math.max(max, minV);
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r1, g1, b1] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

/** Gürültü dikeni: koyu lacivert üçlü diken, pembe uç, ses dalgası çizgisi. 40x56 */
export function spikeTexture(scene: Phaser.Scene): string {
  const k = 'kk-spike'; if (scene.textures.exists(k)) return k;
  const g = gfx(scene);
  g.fillStyle(0x1f2544, 1);
  g.fillTriangle(0, 56, 14, 56, 7, 22);
  g.fillTriangle(12, 56, 28, 56, 20, 2);
  g.fillTriangle(26, 56, 40, 56, 33, 22);
  g.fillStyle(0xf0567a, 1);
  g.fillTriangle(16, 16, 24, 16, 20, 2);
  g.fillTriangle(4, 32, 10, 32, 7, 22);
  g.fillTriangle(30, 32, 36, 32, 33, 22);
  g.lineStyle(2, 0xf0567a, 0.8);
  g.beginPath(); g.arc(20, 10, 12, Math.PI * 1.2, Math.PI * 1.8); g.strokePath();
  g.beginPath(); g.arc(20, 10, 17, Math.PI * 1.25, Math.PI * 1.75); g.strokePath();
  g.generateTexture(k, 40, 56); g.destroy(); return k;
}

/** Serumen: amber yapışkan blob. 56x36 */
export function serumenTexture(scene: Phaser.Scene): string {
  const k = 'kk-serumen'; if (scene.textures.exists(k)) return k;
  const g = gfx(scene);
  g.fillStyle(0xd98b00, 1);
  g.fillEllipse(28, 24, 54, 22);
  g.fillCircle(18, 16, 13); g.fillCircle(34, 12, 12); g.fillCircle(44, 20, 9);
  g.fillStyle(0xf5b942, 1); g.fillCircle(32, 12, 6); g.fillEllipse(20, 22, 18, 8);
  g.fillStyle(0xffffff, 0.55); g.fillCircle(30, 9, 2.5); g.fillCircle(15, 13, 2);
  g.generateTexture(k, 56, 36); g.destroy(); return k;
}

/** Gürültü bulutu: koyu gri bulut, sarı şimşek zikzağı. 112x70 */
export function cloudTexture(scene: Phaser.Scene): string {
  const k = 'kk-cloud'; if (scene.textures.exists(k)) return k;
  const g = gfx(scene);
  g.fillStyle(0x3b4160, 1);
  g.fillCircle(26, 40, 22); g.fillCircle(50, 28, 26); g.fillCircle(80, 34, 24); g.fillCircle(96, 46, 15);
  g.fillRoundedRect(10, 40, 92, 26, 12);
  g.fillStyle(0x59607f, 1); g.fillCircle(50, 26, 16); g.fillCircle(80, 32, 13);
  g.lineStyle(4, 0xffd23f, 1);
  g.beginPath(); g.moveTo(48, 20); g.lineTo(38, 38); g.lineTo(54, 36); g.lineTo(44, 60); g.strokePath();
  g.lineStyle(3, 0xffd23f, 0.9);
  g.beginPath(); g.moveTo(80, 24); g.lineTo(72, 40); g.lineTo(84, 38); g.lineTo(76, 56); g.strokePath();
  g.generateTexture(k, 112, 70); g.destroy(); return k;
}

/** Ototoksik damla: yeşil damla, parıltı. 30x40 */
export function dropTexture(scene: Phaser.Scene): string {
  const k = 'kk-drop'; if (scene.textures.exists(k)) return k;
  const g = gfx(scene);
  g.fillStyle(0x10b981, 1);
  g.fillTriangle(15, 0, 2, 24, 28, 24);
  g.fillCircle(15, 26, 13);
  g.fillStyle(0x064e3b, 1); g.fillCircle(11, 25, 2.4); g.fillCircle(19, 25, 2.4);
  g.lineStyle(2, 0x064e3b, 1); g.beginPath(); g.arc(15, 31, 4, Math.PI * 1.15, Math.PI * 1.85); g.strokePath();
  g.fillStyle(0xffffff, 0.6); g.fillCircle(9, 17, 3);
  g.generateTexture(k, 30, 40); g.destroy(); return k;
}

/** Frekans jetonu: altın madeni para, ♪ işareti. canvas 32 */
export function coinTexture(scene: Phaser.Scene): string {
  const k = 'kk-coin'; if (scene.textures.exists(k)) return k;
  const size = 32; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#d98b00'; c.beginPath(); c.arc(16, 16, 15, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(16, 16, 12, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(11, 10, 3.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7a4b00'; c.font = 'bold 19px "Noto Color Emoji","Segoe UI Symbol","Apple Symbols",Arial,sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♪', 16, 17);
  scene.textures.addCanvas(k, canvas); return k;
}

/** Güç rozeti: beyaz daire, renkli halka, ortada emoji. canvas 48 */
export function badgeTexture(scene: Phaser.Scene, key: string, emoji: string, ring: string): string {
  if (scene.textures.exists(key)) return key;
  const size = 48; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
  const c = canvas.getContext('2d')!;
  c.fillStyle = ring; c.beginPath(); c.arc(24, 24, 23, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(24, 24, 19, 0, Math.PI * 2); c.fill();
  c.font = '24px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emoji, 24, 26);
  scene.textures.addCanvas(key, canvas); return key;
}

/** Küçük yumuşak nokta (toz/parçacık). */
export function dotTexture(scene: Phaser.Scene, key = 'kk-dot', color = 0xffffff, r = 6): string {
  if (scene.textures.exists(key)) return key;
  const g = gfx(scene); g.fillStyle(color, 1); g.fillCircle(r, r, r); g.generateTexture(key, r * 2, r * 2); g.destroy(); return key;
}

/** Kalkan balonu: açık mavi halka. */
export function shieldRingTexture(scene: Phaser.Scene): string {
  const k = 'kk-ring'; if (scene.textures.exists(k)) return k;
  const g = gfx(scene);
  g.fillStyle(0x38bdf8, 0.18); g.fillCircle(40, 40, 38);
  g.lineStyle(3, 0x38bdf8, 0.9); g.strokeCircle(40, 40, 37);
  g.fillStyle(0xffffff, 0.5); g.fillCircle(26, 24, 6);
  g.generateTexture(k, 80, 80); g.destroy(); return k;
}

/** Kahramanın gölgesi. */
export function shadowTexture(scene: Phaser.Scene): string {
  const k = 'kk-shadow'; if (scene.textures.exists(k)) return k;
  const g = gfx(scene); g.fillStyle(0x13162a, 0.18); g.fillEllipse(24, 6, 48, 12); g.generateTexture(k, 48, 12); g.destroy(); return k;
}

/** Uyarı işareti (damla gelmeden önce). */
export function warnTexture(scene: Phaser.Scene): string {
  const k = 'kk-warn'; if (scene.textures.exists(k)) return k;
  const g = gfx(scene);
  g.fillStyle(0xf0567a, 1); g.fillTriangle(16, 2, 2, 28, 30, 28);
  g.fillStyle(0xffffff, 1); g.fillRect(14, 10, 4, 10); g.fillCircle(16, 24, 2.2);
  g.generateTexture(k, 32, 30); g.destroy(); return k;
}

function spiral(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r0: number, turns: number, color: number, alpha: number, width: number) {
  g.lineStyle(width, color, alpha);
  g.beginPath();
  const steps = Math.floor(turns * 60);
  for (let i = 0; i <= steps; i++) {
    const a = (i / 60) * Math.PI * 2;
    const r = r0 * (1 - i / steps * 0.92);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.9;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.strokePath();
}

/**
 * Paralaks katmanları, verilen tonotopi rengiyle üretilir (adım başına bir kez).
 * far: uzak koklea taslağı; mid: spiral duvar yayları; near: sıvı kabarcıkları; ground: baziler membran.
 */
export function layerTextures(scene: Phaser.Scene, step: number, color: number) {
  const far = `kk-far-${step}`, mid = `kk-mid-${step}`, near = `kk-near-${step}`, ground = `kk-ground-${step}`;
  if (!scene.textures.exists(far)) {
    const g = gfx(scene);
    spiral(g, 230, 250, 150, 2.6, color, 0.10, 10);
    spiral(g, 230, 250, 150, 2.6, color, 0.18, 3);
    spiral(g, 560, 330, 70, 2, color, 0.14, 3);
    spiral(g, 20, 420, 60, 2, color, 0.12, 3);
    g.generateTexture(far, 640, 600); g.destroy();
  }
  if (!scene.textures.exists(mid)) {
    const g = gfx(scene);
    // tavan yayları (koklear kanal duvarı)
    for (let i = 0; i < 3; i++) {
      g.lineStyle(14 - i * 3, color, 0.16 - i * 0.03);
      g.beginPath(); g.arc(260, -260 + i * 20, 380 + i * 36, Math.PI * 0.12, Math.PI * 0.88); g.strokePath();
    }
    for (let i = 0; i < 3; i++) {
      g.lineStyle(14 - i * 3, color, 0.14 - i * 0.03);
      g.beginPath(); g.arc(300, 1040 - i * 20, 400 + i * 36, Math.PI * 1.12, Math.PI * 1.88); g.strokePath();
    }
    // dikey "kaburga" çizgileri
    g.lineStyle(6, color, 0.07);
    for (let x = 30; x < 520; x += 130) { g.beginPath(); g.moveTo(x, 120); g.lineTo(x + 40, 560); g.strokePath(); }
    g.generateTexture(mid, 520, 780); g.destroy();
  }
  if (!scene.textures.exists(near)) {
    const g = gfx(scene);
    const bubbles = [[40, 120, 14], [120, 300, 8], [210, 90, 22], [300, 240, 10], [380, 420, 16], [80, 480, 10], [260, 540, 7], [160, 640, 18], [350, 620, 9], [430, 160, 12], [20, 700, 8], [450, 700, 14]];
    for (const [x, y, r] of bubbles) {
      g.fillStyle(color, 0.12); g.fillCircle(x, y, r);
      g.lineStyle(2, color, 0.28); g.strokeCircle(x, y, r);
      g.fillStyle(0xffffff, 0.7); g.fillCircle(x - r * 0.35, y - r * 0.35, Math.max(1.5, r * 0.22));
    }
    g.generateTexture(near, 480, 780); g.destroy();
  }
  if (!scene.textures.exists(ground)) {
    const g = gfx(scene);
    // zemin canlı kalsın: mor→turuncu RGB geçişi ortada grileşir, doygunluğu yükselt
    const [vr, vg, vb] = vivid(color, 0.62, 0.9);
    const base = (vr << 16) | (vg << 8) | vb;
    const dark = (Math.round(vr * 0.75) << 16) | (Math.round(vg * 0.75) << 8) | Math.round(vb * 0.75);
    g.fillStyle(base, 1); g.fillRect(0, 0, 96, 180);
    g.fillStyle(dark, 0.35); g.fillRect(0, 14, 96, 166);
    // baziler membran: açık şerit
    g.fillStyle(0xffffff, 0.85); g.fillRect(0, 0, 96, 6);
    g.fillStyle(0xffffff, 0.25); g.fillRect(0, 6, 96, 8);
    // tüy hücresi gövdeleri: üç sıra dış, bir sıra iç
    g.fillStyle(0xffffff, 0.22);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++) g.fillRoundedRect(8 + i * 24, 26 + row * 18, 12, 14, 5);
    g.fillStyle(0xffffff, 0.3);
    for (let i = 0; i < 2; i++) g.fillRoundedRect(18 + i * 48, 86, 16, 18, 6);
    // sinir lifleri
    g.lineStyle(2, 0xffffff, 0.16);
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(14 + i * 24, 104); g.lineTo(20 + i * 24, 180); g.strokePath(); }
    g.generateTexture(ground, 96, 180); g.destroy();
  }
  return { far, mid, near, ground };
}

export function powerTextures(scene: Phaser.Scene) {
  return {
    shield: badgeTexture(scene, 'kk-pw-shield', '🦻', '#38bdf8'),
    magnet: badgeTexture(scene, 'kk-pw-magnet', '⚡', '#f59e0b'),
    life: badgeTexture(scene, 'kk-pw-life', '💚', '#22c55e'),
    note: emojiTexture(scene, 'kk-note', '🎵', 40),
  };
}
