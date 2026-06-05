import dotenv from 'dotenv';
dotenv.config();

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`[Config Error]: Env variable ${name} must have a value but is undefined.`);
    }
    return value;
}

export const baseURL = getEnv('BASE_URL');
export const adminUsername = getEnv('ADMIN_USERNAME');
export const adminPassword = getEnv('ADMIN_PASSWORD');
export const baseAPIURL = getEnv('BASE_API_URL');