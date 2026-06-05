import { Page, Locator } from '@playwright/test';

export default class RecruitmentPage {

    readonly page: Page;
    readonly candidatesContainer: Locator;
    readonly addCandidateButton: Locator;
    readonly candidateCards: Locator;

    constructor(page: Page) {
        this.page = page;
        this.candidatesContainer = page.locator('.orangehrm-paper-container');
        this.addCandidateButton = this.candidatesContainer.locator('button', { hasText: ' Add ' });
        this.candidateCards = this.candidatesContainer.locator('.card-center');
    }



}