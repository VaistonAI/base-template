import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Pacientes CRUD', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();
        await page.goto('/patients');
        await page.waitForLoadState('networkidle');
    });

    test('Debe mostrar la lista de pacientes', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Pacientes');
        await expect(page.locator('button:has-text("Nuevo Paciente")')).toBeVisible();
    });

    test('Debe crear un nuevo paciente', async ({ page }) => {
        const timestamp = Date.now();
        const testPatient = {
            firstName: `Test${timestamp}`,
            lastName: `Patient${timestamp}`,
            email: `test${timestamp}@test.com`,
            phone: '5512345678',
            dateOfBirth: '1990-01-01',
            address: 'Calle Test 123',
            emergencyContact: 'Juan Pérez',
            emergencyPhone: '5587654321',
            medicalHistory: 'Sin antecedentes relevantes',
        };

        // Abrir modal
        await page.click('button:has-text("Nuevo Paciente")');
        await expect(page.locator('text=Nueva Paciente')).toBeVisible();

        // Llenar formulario
        await page.fill('input[name="firstName"]', testPatient.firstName);
        await page.fill('input[name="lastName"]', testPatient.lastName);
        await page.fill('input[name="email"]', testPatient.email);
        await page.fill('input[name="phone"]', testPatient.phone);
        await page.fill('input[name="dateOfBirth"]', testPatient.dateOfBirth);
        await page.fill('input[name="address"]', testPatient.address);
        await page.fill('input[name="emergencyContact"]', testPatient.emergencyContact);
        await page.fill('input[name="emergencyPhone"]', testPatient.emergencyPhone);
        await page.fill('textarea[name="medicalHistory"]', testPatient.medicalHistory);

        // Enviar formulario
        await page.click('button[type="submit"]:has-text("Crear")');

        // Verificar mensaje de éxito
        await expect(page.locator('text=Paciente creado correctamente')).toBeVisible({ timeout: 10000 });

        // Verificar que aparece en la lista
        await page.click('button:has-text("Aceptar")');
        await page.waitForTimeout(1000);
        await expect(page.locator(`text=${testPatient.firstName} ${testPatient.lastName}`)).toBeVisible();
    });

    test('Debe editar un paciente existente', async ({ page }) => {
        // Esperar a que cargue la lista
        await page.waitForSelector('button[aria-label="Editar"]', { timeout: 10000 });

        // Hacer clic en el primer botón de editar
        const editButtons = page.locator('button[aria-label="Editar"]');
        const count = await editButtons.count();

        if (count > 0) {
            await editButtons.first().click();
            await expect(page.locator('text=Editar Paciente')).toBeVisible();

            // Modificar un campo
            const newPhone = '5599887766';
            await page.fill('input[name="phone"]', newPhone);

            // Guardar cambios
            await page.click('button[type="submit"]:has-text("Actualizar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Paciente actualizado correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe eliminar un paciente', async ({ page }) => {
        // Esperar a que cargue la lista
        await page.waitForSelector('button[aria-label="Eliminar"]', { timeout: 10000 });

        // Hacer clic en el primer botón de eliminar
        const deleteButtons = page.locator('button[aria-label="Eliminar"]');
        const count = await deleteButtons.count();

        if (count > 0) {
            await deleteButtons.first().click();

            // Confirmar eliminación
            await expect(page.locator('text=Eliminar Paciente')).toBeVisible();
            await page.click('button:has-text("Eliminar")');

            // Verificar mensaje de éxito
            await expect(page.locator('text=Paciente eliminado correctamente')).toBeVisible({ timeout: 10000 });
        }
    });

    test('Debe buscar pacientes', async ({ page }) => {
        // Buscar por nombre
        const searchInput = page.locator('input[placeholder*="Buscar"]');
        await searchInput.fill('Test');
        await page.waitForTimeout(500);

        // Verificar que se filtran los resultados
        const results = page.locator('[class*="border-border rounded-lg"]');
        await expect(results.first()).toBeVisible();
    });
});
