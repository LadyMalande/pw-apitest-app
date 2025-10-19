import { request, expect } from '@playwright/test';
import user from '../pw-apitest-app/.auth/user.json';
import fs from 'fs';


async function globalTeardown(){

const  context = await request.newContext();

    const deleteResponse = await context.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`, {
        headers: {
          'Authorization': `Token ${process.env.JWT_TOKEN}`
        }
    });

  await expect(deleteResponse.status()).toBe(204);
}

export default globalTeardown;