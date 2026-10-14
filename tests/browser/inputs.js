import { expect } from '@playwright/test';

// Mobile controls live in a drawer; desktop controls remain beside the drawing.
export async function setInputsOpen(page, open = true) {
  const toggle = page.locator('.inputs-toggle');
  if (!(await toggle.isVisible())) return;
  if ((await toggle.getAttribute('aria-expanded')) !== String(open)) await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', String(open));
  if (open) await expect(page.locator('#study-controls')).toBeVisible();
  else await expect(page.locator('#study-controls')).toBeHidden();
}
