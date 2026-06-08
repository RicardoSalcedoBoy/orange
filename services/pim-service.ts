import { APIRequestContext, APIResponse } from '@playwright/test';
import { baseAPIURL } from '../config-env.ts';

export default class PimService {

    static async getEmployee(requestContext: APIRequestContext, empNumber: number): Promise<APIResponse> {
        return requestContext.get(`${baseAPIURL}/pim/employees/${empNumber}`);
    }

    static async getEmployees(requestContext: APIRequestContext): Promise<APIResponse> {
        return requestContext.get(`${baseAPIURL}/pim/employees`);
    }
}
