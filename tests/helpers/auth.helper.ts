import { Page } from '@playwright/test';

export class AuthHelper {
    constructor(private page: Page) { }

    async login(email: string = 'test@vaiston.com', password: string = 'Test123456!') {
        await this.page.goto('/login');
        await this.page.fill('#email', email);
        await this.page.fill('#password', password);
        await this.page.click('button[type="submit"]');
        await this.page.waitForURL('/dashboard', { timeout: 10000 });
    }

    async logout() {
        // Implementar logout cuando esté disponible
    }
}

export const TEST_USER = {
    email: 'test@vaiston.com',
    password: 'Test123456!',
};
