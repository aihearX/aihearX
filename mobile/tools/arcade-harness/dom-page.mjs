/**
 * Metro'nun ürettiği GERÇEK DOM bileşeni sayfalarını (expo export → www.bundle/*.html)
 * native köprüyü taklit ederek tarayıcıda çalıştırır. iPhone'a giden dosyaların aynısı test edilir.
 * Kullanım: node tools/arcade-harness/dom-page.mjs <export-dir> [chromium|webkit] [saniye]
 */
import { chromium, webkit } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';

const dir = process.argv[2]; const engine = process.argv[3] ?? 'chromium'; const seconds = Number(process.argv[4] ?? 12);
const htmls = fs.readdirSync(path.join(dir, 'www.bundle')).filter((f) => f.endsWith('.html'));
const launch = engine === 'webkit' ? webkit.launch() : chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
const browser = await launch;
let failed = 0;
for (const h of htmls) {
  const page = await browser.newPage({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const errors = []; const messages = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
  await page.exposeFunction('__hostMessage', (s) => { try { const m = JSON.parse(s); messages.push(m); } catch { messages.push(s); } });
  await page.addInitScript(() => {
    const initialProps = { names: ['onEvent'], props: { seed: 42, mode: 'normal', sounds: false } };
    window.ReactNativeWebView = {
      injectedObjectJson: () => JSON.stringify({ EXPO_DOM_HOST_OS: 'ios', initialProps }),
      postMessage: (s) => {
        window.__hostMessage(s);
        try {
          const m = JSON.parse(s);
          if (m.type === '$$native_action') {
            setTimeout(() => window.dispatchEvent(new CustomEvent('$$dom_event', { detail: { type: '$$native_action_result', data: { uid: m.data.uid, actionId: m.data.actionId, result: null } } })), 0);
          }
        } catch { /* */ }
      },
    };
  });
  await page.goto('file://' + path.join(dir, 'www.bundle', h));
  await page.waitForTimeout(2500);
  const t0 = Date.now();
  while (Date.now() - t0 < seconds * 1000) {
    await page.touchscreen.tap(60 + Math.random() * 270, 300 + Math.random() * 400);
    await page.waitForTimeout(250);
  }
  const shot = path.join(dir, `dom-${engine}-${h.replace('.html', '')}.png`);
  await page.screenshot({ path: shot });
  const canvas = await page.evaluate(() => !!document.querySelector('canvas'));
  const evts = messages.filter((m) => m && m.type === '$$native_action').map((m) => m.data.args?.[0]?.type);
  const ok = errors.length === 0 && canvas;
  if (!ok) failed++;
  console.log(JSON.stringify({ page: h, engine, canvas, events: evts.slice(0, 8), errors: errors.slice(0, 5), screenshot: shot }));
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
