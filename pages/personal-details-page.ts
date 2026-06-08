import { Page, Locator } from "@playwright/test";

export default class PersonalDetailsPage {

    readonly firstNameInput: Locator;
    readonly middleNameInput: Locator;
    readonly lastNameInput: Locator;

    constructor(page: Page) {
        this.firstNameInput = page.locator('input[name=firstName]');
        this.middleNameInput = page.locator('input[name=middleName]');
        this.lastNameInput = page.locator('input[name=lastName]');
    }

    async fillName(firstName: string, lastName: string, middleName?: string) {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.middleNameInput.fill(lastName);
    }

}