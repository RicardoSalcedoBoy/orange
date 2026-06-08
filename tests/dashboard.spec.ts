import { expect, test } from '@fixtures/base-test.ts';

test.describe('dashboard tests', () => {
    test('dashboard page elements should be visible', async ( { page, loggedInPage, dashboardPage }) => {
        await expect(page).toHaveURL(/dashboard/);
        await dashboardPage.goToRecruitment();
        await expect(page).toHaveURL(/viewCandidates/);
    });
});