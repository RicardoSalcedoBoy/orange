import { test as base } from "@fixtures/auth-fixture.ts";
import { GetCandidatesApiMock } from "../mocks/recruitment-mock.ts";

export const test = base.extend<{ getCandidatesApiMock: GetCandidatesApiMock }>({
    getCandidatesApiMock: async ({ page }, use) => {
        // 1. Instanciamos la clase pasando la página
        const mock = new GetCandidatesApiMock(page);

        // 2. Le pasamos el objeto al test
        await use(mock);

        // 3. Limpieza automática al terminar el test
        await mock.dispose();
    }
});

