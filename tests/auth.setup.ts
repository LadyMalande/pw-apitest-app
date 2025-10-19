import { test as setup } from '@playwright/test'
import user from '../.auth/user.json';
import fs from 'fs';

// Define the path to save the authentication state
const authFile = '.auth/user.json';

setup('authentication setup', async ({ page, request }) => {
/*   // Go to the starting url before each test.
  await page.goto('https://conduit.bondaracademy.com/');
  await page.waitForLoadState('networkidle');

  // Log in to the application to be able to delete the article later
  await page.getByText('Sign in').click();
  await page.getByRole('textbox', { name: 'Email' }).fill('terkaTesterka@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Welcome1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait for the main page to load after login, waiting for LoadState 'networkidle' does not work here
  await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags');

  // Save authentication state into a file
  await page.context().storageState({path: authFile})  */

     const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user":{"email":"terkaTesterka@gmail.com","password":"Welcome1"}
    }
  })

  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  user.origins[0].localStorage[0].value = accessToken

  fs.writeFileSync(authFile, JSON.stringify(user)) 

  process.env['JWT_TOKEN'] = accessToken;
});