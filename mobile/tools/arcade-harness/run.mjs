/**
 * Arcade duman testi: oyunu tarayıcıda gerçekten çalıştırır.
 * Kullanım: node tools/arcade-harness/run.mjs <oyun-klasörü> [saniye]
 * - src/arcade/<oyun>/index.ts esbuild ile paketlenir
 * - Chromium'da açılır, dokunuşlar simüle edilir, konsol hataları toplanır
 * - ekran görüntüleri scratch klasörüne yazılır; gameover olayı beklenir
 */
import { build } from 'esbuild';
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const game = process.argv[2];
const seconds = Number(process.argv[3] ?? 20);
if (!game) { console.error('oyun adı gerekli'); process.exit(2); }
const root = path.resolve(process.cwd());
const out = path.join(process.env.ARCADE_OUT ?? path.join(root, '.arcade-out'), game);
fs.mkdirSync(out, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/arcade', game, 'index.ts')],
  bundle: true, format: 'iife', globalName: 'ArcadeGame', outfile: path.join(out, 'game.js'),
  alias: { '@': path.join(root, 'src') }, logLevel: 'error', target: 'es2020', sourcemap: 'inline',
});
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#fff;overflow:hidden}#root{position:fixed;inset:0}</style></head><body><div id="root"></div><script src="game.js"></script><script>
window.__events=[];window.__done=null;
window.__handle=ArcadeGame.mount(document.getElementById('root'),{onEvent:(e)=>{window.__events.push(e);if(e.type==='gameover')window.__done=e;},seed:42,mode:'normal',debug:true,sounds:false});
</script></body></html>`);

const exe = process.env.PLAYWRIGHT_CHROMIUM ?? undefined;
const browser = await chromium.launch({ executablePath: exe, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
await page.goto('file://' + path.join(out, 'index.html'));
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(out, 'shot-0.png') });
// basit otomatik oyuncu: ekrana rastgele dokun
const t0 = Date.now(); let shots = 1;
while (Date.now() - t0 < seconds * 1000) {
  const done = await page.evaluate(() => window.__done);
  if (done) break;
  const x = 60 + Math.random() * 270, y = 300 + Math.random() * 400;
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(220);
  if ((Date.now() - t0) / 1000 > shots * 4) { await page.screenshot({ path: path.join(out, `shot-${shots}.png`) }); shots++; }
}
await page.screenshot({ path: path.join(out, 'shot-final.png') });
const events = await page.evaluate(() => window.__events);
const done = await page.evaluate(() => window.__done);
await browser.close();
const summary = { game, ready: events.some((e) => e.type === 'ready'), gameover: done, eventCount: events.length, errors };
console.log(JSON.stringify(summary, null, 2));
if (errors.length || !summary.ready) process.exit(1);
