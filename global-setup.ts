import { request, expect } from '@playwright/test';
import user from '../pw-apitest-app/.auth/user.json';
import fs from 'fs';


async function globalSetup(){

const  context = await request.newContext();

  const authFile = '.auth/user.json';
  

  const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user":{"email":"terkaTesterka@gmail.com","password":"Welcome1"}
    }
  })

  const responseBody = await responseToken.json()
  const accessToken = responseBody.user.token

  user.origins[0].localStorage[0].value = accessToken

  fs.writeFileSync(authFile, JSON.stringify(user)) 

  process.env['JWT_TOKEN'] = accessToken;


    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles', {
        data: {
          "article": {
            "title": "Global Likes Test Article",
            "description": "This article was prepared in a Global Likes Test Article",
            "body": "This is the body of the article prepared in a Global Likes Test Article",
            "tagList": ["setup", "test", "global"]
          }
        },
        headers: {
          'Authorization': `Token ${process.env.JWT_TOKEN}`
        }
      });

      expect(articleResponse.status()).toBe(201);
      
      const response = await articleResponse.json()
      const slugId = response.article.slug
      
    process.env['SLUGID'] = slugId;
}

export default globalSetup;