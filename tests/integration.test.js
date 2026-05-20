/**
 * Integration tests for UI interactions
 * Run: npx playwright test tests/integration.test.js --project=chromium
 * Requires: python3 -m http.server 8765
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8765';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(300);
});

test('app loads and renders 3 replica cards', async ({ page }) => {
  const cards = await page.$$('.replica-card');
  expect(cards.length).toBe(3);
});

test('all replicas show x=y=z=0 initially', async ({ page }) => {
  for (const id of ['A', 'B', 'C']) {
    for (const v of ['x', 'y', 'z']) {
      const val = await page.textContent(`#var-${id}-${v}`);
      expect(val).toBe('0');
    }
  }
});

test('strict model: write x=42 @ A propagates to all replicas', async ({ page }) => {
  await page.selectOption('#model-select', 'strict');
  await page.fill('#write-var', 'x');
  await page.fill('#write-value', '42');
  await page.selectOption('#write-replica', 'A');
  await page.click('#btn-write');
  await page.waitForTimeout(200);

  for (const id of ['A', 'B', 'C']) {
    expect(await page.textContent(`#var-${id}-x`)).toBe('42');
  }
});

test('eventual model: write x=77 @ B only affects B', async ({ page }) => {
  await page.selectOption('#model-select', 'eventual');
  await page.fill('#write-var', 'x');
  await page.fill('#write-value', '77');
  await page.selectOption('#write-replica', 'B');
  await page.click('#btn-write');
  await page.waitForTimeout(200);

  expect(await page.textContent('#var-B-x')).toBe('77');
  expect(await page.textContent('#var-A-x')).toBe('0');
  expect(await page.textContent('#var-C-x')).toBe('0');
});

test('write and read operations appear in log', async ({ page }) => {
  await page.fill('#write-var', 'x');
  await page.fill('#write-value', '5');
  await page.click('#btn-write');
  await page.waitForTimeout(100);

  await page.fill('#read-var', 'x');
  await page.selectOption('#read-replica', 'A');
  await page.click('#btn-read');
  await page.waitForTimeout(100);

  const entries = await page.$$('.log-entry');
  expect(entries.length).toBe(2);
});

test('reset clears all state and shows empty log', async ({ page }) => {
  await page.fill('#write-var', 'x');
  await page.fill('#write-value', '99');
  await page.click('#btn-write');
  await page.waitForTimeout(100);
  await page.click('#btn-reset');
  await page.waitForTimeout(200);

  expect(await page.textContent('#var-A-x')).toBe('0');
  expect(await page.textContent('#op-count')).toBe('0');
  const empty = await page.$('.log-empty');
  expect(empty).not.toBeNull();
});

test('model selector changes behavior (strict vs eventual differ)', async ({ page }) => {
  await page.selectOption('#model-select', 'eventual');
  await page.fill('#write-var', 'x');
  await page.fill('#write-value', '1');
  await page.selectOption('#write-replica', 'B');
  await page.click('#btn-write');
  await page.waitForTimeout(100);

  expect(await page.textContent('#var-A-x')).toBe('0');
  expect(await page.textContent('#var-B-x')).toBe('1');

  await page.selectOption('#model-select', 'strict');
  await page.fill('#write-var', 'x');
  await page.fill('#write-value', '2');
  await page.selectOption('#write-replica', 'A');
  await page.click('#btn-write');
  await page.waitForTimeout(100);

  expect(await page.textContent('#var-A-x')).toBe('2');
  expect(await page.textContent('#var-B-x')).toBe('2');
  expect(await page.textContent('#var-C-x')).toBe('2');
});