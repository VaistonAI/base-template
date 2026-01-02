import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Citas CRUD', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/appointments');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar el calendario de citas', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Citas');
        await expect(page.locator('button:has-text("Nueva Cita")')).toBeVisible();
        await expect(page.locator('input[type="date"]')).toBeVisible();
    });

    test('Debe crear una nueva cita', async ({ page }) => {
        // Abrir modal
        await page.click('button:has-text("Nueva Cita")');
        await expect(page.locator('text=Nueva Cita')).toBeVisible();

        // Seleccionar paciente (primer paciente disponible)
        await page.selectOption('select[name="patientId"]', { index: 1 });

        // Seleccionar consultorio (primer consultorio disponible)
        await page.selectOption('select[name="officeId"]', { index: 1 });

        // Llenar fecha y hora
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        await page.fill('input[name="date"]', dateStr);
        await page.fill('input[name="time"]', '10:00');
        await page.fill('input[name="duration"]', '60');

        // Seleccionar tipo
        await page.selectOption('select[name="type"]', 'followup');

        // Agregar notas
        await page.fill('textarea[name="notes"]', 'Cita de prueba automatizada');

        // Enviar formulario
        await page.click('button[type="submit"]:has-text("Crear")');

        // Verificar mensaje de éxito
        await expect(page.locator('text=Cita creada correctamente')).toBeVisible({ timeout: 10000 });
    });

    test('Debe editar una cita existente', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Editar"]', { timeout: 10000 });

        const editButtons = page.locator('button[aria-label="Editar"]');
        const count = await editButtons.count();

        if (count > 0) {
            await editButtons.first().click();
            await expect(page.locator('text=Editar Cita')).toBeVisible();

            // Cambiar estado
            await page.selectOption('select[name="status"]', 'confirmed');

            // Guardar cambios
            await page.click('button[type="submit"]:has-text("Actualizar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Cita actualizada correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe eliminar una cita', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Eliminar"]', { timeout: 10000 });

        const deleteButtons = page.locator('button[aria-label="Eliminar"]');
        const count = await deleteButtons.count();

        if (count > 0) {
            await deleteButtons.first().click();

            // Confirmar eliminación
            await expect(page.locator('text=Eliminar Cita')).toBeVisible();
            await page.click('button:has-text("Eliminar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Cita eliminada correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe filtrar citas por fecha', async ({ page }) => {
        // Cambiar fecha
        const dateInput = page.locator('input[type="date"]').first();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        await dateInput.fill(dateStr);
        await page.waitForTimeout(500);

        // Verificar que se actualiza la vista
        await expect(page.locator('text=No hay citas para esta fecha').or(page.locator('[class*="border-border rounded-lg"]'))).toBeVisible();
    });
});
