import { Page, Locator } from "@playwright/test";

export default class DashboardPage {

    readonly page: Page;
    readonly timeAtWorkWidget: Locator;
    readonly myActionsWidget: Locator;

    constructor(page: Page) {
        this.page = page;
        this.timeAtWorkWidget = page.locator('.orangehrm-dashboard-widget', {
            has: page.locator('.orangehrm-attendance-card')
        });
        this.myActionsWidget = page.locator('.orangehrm-dashboard-widget', {
            has: page.locator('.orangehrm-todo-list')
        });
    }

    async goToRecruitment(): Promise<void> {
        await this.page.locator('.orangehrm-todo-list-item').getByText('Candidate to Interview').click();
    }

}