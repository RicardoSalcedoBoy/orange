import { Page, Route } from '@playwright/test';
import { baseAPIURL } from "../config-env.ts";

export class GetCandidatesApiMock {
    // Campos privados nativos (#): inaccesibles fuera de esta clase
    #current: { status?: number; body?: any; headers?: Record<string, string> };
    #subscription: any;
    #pattern: RegExp;

    constructor(page: Page, initial: { status?: number; body?: any; headers?: Record<string, string> } = { status: 200, body: {} }) {
        this.#pattern = new RegExp(`${baseAPIURL}/recruitment/candidates(\\?.*)?`);
        this.#current = { ...initial };

        // Activamos la interceptación de la ruta inmediatamente al instanciar
        this.#initRoute(page);
    }

    // Método privado para configurar la ruta de Playwright
    async #initRoute(page: Page) {
        this.#subscription = await page.route(this.#pattern, async (route: Route) => {
            await route.fulfill({
                status: this.#current.status ?? 200,
                contentType: 'application/json',
                body: JSON.stringify(this.#current.body ?? {}),
                headers: this.#current.headers
            });
        });
    }

    // --- MÉTODOS PÚBLICOS ---

    /**
     * Actualiza la respuesta simulada del servidor.
     * Por defecto fusiona objetos del body. Usa { replace: true } para sobrescribir por completo.
     */
    public update(
        resp: { status?: number; body?: any; headers?: Record<string, string> },
        options?: { replace?: boolean }
    ): void {
        this.#current = {
            ...this.#current,
            ...resp,
            body: !options?.replace && resp.body && this.#current.body && typeof resp.body === 'object'
                ? { ...this.#current.body, ...resp.body }
                : (resp.body ?? this.#current.body)
        };
    }

    /**
     * Limpia el interceptor de red para que el navegador vuelva a la API real.
     */
    public async dispose(): Promise<void> {
        if (this.#subscription) {
            if (typeof this.#subscription[Symbol.dispose] === 'function') {
                this.#subscription[Symbol.dispose]();
            } else if (typeof this.#subscription.dispose === 'function') {
                await this.#subscription.dispose();
            }
        }
    }

    /**
     * Obtiene el estado actual configurado en el mock (útil para depurar).
     */
    public getCurrent() {
        return this.#current;
    }

    /**
     * Obtiene la expresión regular que identifica la URL interceptada.
     */
    get pattern(): RegExp {
        return this.#pattern;
    }
}
