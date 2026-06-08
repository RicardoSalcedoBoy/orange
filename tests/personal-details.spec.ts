import { test, expect } from "@fixtures/base-test.ts";
import { waitForPip } from "@interceptors/pim-interceptor.ts";

test.describe('Personal details tests', () => {
    test('User personal details must be correct', async ( { sidebar, page }) => {
        await sidebar.goToPage("My Info");
        await waitForPim('')
    });
});