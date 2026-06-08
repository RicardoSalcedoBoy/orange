import { test } from '@fixtures/recruitment-fixture.ts';
import { expect } from '@playwright/test';
import { candidatesData } from '../stubs/get-candidates-data.ts';
import { RecruitmentInterceptor } from '../interceptors/recruitment-interceptor.ts';

test.describe('Recruitment tests', () => {
    test('Should confirm candidate records are found', async ({ page, getCandidatesApiMock, loggedInPage }) => {

        // 1. Inyectamos los datos falsos del stub en nuestro controlador POO
        getCandidatesApiMock.update({
            status: 200,
            body: candidatesData
        });

        // 2. Ejecutamos la acción de navegación y el radar en paralelo (Evita Flaky Tests)
        const [interceptorResponse] = await Promise.all([
            RecruitmentInterceptor.waitFor(page, 'candidates'), // Escucha la red de fondo
            page.goto('/web/index.php/recruitment/viewCandidates') // Dispara la petición desde la UI
        ]);

        // 3. Aserción de la URL de la interfaz
        await expect(page).toHaveURL(/.*\/recruitment\/viewCandidates/);
        await page.pause();
    });
});
