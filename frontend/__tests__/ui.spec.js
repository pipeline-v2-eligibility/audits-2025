// @ts-check
const { test, expect } = require('@playwright/test');
const properties = require('../../../properties.json');

let APP = '';
let maybe = test.skip;

if (properties && properties.deployedAppURL && properties.deployedAppURL !== '') {
  maybe = test;
  APP = properties.deployedAppURL;
}

maybe('app has required UI elements on load', async ({ page }) => {
  await page.goto(APP);

  const tRows = page.locator('tbody > tr');
  await expect(tRows).toHaveCount(5);

  const prevBtn = page.locator('button:nth-child(1)');
  await expect(prevBtn).toBeVisible();

  const nextBtn = page.locator('button:nth-child(2)');
  await expect(nextBtn).toBeVisible();

  const pageViewLabel = page.locator('label[data-pageview]');
  await expect(pageViewLabel).toBeVisible();
});
