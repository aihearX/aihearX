import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2];
const htmls = fs.readdirSync(path.join(dir, 'www.bundle')).filter((f) => f.endsWith('.html'));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const h of htmls) {
  const page = await browser.newPage({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });
  const errors = []; page.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.join(dir, 'www.bundle', h));
  await page.waitForTimeout(2500);
  const body = await page.evaluate(() => document.body.innerHTML.slice(0, 300));
  console.log(h, 'errors:', errors.slice(0, 3), 'canvas:', body.includes('<canvas'));
  await page.close();
}
await browser.close();
