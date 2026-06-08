import { Page, Route } from '@playwright/test';
import { baseAPIURL } from "../config-env.ts";

type MockResponse = {
    status?: number;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
};

export class GetCandidatesApiMock {
    #page: Page;
    #current: MockResponse;
    #pattern: RegExp;

    private constructor(page: Page, initial: MockResponse) {
        this.#page = page;
        this.#pattern = new RegExp(`${baseAPIURL}/recruitment/candidates(\\?.*)?`);
        this.#current = { status: 200, body: {}, ...initial };
    }

    static async create(page: Page, initial: MockResponse = {}): Promise<GetCandidatesApiMock> {
        const mock = new GetCandidatesApiMock(page, initial);
        await mock.#initRoute();
        return mock;
    }

    async #initRoute(): Promise<void> {
        await this.#page.route(this.#pattern, async (route: Route) => {
            await route.fulfill({
                status: this.#current.status ?? 200,
                contentType: 'application/json',
                body: JSON.stringify(this.#current.body ?? {}),
                ...(this.#current.headers && { headers: this.#current.headers })
            });
        });
    }

    public update(resp: MockResponse, options?: { replace?: boolean }): void {
        this.#current = {
            ...this.#current,
            ...resp,
            body: !options?.replace && resp.body && this.#current.body && typeof resp.body === 'object'
                ? { ...this.#current.body, ...resp.body }
                : (resp.body ?? this.#current.body)
        };
    }

    public async dispose(): Promise<void> {
        await this.#page.unroute(this.#pattern);
    }

    public getCurrent(): MockResponse {
        return { ...this.#current };
    }

    get pattern(): RegExp {
        return this.#pattern;
    }
}
