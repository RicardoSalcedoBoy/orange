import { request, APIRequestContext, APIResponse } from "@playwright/test";
import { baseAPIURL } from "../config-env.ts"; // Asegúrate de que apunte a tu URL base de la API

export default class RecruitmentService {

    /**
     * Hace una petición HTTP GET real al backend para obtener los candidatos.
     * @param requestContext El contexto de API de Playwright (normalmente se extrae de playwright o del test)
     * @returns Una promesa con la respuesta de la API (APIResponse)
     */
    static async getCandidates(requestContext: APIRequestContext): Promise<APIResponse> {
        // Construimos la URL uniendo la base y el endpoint de la API
        const url = `${baseAPIURL}/recruitment/candidates`;

        // Hacemos la llamada HTTP directa por detrás
        const response = await requestContext.get(url, {
            headers: {
                // Si tu API requiere algún header global como JSON, lo agregas aquí
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response;
    }
}
