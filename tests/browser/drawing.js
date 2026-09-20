import { expect } from '@playwright/test';

// Probe browser capability independently of Scene, so a renderer regression
// cannot turn a required canvas assertion into an accepted fallback.
export async function drawingCapabilities(page) {
  return page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_lose_context');
    const capabilities = { webgl: !!gl, contextLoss: !!extension };
    extension?.loseContext();
    return capabilities;
  });
}

export async function expectDrawing(page, capabilities) {
  if (capabilities.webgl) {
    await expect(page.locator('.svg-fallback')).toHaveCount(0);
    await expect(page.locator('canvas')).toBeVisible();
  } else {
    await expect(page.locator('.svg-fallback svg')).toBeVisible();
    await expect(page.locator('.svg-fallback svg path').first()).toBeAttached();
  }
}
