import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Consultorios CRUD', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/offices');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar la lista de consultorios', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Consultorios');
        await expect(page.locator('button:has-text("Nuevo Consultorio")')).toBeVisible();
    });

    test('Debe crear un nuevo consultorio', async ({ page }) => {
        const timestamp = Date.now();
        const testOffice = {
            name: `Consultorio Test ${timestamp}`,
            location: 'Piso 2, Oficina 201',
            capacity: '4',
            equipment: 'Sillón, escritorio, computadora',
            schedule: 'Lunes a Viernes 9:00 - 18:00',
        };

        // Abrir modal
        await page.click('button:has-text("Nuevo Consultorio")');
        await expect(page.locator('text=Nuevo Consultorio')).toBeVisible();

        // Llenar formulario
        await page.fill('input[name="name"]', testOffice.name);
        await page.fill('input[name="location"]', testOffice.location);
        await page.fill('input[name="capacity"]', testOffice.capacity);
        await page.fill('textarea[name="equipment"]', testOffice.equipment);
        await page.fill('textarea[name="schedule"]', testOffice.schedule);

        // Enviar formulario
        await page.click('button[type="submit"]:has-text("Crear")');

        // Verificar mensaje de éxito
        await expect(page.locator('text=Consultorio creado correctamente')).toBeVisible({ timeout: 10000 });

        // Verificar que aparece en la lista
        await page.click('button:has-text("Aceptar")');
        await page.waitForTimeout(1000);
        await expect(page.locator(`text=${testOffice.name}`)).toBeVisible();
    });

    test('Debe editar un consultorio existente', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Editar"]', { timeout: 10000 });

        const editButtons = page.locator('button[aria-label="Editar"]');
        const count = await editButtons.count();

        if (count > 0) {
            await editButtons.first().click();
            await expect(page.locator('text=Editar Consultorio')).toBeVisible();

            // Modificar capacidad
            await page.fill('input[name="capacity"]', '6');

            // Guardar cambios
            await page.click('button[type="submit"]:has-text("Actualizar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Consultorio actualizado correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe eliminar un consultorio', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Eliminar"]', { timeout: 10000 });

        const deleteButtons = page.locator('button[aria-label="Eliminar"]');
        const count = await deleteButtons.count();

        if (count > 0) {
            await deleteButtons.first().click();

            // Confirmar eliminación
            await expect(page.locator('text=Eliminar Consultorio')).toBeVisible();
            await page.click('button:has-text("Eliminar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Consultorio eliminado correctamente')).toBeVisible({ timeout: 10000 });
        }
    });
});
