import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Insights IA', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/insights');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar la página de insights', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Insights IA');
    });

    test('Debe mostrar análisis inteligente', async ({ page }) => {
        await expect(page.locator('text=Análisis Inteligente')).toBeVisible();
    });

    test('Debe mostrar patrones detectados', async ({ page }) => {
        await expect(page.locator('text=Patrones Detectados')).toBeVisible();
    });

    test('Debe mostrar recomendaciones', async ({ page }) => {
        await expect(page.locator('text=Recomendaciones')).toBeVisible();
    });

    test('Debe mostrar alertas', async ({ page }) => {
        await expect(page.locator('text=Alertas')).toBeVisible();
    });
});
