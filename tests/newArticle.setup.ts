import { test as setup, expect, request } from '@playwright/test'

setup('new Article setup', async ({request}) => {
      const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        data: {
          "article": {
            "title": "Article prepared in setup",
            "description": "This article was prepared in a setup",
            "body": "This is the body of the article prepared in a setup",
            "tagList": ["setup", "test"]
          }
        },
        headers: {
          'Authorization': `Token ${process.env.JWT_TOKEN}`
        }
      });
    
      expect(articleResponse.status()).toBe(201);

      const response = await articleResponse.json()
      const slugId = response.article.slug

      // Store the slugId in the test info to be used later
      process.env['SLUGID'] = slugId;

      console.log(`Article created with slug: ${slugId}`);
});