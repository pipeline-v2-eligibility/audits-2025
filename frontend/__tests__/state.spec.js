// @ts-check
const axios = require('axios');
const { test, expect } = require('@playwright/test');
const properties = require('../../../properties.json');

let APP = '';
let maybe = test.skip;
const API = 'https://randomapi.com/api/8csrgnjw?key=LEIX-GF3O-AG7I-6J84';

if (properties && properties.deployedAppURL && properties.deployedAppURL !== '') {
  maybe = test;
  APP = properties.deployedAppURL;
}


maybe('app has correct state on load', async ({ page }) => {
  await page.goto(APP);

  const tRows = page.locator('tbody > tr');
  await expect(tRows).toHaveCount(5);

  const { data } = await axios.get(`${API}&page=1`);
  const [apiData] = data.results;
  if (!apiData) return;

  const dataPage = apiData['1'];
  if (!dataPage) return;

  for (const n of [0, 1, 2, 3, 4]) {
    const tR = page.locator(`tbody > tr:nth-child(${n+1})`);
    await expect(tR).toHaveAttribute('data-entryid', dataPage[n].id);
  }

  const pageViewLabel = page.locator('label[data-pageview]');
  await expect(pageViewLabel).toHaveText('Showing Page 1');
});

maybe('app has correct state on forward nav', async ({ page }) => {
  await page.goto(APP);

  const tRows = page.locator('tbody > tr');
  await expect(tRows).toHaveCount(5);

  const nextBtn = page.locator('button:nth-child(2)');
  await nextBtn.click();
  await nextBtn.click();

  const { data } = await axios.get(`${API}&page=3`);
  const [apiData] = data.results;
  if (!apiData) return;

  const dataPage = apiData['3'];
  if (!dataPage) return;

  for (const n of [0, 1, 2, 3, 4]) {
    const tR = page.locator(`tbody > tr:nth-child(${n+1})`);
    await expect(tR).toHaveAttribute('data-entryid', dataPage[n].id);
  }

  const pageViewLabel = page.locator('label[data-pageview]');
  await expect(pageViewLabel).toHaveText('Showing Page 3');
});

maybe('app has correct state on backward nav', async ({ page }) => {
  await page.goto(APP);

  const tRows = page.locator('tbody > tr');
  await expect(tRows).toHaveCount(5);

  const nextBtn = page.locator('button:nth-child(2)');
  await nextBtn.click();
  await nextBtn.click();
  await nextBtn.click();

  const prevBtn = page.locator('button:nth-child(1)');
  await prevBtn.click();
  await prevBtn.click();

  const { data } = await axios.get(`${API}&page=2`);
  const [apiData] = data.results;
  if (!apiData) return;

  const dataPage = apiData['2'];
  if (!dataPage) return;

  for (const n of [0, 1, 2, 3, 4]) {
    const tR = page.locator(`tbody > tr:nth-child(${n+1})`);
    await expect(tR).toHaveAttribute('data-entryid', dataPage[n].id);
  }

  let pageViewLabel = page.locator('label[data-pageview]');
  await expect(pageViewLabel).toHaveText('Showing Page 2');

  await prevBtn.click();
  await expect(pageViewLabel).toHaveText('Showing Page 1');
  await expect(prevBtn).toBeDisabled();
});
