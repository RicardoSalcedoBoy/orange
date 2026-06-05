import { expect } from '@playwright/test';
import { test } from '@fixtures/auth-fixture.ts';
import DashboardPage from '@pages/dashboard-page.ts';

test.describe('dashboard tests', () => {
    test('dashboard page elements should be visible', async ( { page, loggedInPage }) => {
        const dashboardPage = new DashboardPage(page);
        await expect(page).toHaveURL(/dashboard/);
        await dashboardPage.goToRecruitment();
        await expect(page).toHaveURL(/viewCandidates/);
    });
});