import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';

// test('debug API calls', async ({ page }) => {
//   // Track all network requests
//   const requests: string[] = [];
  
//   page.on('request', request => {
//     requests.push(request.url());
//     if (request.url().includes('api') || request.url().includes('tags')) {
//       console.log('API Request:', request.url());
//     }
//   });

//   // Set up the mock BEFORE navigation
//   await page.route('**/api/tags*', async route => {
//     console.log('🎯 Route intercepted:', route.request().url());
//     const mockResponse = {
//       "tags": ["automation", "playwright"]
//     };
    
//     await route.fulfill({
//       status: 200,
//       contentType: 'application/json',
//       body: JSON.stringify(mockResponse),
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type'
//       }
//     });
//   });

//   // Navigate to the page
//   await page.goto('https://conduit.bondaracademy.com/');
  
//   // Wait for all network activity to complete
//   await page.waitForLoadState('networkidle');
  
//   // Check what API calls were made
//   const apiCalls = requests.filter(url => url.includes('api'));
//   console.log('All API calls made:', apiCalls);
  
//   // Look for tags in the page content
//   const pageText = await page.textContent('body');
//   console.log('Page contains "automation":', pageText?.includes('automation') || false);
//   console.log('Page contains "playwright":', pageText?.includes('playwright') || false);
// }); 

test.beforeEach(async ({ page }) => {
  await page.route('**/api/tags*', async route => {

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tags)
    });
  });

  // Go to the starting url before each test.
  await page.goto('https://conduit.bondaracademy.com/');
  await page.waitForLoadState('networkidle');

});

test('has title', async ({ page }) => {

  await page.route('*/**/api/articles*', async route => {

    const response =await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is a mocked article title";
    responseBody.articles[0].description = "This is a mocked article description";
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseBody)
    });
  });

  await page.getByText('Global Feed').click();

  // Expect a title "to contain" a substring.
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a mocked article title');
  await expect(page.locator('app-article-list p').first()).toHaveText('This is a mocked article description');
});

test('delete article', async ({ page, request }) => {
  // Get auth token to be able to publish an article as signed in user
  // Create API call to create a new article 
  // Then delete the article via UI



  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
    data: {
      "article": {
        "title": "Article to be deleted",
        "description": "This article will be deleted in the test",
        "body": "This is the body of the article to be deleted",
        "tagList": ["delete", "test"]
      }
    }
  });

  expect(articleResponse.status()).toBe(201);

  await page.getByText('Global Feed').click()
  await page.getByText('Article to be deleted').click()
  await page.getByRole('button', {name: 'Delete Article'}).first().click()
  await page.getByText('Global Feed').click()

  // Validate the article does not exist any more
  await expect(page.locator('app-article-list h1').first()).not.toContainText('Article to be deleted');

});

test('Create a new article and then cleanup via API', async ({ page, request}) => {

  await page.getByText('New Article').click();
  await page.getByRole('textbox', {name: 'Article Title'}).fill('Article created via UI to be deleted via API');
  await page.getByRole('textbox', {name: "What's this article about?"}).fill('This is the description');
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('This is the body of the article created via UI');
  await page.getByRole('textbox', {name: 'Enter tags'}).fill('ui-test, playwright');
  await page.getByRole('button', {name: 'Publish Article' }).click();
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/');
  const articleResponseBody = await articleResponse.json();
  const articleSlug = articleResponseBody.article.slug;
  await page.waitForLoadState('networkidle');

  await expect(page.locator('app-article-page h1').first()).toContainText('Article created via UI to be deleted via API');

  await page.getByText('Home').click();
  await page.getByText('Global Feed').click();

  await expect(page.locator('app-article-list h1').first()).toContainText('Article created via UI to be deleted via API');

  const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`);

  await expect(deleteResponse.status()).toBe(204);

});