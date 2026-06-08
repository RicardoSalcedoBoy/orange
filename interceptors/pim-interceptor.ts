import { Page } from '@playwright/test';
import { baseAPIURL } from '../config-env.ts';

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const waitForPim = async(page: Page) => {
    const pattern = new RegExp(`${escapeRegex(baseAPIURL)}/pim/employees/\\d+(\\?.*)?`);
    return page.waitForResponse(pattern, {timeout: 10000});
}