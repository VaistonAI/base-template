import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Usuarios CRUD', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/users');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar la lista de usuarios', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Usuarios');
        await expect(page.locator('button:has-text("Nuevo Usuario")')).toBeVisible();
    });

    test('Debe crear un nuevo usuario', async ({ page }) => {
        const timestamp = Date.now();
        const testUser = {
            email: `testuser${timestamp}@vaiston.com`,
            displayName: `Test User ${timestamp}`,
            role: 'psychologist',
        };

        // Abrir modal
        await page.click('button:has-text("Nuevo Usuario")');
        await expect(page.locator('text=Nuevo Usuario')).toBeVisible();

        // Llenar formulario
        await page.fill('input[name="email"]', testUser.email);
        await page.fill('input[name="displayName"]', testUser.displayName);
        await page.selectOption('select[name="role"]', testUser.role);

        // Enviar formulario
        await page.click('button[type="submit"]:has-text("Crear")');

        // Verificar mensaje de éxito
        await expect(page.locator('text=Usuario creado correctamente')).toBeVisible({ timeout: 10000 });

        // Verificar que aparece en la lista
        await page.click('button:has-text("Aceptar")');
        await page.waitForTimeout(1000);
        await expect(page.locator(`text=${testUser.displayName}`)).toBeVisible();
    });

    test('Debe editar un usuario existente', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Editar"]', { timeout: 10000 });

        const editButtons = page.locator('button[aria-label="Editar"]');
        const count = await editButtons.count();

        if (count > 0) {
            await editButtons.first().click();
            await expect(page.locator('text=Editar Usuario')).toBeVisible();

            // Cambiar rol
            await page.selectOption('select[name="role"]', 'receptionist');

            // Guardar cambios
            await page.click('button[type="submit"]:has-text("Actualizar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Usuario actualizado correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe eliminar un usuario', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Eliminar"]', { timeout: 10000 });

        const deleteButtons = page.locator('button[aria-label="Eliminar"]');
        const count = await deleteButtons.count();

        if (count > 0) {
            await deleteButtons.first().click();

            // Confirmar eliminación
            await expect(page.locator('text=Eliminar Usuario')).toBeVisible();
            await page.click('button:has-text("Eliminar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Usuario eliminado correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe buscar usuarios', async ({ page }) => {
        // Buscar por nombre
        const searchInput = page.locator('input[placeholder*="Buscar"]');
        await searchInput.fill('Test');
        await page.waitForTimeout(500);

        // Verificar que se filtran los resultados
        const results = page.locator('[class*="border-border rounded-lg"]');
        await expect(results.first()).toBeVisible();
    });

    test('Debe mostrar permisos por rol', async ({ page }) => {
        // Verificar que se muestran las tarjetas de permisos
        await expect(page.locator('text=Administrador')).toBeVisible();
        await expect(page.locator('text=Psicólogo')).toBeVisible();
        await expect(page.locator('text=Recepcionista')).toBeVisible();
        await expect(page.locator('text=Visualizador')).toBeVisible();
    });
});
