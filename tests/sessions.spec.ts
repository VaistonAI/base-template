import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Sesiones CRUD', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/sessions');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar la lista de sesiones', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Sesiones Clínicas');
        await expect(page.locator('button:has-text("Nueva Sesión")')).toBeVisible();
    });

    test('Debe crear una nueva sesión', async ({ page }) => {
        // Abrir modal
        await page.click('button:has-text("Nueva Sesión")');
        await expect(page.locator('text=Nueva Sesión')).toBeVisible();

        // Seleccionar paciente
        await page.selectOption('select[name="patientId"]', { index: 1 });

        // Llenar fecha y hora
        const today = new Date().toISOString().split('T')[0];
        await page.fill('input[name="date"]', today);
        await page.fill('input[name="time"]', '14:00');
        await page.fill('input[name="duration"]', '60');

        // Llenar notas
        await page.fill('textarea[name="notes"]', 'Sesión de prueba automatizada. El paciente muestra progreso significativo.');
        await page.fill('textarea[name="progress"]', 'Excelente avance en los objetivos terapéuticos.');
        await page.fill('textarea[name="nextObjectives"]', 'Continuar con las técnicas de relajación.');

        // Enviar formulario
        await page.click('button[type="submit"]:has-text("Crear")');

        // Verificar mensaje de éxito
        await expect(page.locator('text=Sesión creada correctamente')).toBeVisible({ timeout: 10000 });
    });

    test('Debe editar una sesión existente', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Editar"]', { timeout: 10000 });

        const editButtons = page.locator('button[aria-label="Editar"]');
        const count = await editButtons.count();

        if (count > 0) {
            await editButtons.first().click();
            await expect(page.locator('text=Editar Sesión')).toBeVisible();

            // Modificar progreso
            await page.fill('textarea[name="progress"]', 'Progreso actualizado mediante prueba automatizada');

            // Guardar cambios
            await page.click('button[type="submit"]:has-text("Actualizar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Sesión actualizada correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe eliminar una sesión', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Eliminar"]', { timeout: 10000 });

        const deleteButtons = page.locator('button[aria-label="Eliminar"]');
        const count = await deleteButtons.count();

        if (count > 0) {
            await deleteButtons.first().click();

            // Confirmar eliminación
            await expect(page.locator('text=Eliminar Sesión')).toBeVisible();
            await page.click('button:has-text("Eliminar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Sesión eliminada correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe filtrar sesiones por paciente', async ({ page }) => {
        // Seleccionar un paciente del filtro
        const filterSelect = page.locator('select').first();
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Verificar que se filtran los resultados
        await expect(page.locator('text=No hay sesiones').or(page.locator('[class*="border-border rounded-lg"]'))).toBeVisible();
    });
});
