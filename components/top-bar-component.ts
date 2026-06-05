import { Page, Locator, } from "@playwright/test";

export default class TopBarComponent {

    readonly headerTitle: Locator;
    readonly upgradeButton: Locator;
    readonly dropdownUsername: Locator;
    readonly logoutLink: Locator;

    constructor(page: Page) {
        this.headerTitle = page.locator('div.oxd-topbar-header-title');
        this.upgradeButton = page.locator('button.orangehrm-upgrade-button');
        this.dropdownUsername = page.locator('li.oxd-userdropdown');
        this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
    }

    async signOut() {
        await this.dropdownUsername.click();
        await this.logoutLink.click();
    }
}