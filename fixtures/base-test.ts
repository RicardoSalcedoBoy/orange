import { expect, test as base } from "@playwright/test";
import LoginPage from "@pages/login-page.ts";
import SidebarComponent from "@components/side-bar-component.ts";
import { adminPassword, adminUsername } from "../config-env.ts";
import TopBarComponent from "@components/top-bar-component.ts";
import DashboardPage from "@pages/dashboard-page.ts";
import RecruitmentPage from "@pages/recruitment-page.ts";

type MyFixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    recruitmentPage: RecruitmentPage;
    sidebar: SidebarComponent;
    topbar: TopBarComponent;
    loggedInPage: void;
};

export const test = base.extend<MyFixtures>({

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },

    recruitmentPage: async ({ page }, use) => {
        await use(new RecruitmentPage(page));
    },

    sidebar: async ({ page }, use) => {
        await use(new SidebarComponent(page));
    },

    topbar: async ({ page }, use) => {
        await use(new TopBarComponent(page));
    },

    loggedInPage: [async ({ page }, use) => {
        await page.goto('/');
        await new LoginPage(page).signInWithCredentials(adminUsername, adminPassword);
        await expect(page).toHaveURL(/.*dashboard/);
        await use();
    }, { auto: true }]
});

export { expect };
