import { test, expect } from "@fixtures/base-test.ts";

test.describe('Personal details tests', () => {
    test('User personal details must be correct', async ( { sidebar, page }) => {
        await sidebar.goToPage("My Info");
        await page.pause();
    });
});