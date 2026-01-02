import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Facturación CRUD', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/billing');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar la lista de facturas', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Facturación');
        await expect(page.locator('button:has-text("Nueva Factura")')).toBeVisible();
    });

    test('Debe crear una nueva factura', async ({ page }) => {
        // Abrir modal
        await page.click('button:has-text("Nueva Factura")');
        await expect(page.locator('text=Nueva Factura')).toBeVisible();

        // Seleccionar paciente
        await page.selectOption('select[name="patientId"]', { index: 1 });

        // Llenar datos de la factura
        await page.fill('input[name="concept"]', 'Sesión de terapia individual');
        await page.fill('input[name="amount"]', '800');
        await page.fill('input[name="tax"]', '16');

        // Fecha de vencimiento
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);
        const dueDateStr = futureDate.toISOString().split('T')[0];
        await page.fill('input[name="dueDate"]', dueDateStr);

        // Enviar formulario
        await page.click('button[type="submit"]:has-text("Crear")');

        // Verificar mensaje de éxito
        await expect(page.locator('text=Factura creada correctamente')).toBeVisible({ timeout: 10000 });
    });

    test('Debe registrar un pago', async ({ page }) => {
        await page.waitForSelector('button:has-text("Registrar Pago")', { timeout: 10000 });

        const paymentButtons = page.locator('button:has-text("Registrar Pago")');
        const count = await paymentButtons.count();

        if (count > 0) {
            await paymentButtons.first().click();
            await expect(page.locator('text=Registrar Pago')).toBeVisible();

            // Llenar datos del pago
            await page.fill('input[name="amount"]', '500');
            await page.selectOption('select[name="method"]', 'cash');

            // Guardar pago
            await page.click('button[type="submit"]:has-text("Registrar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Pago registrado correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe editar una factura existente', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Editar"]', { timeout: 10000 });

        const editButtons = page.locator('button[aria-label="Editar"]');
        const count = await editButtons.count();

        if (count > 0) {
            await editButtons.first().click();
            await expect(page.locator('text=Editar Factura')).toBeVisible();

            // Modificar concepto
            await page.fill('input[name="concept"]', 'Sesión de terapia grupal - Actualizado');

            // Guardar cambios
            await page.click('button[type="submit"]:has-text("Actualizar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Factura actualizada correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe eliminar una factura', async ({ page }) => {
        await page.waitForSelector('button[aria-label="Eliminar"]', { timeout: 10000 });

        const deleteButtons = page.locator('button[aria-label="Eliminar"]');
        const count = await deleteButtons.count();

        if (count > 0) {
            await deleteButtons.first().click();

            // Confirmar eliminación
            await expect(page.locator('text=Eliminar Factura')).toBeVisible();
            await page.click('button:has-text("Eliminar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Factura eliminada correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe filtrar facturas por estado', async ({ page }) => {
        // Seleccionar filtro de estado
        const filterSelect = page.locator('select').first();
        await filterSelect.selectOption('pending');
        await page.waitForTimeout(500);

        // Verificar que se filtran los resultados
        await expect(page.locator('text=No hay facturas').or(page.locator('[class*="border-border rounded-lg"]'))).toBeVisible();
    });
});
