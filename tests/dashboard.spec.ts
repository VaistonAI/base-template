import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Dashboard', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar el dashboard con estadísticas', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Dashboard');

        // Verificar tarjetas de estadísticas
        await expect(page.locator('text=Total Pacientes')).toBeVisible();
        await expect(page.locator('text=Pacientes Activos')).toBeVisible();
        await expect(page.locator('text=Citas Hoy')).toBeVisible();
        await expect(page.locator('text=Ingresos del Mes')).toBeVisible();
        await expect(page.locator('text=Facturas Pendientes')).toBeVisible();
    });

    test('Debe mostrar acciones rápidas', async ({ page }) => {
        await expect(page.locator('text=Acciones Rápidas')).toBeVisible();
        await expect(page.locator('button:has-text("Nuevo Paciente")')).toBeVisible();
        await expect(page.locator('button:has-text("Nueva Cita")')).toBeVisible();
        await expect(page.locator('button:has-text("Nueva Sesión")')).toBeVisible();
        await expect(page.locator('button:has-text("Nueva Factura")')).toBeVisible();
    });

    test('Debe navegar desde acciones rápidas', async ({ page }) => {
        // Hacer clic en "Nuevo Paciente"
        await page.click('button:has-text("Nuevo Paciente")');
        await expect(page).toHaveURL('/patients');
    });

    test('Debe mostrar actividad reciente', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.locator('text=Actividad Reciente')).toBeVisible();
    });
});
