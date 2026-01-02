import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Reportes', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/reports');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar la página de reportes', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Reportes');
    });

    test('Debe mostrar estadísticas de pacientes', async ({ page }) => {
        await expect(page.locator('text=Estadísticas de Pacientes')).toBeVisible();
        await expect(page.locator('text=Total de Pacientes')).toBeVisible();
        await expect(page.locator('text=Pacientes Activos')).toBeVisible();
        await expect(page.locator('text=Nuevos este Mes')).toBeVisible();
    });

    test('Debe mostrar estadísticas de citas', async ({ page }) => {
        await expect(page.locator('text=Estadísticas de Citas')).toBeVisible();
        await expect(page.locator('text=Total de Citas')).toBeVisible();
        await expect(page.locator('text=Citas Completadas')).toBeVisible();
        await expect(page.locator('text=Tasa de Asistencia')).toBeVisible();
    });

    test('Debe mostrar estadísticas de sesiones', async ({ page }) => {
        await expect(page.locator('text=Estadísticas de Sesiones')).toBeVisible();
        await expect(page.locator('text=Total de Sesiones')).toBeVisible();
        await expect(page.locator('text=Sesiones este Mes')).toBeVisible();
        await expect(page.locator('text=Promedio por Paciente')).toBeVisible();
    });

    test('Debe mostrar análisis financiero', async ({ page }) => {
        await expect(page.locator('text=Análisis Financiero')).toBeVisible();
        await expect(page.locator('text=Ingresos Totales')).toBeVisible();
        await expect(page.locator('text=Facturas Pagadas')).toBeVisible();
        await expect(page.locator('text=Facturas Pendientes')).toBeVisible();
    });
});
