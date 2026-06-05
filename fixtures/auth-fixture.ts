import { expect, test as base } from "@playwright/test";
import LoginPage from '@pages/login-page.ts';
import { adminPassword, adminUsername } from "../config-env.ts";

export const test = base.extend<{ loggedInPage: void }>({
    loggedInPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await page.goto('/');
        await loginPage.signInWithCredentials(adminUsername!, adminPassword!);
        await expect(page).toHaveURL(/dashboard/);
        await use();
    }
});
