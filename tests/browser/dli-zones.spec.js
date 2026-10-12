import { test, expect } from '@playwright/test';
import { defaultStudy } from '../../src/domain/study.js';
import { drawingCapabilities, expectDrawing } from './drawing.js';

test('Zoned DLI updates a live map without another solve', async ({ page }, testInfo) => {
  const study = defaultStudy();
  // Keep this interaction fixture small and independent of new-study defaults.
  study.racking.type = 'fixed';
  study.table.high = 1;
  study.table.wide = 2;
  study.array.azimuth = 180;
  study.weather.mode = 'sample';
  study.analysis.backend = 'cpu';
  study.analysis.patches = 145;
  study.analysis.samplesPerCell = 4;
  study.analysis.cellsPerRow = 5;
  study.analysis.interval = 15;
  study.row.tables = 1;
  study.array.rows = 3;
  await page.addInitScript((s) => {
    localStorage.setItem('aed-study-v1', JSON.stringify(s));
    sessionStorage.setItem('aed-navigation', JSON.stringify({ version: 3, step: 6, view: 'plan' }));
  }, study);
  let workers = 0;
  page.on('worker', () => workers++);
  await page.goto('/');
  const capabilities = await drawingCapabilities(page);
  const zoned = page.getByRole('button', { name: 'Zoned DLI', exact: true });
  await expect(zoned).toBeDisabled();
  await page.getByRole('button', { name: 'Calculate daily light', exact: true }).click();
  await expect(zoned).toBeEnabled({ timeout: 45000 });
  await zoned.click();
  await expect(page.locator('.dli-zone-items > div')).toHaveCount(5);
  await expectDrawing(page, capabilities);
  const before = workers;
  const count = page.locator('[data-annotation="analysis.dliZoneCount"] input');
  await count.fill('3');
  await count.press('Tab');
  await expect(page.locator('.dli-zone-items > div')).toHaveCount(3);
  await expect(zoned).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.view-tabs .selected')).toContainText('Top-down');
  expect(workers).toBe(before);
  await page.locator('.light-control').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('zoned-dli.png'), fullPage: true });
  await page.getByRole('button', { name: 'Control', exact: true }).click();
  await expect(page.locator('.dli-zone-items > div')).toHaveCount(1);
  await expect(page.locator('.dli-zone-legend')).toContainText('1 of 3 requested zones');
});
