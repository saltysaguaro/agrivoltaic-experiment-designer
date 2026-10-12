import { test, expect } from '@playwright/test';
import { drawingCapabilities, expectDrawing } from './drawing.js';
test('CPU solve, zero-DLI exports and weather persistence', async ({ page }) => {
  await page.goto('/validation/cpu-smoke.html');
  await expect(page.locator('#status')).toHaveText('Passed', { timeout: 45000 });
  const results = JSON.parse(await page.locator('#results').innerText());
  expect(results.passed).toBe(true);
  expect(results.storageRestored).toBe(true);
});
test('application boots and invalid dimensions remain editable', async ({ page }) => {
  await page.goto('/');
  const capabilities = await drawingCapabilities(page);
  await expect(page.locator('.brand')).toHaveText('Agrivoltaic Experiment Designer');
  const gap = page.locator('[data-annotation="module.gap"] input');
  await gap.fill('200000');
  await gap.press('Tab');
  await expect(
    page.getByText('This grid exceeds 20,000 receivers.', { exact: false }).first(),
  ).toBeVisible();
  await gap.fill('0.02');
  await gap.press('Tab');
  await expect(page.locator('.scene-fallback')).toHaveCount(0);
  await expectDrawing(page, capabilities);
});
test('real WebGPU parity and fallback', async ({ page, browserName }) => {
  test.skip(
    process.env.AED_GPU_REQUIRED !== '1' || browserName !== 'chromium',
    'Requires an explicitly configured hardware GPU runner.',
  );
  await page.goto('/validation/index.html');
  await page.locator('#run').click();
  await expect(page.locator('#results')).toContainText('"passed": true', { timeout: 55000 });
});

test('drawing survives WebGL context loss', async ({ page }) => {
  await page.goto('/validation/recovery.html');
  const capabilities = await drawingCapabilities(page);
  await expectDrawing(page, capabilities);
  test.skip(
    !capabilities.contextLoss,
    'Browser has no WebGL2 context-loss extension; available drawing checked.',
  );
  await page.getByRole('button', { name: 'Lose drawing context', exact: true }).click();
  await expect(page.locator('.svg-fallback')).toBeVisible();
  await page.getByRole('button', { name: 'Restore drawing context', exact: true }).click();
  await expect(page.locator('.svg-fallback')).toHaveCount(0);
  await expect(page.locator('canvas')).toBeVisible();
});

test('drawing remains available when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') return null;
      return getContext.call(this, type, ...args);
    };
  });
  await page.goto('/');
  await expectDrawing(page, { webgl: false });
  const length = page.locator('[data-annotation="module.length"] input');
  await length.fill('2.5');
  await length.press('Tab');
  await expect(length).toHaveValue('2.5');
  await expectDrawing(page, { webgl: false });
});
