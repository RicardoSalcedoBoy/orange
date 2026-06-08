import { test, expect, request } from '@playwright/test';
import { adminUsername, adminPassword, baseURL } from '../config-env.ts';
import PimService from '../services/pim-service.ts';

// ─────────────────────────────────────────────────────────────────────────────
// PIM API Tests — GET /pim/employees & GET /pim/employees/:empNumber
//
// Este spec prueba el API directamente, sin navegador.
// El flujo es: autenticar → obtener cookie de sesión → usar esa cookie en cada request.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('PIM API — Employee endpoints', () => {

    // El requestContext vive para todos los tests del describe.
    // Se autentica una vez en beforeAll y se reutiliza en cada test.
    let requestContext: Awaited<ReturnType<typeof request.newContext>>;

    test.beforeAll(async () => {
        // 1. Creamos un contexto de API (sin navegador)
        requestContext = await request.newContext({ baseURL });

        // 2. Autenticamos contra el endpoint de sesión de OrangeHRM
        const authResponse = await requestContext.post('/web/index.php/auth/validate', {
            form: { username: adminUsername, password: adminPassword },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Si la autenticación falla todos los tests van a fallar — fallamos rápido aquí
        expect(
            authResponse.ok() || authResponse.status() === 302,
            `Autenticación fallida con status: ${authResponse.status()}`
        ).toBeTruthy();
    });

    test.afterAll(async () => {
        // Limpiamos el contexto al terminar para liberar recursos
        await requestContext.dispose();
    });

    // ─── Happy Path ───────────────────────────────────────────────────────────

    test('TC-001 | GET /pim/employees → 200 con lista de empleados', async () => {
        const response = await PimService.getEmployees(requestContext);

        // Status
        expect(response.status(), 'Debe retornar 200').toBe(200);

        // Content-Type
        expect(
            response.headers()['content-type'],
            'Debe ser application/json'
        ).toContain('application/json');

        // Estructura del body
        const body = await response.json();
        expect(body, 'Body debe tener propiedad data').toHaveProperty('data');
        expect(Array.isArray(body.data), 'data debe ser un array').toBeTruthy();
        expect(body.data.length, 'Lista no debe estar vacía').toBeGreaterThan(0);

        // Estructura de cada empleado
        const employee = body.data[0];
        expect(employee).toHaveProperty('empNumber');
        expect(employee).toHaveProperty('firstName');
        expect(employee).toHaveProperty('lastName');
    });

    test('TC-002 | GET /pim/employees/:id → 200 con empleado específico', async () => {
        // Primero obtenemos la lista para tomar un ID real
        const listResponse = await PimService.getEmployees(requestContext);
        const list = await listResponse.json();
        const validEmpNumber: number = list.data[0].empNumber;

        const response = await PimService.getEmployee(requestContext, validEmpNumber);

        expect(response.status(), 'Debe retornar 200').toBe(200);

        const body = await response.json();
        expect(body).toHaveProperty('data');

        const emp = body.data;
        expect(emp.empNumber, 'El ID debe coincidir con el solicitado').toBe(validEmpNumber);
        expect(typeof emp.firstName, 'firstName debe ser string').toBe('string');
        expect(typeof emp.lastName, 'lastName debe ser string').toBe('string');
    });

    // ─── Not Found ────────────────────────────────────────────────────────────

    test('TC-003 | GET /pim/employees/:id → 404 cuando el empleado no existe', async () => {
        const response = await PimService.getEmployee(requestContext, 999999);

        expect(response.status(), 'Debe retornar 404').toBe(404);

        // La respuesta de error no debe exponer internals del servidor
        const body = await response.json();
        const bodyStr = JSON.stringify(body);
        expect(bodyStr, 'No debe exponer stack traces').not.toContain('stack');
        expect(bodyStr, 'No debe exponer rutas del servidor').not.toContain('/var/www');
    });

    // ─── Performance ─────────────────────────────────────────────────────────

    test('TC-004 | GET /pim/employees → responde en menos de 800ms', async () => {
        const start = Date.now();
        await PimService.getEmployees(requestContext);
        const duration = Date.now() - start;

        expect(duration, `Tiempo de respuesta: ${duration}ms (límite: 800ms)`).toBeLessThan(800);
    });

});
