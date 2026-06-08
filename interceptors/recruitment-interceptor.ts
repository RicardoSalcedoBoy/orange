import { Page } from '@playwright/test';
import { baseAPIURL } from '../config-env.ts';

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const waitForRecruitment = async (page: Page, endpoint: 'candidates' | 'vacancies' | 'jobTitles'): Promise<Response> => {
    const pattern = new RegExp(`${escapeRegex(baseAPIURL)}/recruitment/${endpoint}(\\?.*)?`);
    return page.waitForResponse(pattern, { timeout: 10000 });
};
