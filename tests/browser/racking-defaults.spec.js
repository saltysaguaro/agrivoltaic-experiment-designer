import { test, expect } from '@playwright/test';
import { defaultStudy } from '../../src/domain/study.js';

test('restored trackers lock north–south and rack switches replace inherited settings', async ({
  page,
}) => {
  const study = defaultStudy();
  study.array.azimuth = 180;
  study.weather.mode = 'sample';
  await page.addInitScript((s) => {
    localStorage.setItem('aed-study-v1', JSON.stringify(s));
    sessionStorage.setItem('aed-navigation', JSON.stringify({ version: 3, step: 4, view: 'plan' }));
  }, study);
  await page.goto('/');
  const controls = page.locator('.control-content');
  const go = async (name) => {
    await page
      .getByRole('navigation', { name: 'Design steps' })
      .getByRole('button', { name, exact: true })
      .click();
  };
  const input = (name) => page.locator(`[data-annotation="${name}"] input`);
  const mount = page.locator('[data-annotation="racking.type"] select');
  await expect(controls).toContainText('Rows run north–south');
  await expect(controls).toContainText('Orientation is locked');
  await expect(input('array.azimuth')).toHaveCount(0);
  await go('Racking');
  await mount.selectOption('fixed');
  await go('Full array');
  await expect(input('array.azimuth')).toHaveValue('180');
  await input('array.azimuth').fill('37');
  await input('array.azimuth').press('Tab');
  await go('Racking');
  await input('racking.tilt').fill('70');
  await input('racking.tilt').press('Tab');
  await mount.selectOption('single-axis');
  await expect(input('racking.tilt')).toHaveValue('25');
  await expect(input('racking.limit')).toHaveValue('60');
  await expect(
    page.getByRole('checkbox', { name: /Enable flat-terrain backtracking/ }),
  ).toBeChecked();
  await go('Full array');
  await expect(input('array.azimuth')).toHaveCount(0);
  await expect(controls).toContainText('Rows run north–south');
  await go('Racking');
  await mount.selectOption('vertical');
  await expect(controls).toContainText('faces point east and west');
  await go('Full array');
  await expect(input('array.azimuth')).toHaveCount(0);
  await go('Racking');
  await mount.selectOption('dual-axis');
  await expect(input('racking.limit')).toHaveValue('85');
  await expect(controls).toContainText('tilt and facing direction follow the sun');
  await go('Full array');
  await expect(input('array.azimuth')).toHaveValue('90');
  await go('Racking');
  await mount.selectOption('pergola');
  await expect(input('racking.pergolaTilt')).toHaveValue('0');
  await expect(page.locator('[data-annotation="racking.pergolaLayout"] select')).toHaveValue(
    'aligned',
  );
  await go('Full array');
  await expect(input('array.azimuth')).toHaveValue('180');
});
