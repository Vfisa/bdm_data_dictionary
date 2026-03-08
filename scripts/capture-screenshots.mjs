#!/usr/bin/env node
/**
 * Captures screenshots of the BDM Data Dictionary app for README documentation.
 * Uses Playwright. Run: node scripts/capture-screenshots.mjs
 * Requires dev server running on localhost:5173
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';

const OUT = 'docs/screenshots';
const BASE = 'http://localhost:5173';

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1512, height: 982 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

// 1. Table Browser (main)
console.log('1/6 Table Browser...');
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/table-browser.png` });
console.log('  saved table-browser.png');

// 2. Expanded table detail — click the "Order" card
console.log('2/6 Table Detail...');
const orderCard = page.locator('button', { hasText: '57 columns' }).filter({ hasText: 'Order' });
await orderCard.click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/table-detail.png` });
console.log('  saved table-detail.png');

// 3. ERD Diagram
console.log('3/6 ERD Diagram...');
await page.goto(BASE, { waitUntil: 'networkidle' });
const erdTab = page.locator('[role="tab"]', { hasText: 'ERD Diagram' });
await erdTab.click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/erd-diagram.png` });
console.log('  saved erd-diagram.png');

// 4. ERD with detail panel — click a node
console.log('4/6 ERD Detail Panel...');
const nodes = page.locator('.react-flow__node');
const nodeCount = await nodes.count();
if (nodeCount > 3) {
  await nodes.nth(3).click();
  await page.waitForTimeout(500);
}
await page.screenshot({ path: `${OUT}/erd-detail-panel.png` });
console.log('  saved erd-detail-panel.png');

// 5. Dark mode — go to Table Browser, toggle theme
console.log('5/6 Dark Mode...');
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
// Toggle dark mode — find the theme toggle button (last button in header)
await page.evaluate(() => {
  const btns = document.querySelectorAll('header button');
  const last = btns[btns.length - 1];
  if (last) last.click();
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/dark-mode.png` });
console.log('  saved dark-mode.png');

// 6. Search (Cmd+K)
console.log('6/6 Search...');
await page.keyboard.press('Meta+k');
await page.waitForTimeout(400);
await page.keyboard.type('carrier', { delay: 60 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/search.png` });
console.log('  saved search.png');

await browser.close();
console.log('\nDone! Screenshots saved to docs/screenshots/');
