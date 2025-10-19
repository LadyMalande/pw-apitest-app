import {test, expect, request} from '@playwright/test';

test('Likes Counter increments on button click', async ({ page }) => {
  // Navigate to the web application
    await page.goto('https://conduit.bondaracademy.com/');
  await page.waitForLoadState('networkidle');

  await page.getByText('Global Feed').click();
  const firstLikeButton  = await page.locator('app-article-preview').first().locator('button')

  await firstLikeButton.click();

  await expect(firstLikeButton).toContainText('1');
});