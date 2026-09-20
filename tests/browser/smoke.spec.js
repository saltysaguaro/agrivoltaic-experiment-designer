import { test, expect } from '@playwright/test';
test('CPU solve, zero-DLI exports and weather persistence', async ({ page }) => {
  await page.goto('/validation/cpu-smoke.html');
  await expect(page.locator('#status')).toHaveText('Passed', { timeout: 45000 });
  const results = JSON.parse(await page.locator('#results').innerText());
  expect(results.passed).toBe(true);
  expect(results.storageRestored).toBe(true);
});
test('application boots and invalid dimensions remain editable', async ({ page }) => {
  await page.goto('/');
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
  await expect(page.locator('canvas')).toBeVisible();
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
  await page.getByRole('button', { name: 'Lose drawing context', exact: true }).click();
  await expect(page.locator('.svg-fallback')).toBeVisible();
  await page.getByRole('button', { name: 'Restore drawing context', exact: true }).click();
  await expect(page.locator('.svg-fallback')).toHaveCount(0);
  await expect(page.locator('canvas')).toBeVisible();
});
