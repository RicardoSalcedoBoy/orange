import { Page, Response } from '@playwright/test';
import { baseAPIURL } from '../config-env.ts';

export const RecruitmentInterceptor = {
    /**
     * Espera a que el navegador complete una petición a los endpoints de reclutamiento.
     * @param page La instancia de la pestaña actual del navegador.
     * @param endpoint El sub-recurso que deseas esperar ('candidates', 'vacancies', etc.).
     * @returns Una promesa que se resuelve con la respuesta nativa de Playwright.
     */
    waitFor: async (page: Page, endpoint: 'candidates' | 'vacancies' | 'jobTitles'): Promise<Response> => {
        // Construimos la expresión regular combinando la base con el endpoint específico
        const pattern = new RegExp(`${baseAPIURL}/recruitment/${endpoint}(\\?.*)?`);

        // Retornamos el radar de Playwright
        return page.waitForResponse(pattern);
    }
};
