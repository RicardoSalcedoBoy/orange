import { Page, Locator } from '@playwright/test';

export default class SidebarComponent {

    readonly menuItems: Locator;

    constructor(page: Page) {
        this.menuItems = page.locator('.oxd-main-menu-item-wrapper');
    }

    async goToPage(targetPage: string): Promise<void> {
        await this.menuItems.filter({ hasText: targetPage }).click();
    }
}
