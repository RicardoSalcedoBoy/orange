import { Locator, Page } from '@playwright/test';

export default class LoginPage {

    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly loginForm: Locator;

    constructor(page: Page) {
        this.usernameInput = page.locator("[name='username']");
        this.passwordInput = page.locator("[name='password']");
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.loginForm = page.locator('div.orangehrm-login-form');
    }

    async signInWithCredentials(username: string, password: string){
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

}