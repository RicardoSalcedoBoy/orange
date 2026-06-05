import { request, Page, APIResponse } from '@playwright/test';
import { baseURL } from "../config-env.ts";

export default class AuthService {
    static async authenticate(page: Page, username: string, password: string): Promise<APIResponse> {
        const apiContext = await request.newContext({
            baseURL: baseURL,
            timeout: 45000
        });

        const response = await apiContext.post('/web/index.php/auth/validate', {
            form: { username, password },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache'
            }
        });

        if (!response.ok() && response.status() !== 302) {
            throw new Error(`Autenticación por API fallida con estatus: ${response.status()}`);
        }

        const setCookieHeader = response.headers()['set-cookie'];

        if (setCookieHeader) {
            const cookieValue = setCookieHeader.split(';')[0];
            const [name, value] = cookieValue.split('=');

            await page.context().addCookies([{
                name: name,
                value: value,
                domain: new URL(baseURL!).hostname,
                path: '/'
            }]);

            try {
                await (page.context() as any).setStorageState({ cookies: [{ name, value, domain: new URL(baseURL!).hostname, path: '/' }], origins: [] });
                console.log('[AuthService] setStorageState called (syntax-only)');
            } catch (e) {
                console.log('[AuthService] setStorageState placeholder failed (expected in some setups):', e);
            }
        }

        return response;
    }
}
