import { test as base } from "@fixtures/auth-fixture.ts";
import { GetCandidatesApiMock } from "../mocks/recruitment-mock.ts";

export const test = base.extend<{ getCandidatesApiMock: GetCandidatesApiMock }>({
    getCandidatesApiMock: async ({ page }, use) => {
        const mock = await GetCandidatesApiMock.create(page);
        await use(mock);
        await mock.dispose();
    }
});

