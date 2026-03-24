// @ts-check
const { test, expect } = require('@playwright/test');

// E2E test: complete calculation flow

test('complete calculation flow', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.fill('#salary', '3000');
  await page.fill('#birthDate', '2026-03-15');
  // Wait for calculation to complete and results to appear
  await expect(page.locator('#results tr')).toHaveCount(12);
  // Optionally, check the first row for a value

  // Optionally, test PDF download button if present
});
