import { expect } from '@playwright/test';
import { test } from '@fixtures/auth-fixture.ts';
import LoginPage from '@pages/login-page.ts';
import TopBarComponent from '@components/top-bar-component.ts';
import { adminUsername, adminPassword } from '../config-env.ts';

test.describe('login tests', () => {
    let loginPage: LoginPage;
    let topBarComponent: TopBarComponent;

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        loginPage = new LoginPage(page);
        topBarComponent = new TopBarComponent(page);
    });

    test('should sign in and sign out successfully with valid credentials', async ({ page }) => {
        await loginPage.signInWithCredentials(adminUsername, adminPassword);

        await expect(page).toHaveURL(/dashboard/);
        await topBarComponent.signOut();
        await expect(page).toHaveURL(/login/);
        await expect(loginPage.loginForm).toBeVisible();
    });
});
