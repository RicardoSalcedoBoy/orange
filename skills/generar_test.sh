# 🤖 AI QA Engineer — API Test Prompt Template
> **Uso:** `Ejecutar este prompt pasando JIRA_TICKET_ID como parámetro`
> **Versión:** 1.0.0 | **Rol:** Senior SDET / AI QA Engineer

---

## ⚙️ METAPROMPT — INSTRUCCIONES DE EJECUCIÓN

```
PARÁMETROS DE ENTRADA:
  - JIRA_TICKET_ID: {{JIRA_TICKET_ID}}          # Ej: PROJ-1042
  - ENV: {{ENV}}                                  # local | staging | production
  - BASE_URL: {{BASE_URL}}                        # Ej: https://api.example.com

MODO DE EJECUCIÓN:
  Si JIRA_TICKET_ID está presente → recuperar ACs del ticket antes de ejecutar
  Si no → usar los ACs definidos en la sección "Acceptance Criteria" de este archivo
```

---

## 🎯 ROL Y CONTEXTO

Actúa como un **Senior SDET especializado en API Testing y AI-Augmented QA**.

Tu objetivo es diseñar y ejecutar una estrategia de pruebas completa para el siguiente endpoint REST, cubriendo:
- Validación funcional (status codes, payload, contrato)
- Generación de golden dataset para regresión
- Output estructurado en JSON para comparación automática
- Casos de prueba listos para automatización en **Playwright**

Optimiza el uso de tokens priorizando los casos de mayor riesgo primero (estrategia **Risk-Based Testing**).

---

## 📋 CONTEXTO DEL TICKET JIRA

```yaml
ticket_id: "{{JIRA_TICKET_ID}}"           # Parámetro inyectado al ejecutar
titulo: "GET /api/v1/orders/{orderId} — Consulta de orden por ID"
historia_usuario: >
  Como cliente autenticado,
  quiero consultar el detalle de una orden específica por su ID,
  para revisar el estado, productos y total de mi compra.

acceptance_criteria:
  - AC-01: La API responde con HTTP 200 cuando el orderId existe y el token es válido
  - AC-02: El payload contiene los campos obligatorios: id, status, total, currency, items[]
  - AC-03: El campo `status` solo acepta valores del enum [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
  - AC-04: El array `items[]` contiene al menos 1 elemento cuando el status != CANCELLED
  - AC-05: La API responde con HTTP 404 cuando el orderId no existe
  - AC-06: La API responde con HTTP 401 cuando el token de autorización es inválido o ausente
  - AC-07: La API responde con HTTP 403 cuando el token es válido pero pertenece a otro usuario
  - AC-08: El tiempo de respuesta no debe exceder 800ms en el percentil P95

priority: High
story_points: 5
labels: [api, regression, smoke]
```

---

## 🔌 ESPECIFICACIÓN DEL ENDPOINT

```yaml
endpoint:
  method: GET
  path: /api/v1/orders/{orderId}
  base_url: "{{BASE_URL}}"
  full_url: "{{BASE_URL}}/api/v1/orders/{orderId}"

autenticacion:
  tipo: Bearer Token
  header: "Authorization: Bearer {{ACCESS_TOKEN}}"

path_params:
  orderId:
    tipo: string (UUID v4)
    ejemplo: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

headers_requeridos:
  - "Authorization: Bearer <token>"
  - "Content-Type: application/json"
  - "Accept: application/json"
```

---

## 📦 GOLDEN DATASET — PAYLOAD DE REFERENCIA

> Este es el payload canónico que se usa como **verdad absoluta** para comparación en regresión.

```json
{
  "_meta": {
    "golden_dataset_version": "1.0.0",
    "jira_ticket": "{{JIRA_TICKET_ID}}",
    "endpoint": "GET /api/v1/orders/{orderId}",
    "created_at": "2025-01-15T10:00:00Z",
    "environment": "staging"
  },
  "request": {
    "method": "GET",
    "url": "https://api.example.com/api/v1/orders/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "headers": {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "Accept": "application/json"
    }
  },
  "expected_response": {
    "status_code": 200,
    "headers": {
      "content-type": "application/json; charset=utf-8",
      "x-request-id": "*"
    },
    "body": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "status": "PROCESSING",
      "created_at": "2025-01-14T08:30:00Z",
      "updated_at": "2025-01-14T09:15:00Z",
      "currency": "USD",
      "subtotal": 149.97,
      "tax": 12.00,
      "shipping": 9.99,
      "total": 171.96,
      "customer": {
        "id": "cust-001",
        "name": "Jane Doe",
        "email": "jane.doe@example.com"
      },
      "shipping_address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94105",
        "country": "US"
      },
      "items": [
        {
          "id": "item-001",
          "product_id": "prod-abc",
          "name": "Wireless Headphones Pro",
          "sku": "WHP-001-BLK",
          "quantity": 1,
          "unit_price": 99.99,
          "subtotal": 99.99
        },
        {
          "id": "item-002",
          "product_id": "prod-xyz",
          "name": "USB-C Cable 2m",
          "sku": "USB-C-2M-WHT",
          "quantity": 2,
          "unit_price": 24.99,
          "subtotal": 49.98
        }
      ],
      "payment": {
        "method": "CREDIT_CARD",
        "last_four": "4242",
        "status": "CAPTURED"
      }
    }
  }
}
```

---

## 🧪 ESTRATEGIA DE PRUEBAS

### Instrucciones para el AI

Ejecuta los siguientes casos de prueba en orden de **prioridad de riesgo**.
Para cada caso genera el **output JSON** especificado en la sección de Output.

**Optimización de costos / tokens:**
- Ejecuta primero los casos CRÍTICOS (smoke tests)
- Si algún caso crítico falla, detente y reporta antes de continuar
- Agrupa validaciones similares en un solo request cuando sea posible
- Usa el golden dataset como fuente única de verdad para comparaciones

---

### CASO 1 — Happy Path (AC-01, AC-02, AC-03, AC-04) 🟢 CRÍTICO

```
DADO que tengo un token de autenticación válido
  Y el orderId "a1b2c3d4-e5f6-7890-abcd-ef1234567890" existe en el sistema
CUANDO hago GET /api/v1/orders/a1b2c3d4-e5f6-7890-abcd-ef1234567890
ENTONCES:
  - El status code debe ser 200
  - El Content-Type header debe contener "application/json"
  - El campo "id" debe ser igual al orderId solicitado
  - El campo "status" debe ser uno de: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
  - El campo "total" debe ser un número > 0
  - El campo "currency" debe tener exactamente 3 caracteres (ISO 4217)
  - El array "items" debe tener longitud >= 1
  - El objeto "customer" debe contener: id, name, email
  - El tiempo de respuesta debe ser < 800ms
VALIDACIONES DE CONTRATO (JSON Schema):
  - Validar contra el schema definido en la sección Schema Contract
  - Comparar con el golden dataset usando deep-equal en campos no dinámicos
```

---

### CASO 2 — Not Found (AC-05) 🟡 ALTO

```
DADO que tengo un token válido
  Y el orderId "00000000-0000-0000-0000-000000000000" NO existe
CUANDO hago GET /api/v1/orders/00000000-0000-0000-0000-000000000000
ENTONCES:
  - El status code debe ser 404
  - El body debe contener un campo "error" o "message"
  - El body NO debe exponer stack traces ni información interna del servidor
```

---

### CASO 3 — Unauthorized (AC-06) 🟡 ALTO

```
ESCENARIO 3A: Sin token
  CUANDO hago GET sin header Authorization
  ENTONCES status code = 401

ESCENARIO 3B: Token inválido
  CUANDO hago GET con Authorization: Bearer TOKEN_INVALIDO_12345
  ENTONCES status code = 401

ESCENARIO 3C: Token expirado
  CUANDO hago GET con token expirado (exp < now)
  ENTONCES status code = 401
```

---

### CASO 4 — Forbidden (AC-07) 🟡 ALTO

```
DADO que el orderId pertenece al usuario "user-A"
  Y estoy autenticado como "user-B" (token válido pero diferente)
CUANDO hago GET /api/v1/orders/{orderId_de_user_A}
ENTONCES:
  - El status code debe ser 403
  - El body debe indicar acceso prohibido
  - El sistema NO debe devolver datos de la orden de otro usuario
```

---

### CASO 5 — Validación de Campos Dinámicos 🟢 MEDIO

```
Campos a excluir de comparación exacta con golden dataset (son dinámicos):
  - updated_at (cambia con cada actualización)
  - x-request-id (header único por request)

Campos a validar con regex o formato:
  - id: debe ser UUID v4 → /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  - created_at / updated_at: ISO 8601 → /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  - email: formato válido → /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  - currency: ISO 4217 3 chars → /^[A-Z]{3}$/
```

---

## 📐 JSON SCHEMA CONTRACT

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Order Response Schema",
  "type": "object",
  "required": ["id", "status", "total", "currency", "items", "customer"],
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "status": {
      "type": "string",
      "enum": ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "subtotal": { "type": "number", "minimum": 0 },
    "tax": { "type": "number", "minimum": 0 },
    "shipping": { "type": "number", "minimum": 0 },
    "total": { "type": "number", "minimum": 0 },
    "customer": {
      "type": "object",
      "required": ["id", "name", "email"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      }
    },
    "items": {
      "type": "array",
      "minItems": 0,
      "items": {
        "type": "object",
        "required": ["id", "product_id", "name", "quantity", "unit_price", "subtotal"],
        "properties": {
          "id": { "type": "string" },
          "product_id": { "type": "string" },
          "name": { "type": "string" },
          "sku": { "type": "string" },
          "quantity": { "type": "integer", "minimum": 1 },
          "unit_price": { "type": "number", "minimum": 0 },
          "subtotal": { "type": "number", "minimum": 0 }
        }
      }
    }
  }
}
```

---

## 📊 OUTPUT ESPERADO — FORMATO JSON

> El AI debe generar un resultado con **exactamente** esta estructura para cada caso ejecutado.

```json
{
  "test_run": {
    "id": "run-{{timestamp}}",
    "jira_ticket": "{{JIRA_TICKET_ID}}",
    "endpoint": "GET /api/v1/orders/{orderId}",
    "environment": "{{ENV}}",
    "executed_at": "{{ISO_TIMESTAMP}}",
    "total_cases": 5,
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 0
  },
  "results": [
    {
      "case_id": "TC-001",
      "name": "Happy Path — Valid order returns 200 with full payload",
      "ac_coverage": ["AC-01", "AC-02", "AC-03", "AC-04"],
      "status": "PASSED | FAILED | SKIPPED",
      "priority": "CRITICAL",
      "request": {
        "method": "GET",
        "url": "https://api.example.com/api/v1/orders/a1b2c3d4-...",
        "headers": { "Authorization": "Bearer ***REDACTED***" }
      },
      "response": {
        "status_code": 200,
        "duration_ms": 243,
        "headers": { "content-type": "application/json; charset=utf-8" },
        "body": {}
      },
      "assertions": [
        {
          "name": "status_code_is_200",
          "expected": 200,
          "actual": 200,
          "passed": true
        },
        {
          "name": "content_type_is_json",
          "expected": "application/json",
          "actual": "application/json; charset=utf-8",
          "passed": true
        },
        {
          "name": "status_field_is_valid_enum",
          "expected": ["PENDING","PROCESSING","SHIPPED","DELIVERED","CANCELLED"],
          "actual": "PROCESSING",
          "passed": true
        },
        {
          "name": "items_array_not_empty",
          "expected": ">= 1",
          "actual": 2,
          "passed": true
        },
        {
          "name": "response_time_under_800ms",
          "expected": "< 800",
          "actual": 243,
          "passed": true
        },
        {
          "name": "schema_contract_validation",
          "expected": "valid",
          "actual": "valid",
          "passed": true
        },
        {
          "name": "golden_dataset_comparison",
          "expected": "match (excluding dynamic fields)",
          "actual": "match",
          "passed": true,
          "excluded_fields": ["updated_at", "x-request-id"]
        }
      ],
      "golden_dataset_diff": {
        "matched": true,
        "differences": []
      },
      "error": null
    }
  ],
  "summary": {
    "smoke_tests_passed": true,
    "ac_coverage": {
      "AC-01": "COVERED",
      "AC-02": "COVERED",
      "AC-03": "COVERED",
      "AC-04": "COVERED",
      "AC-05": "COVERED",
      "AC-06": "COVERED",
      "AC-07": "COVERED",
      "AC-08": "COVERED"
    },
    "recommendations": []
  }
}
```

---

## 🎭 CÓDIGO PLAYWRIGHT — PRUEBAS AUTOMATIZADAS

> El AI debe generar el siguiente archivo TypeScript listo para ejecutar.

```typescript
// tests/api/orders.api.spec.ts
// Auto-generado desde: {{JIRA_TICKET_ID}} | {{TIMESTAMP}}
// Ejecutar: npx playwright test tests/api/orders.api.spec.ts

import { test, expect, APIRequestContext } from '@playwright/test';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import goldenDataset from '../fixtures/golden-order.json';
import orderSchema from '../schemas/order.schema.json';

const BASE_URL = process.env.BASE_URL || 'https://api.example.com';
const VALID_TOKEN = process.env.ACCESS_TOKEN || '';
const VALID_ORDER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const NONEXISTENT_ORDER_ID = '00000000-0000-0000-0000-000000000000';
const OTHER_USER_ORDER_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

// Campos dinámicos excluidos de la comparación con golden dataset
const DYNAMIC_FIELDS = ['updated_at'];

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateSchema = ajv.compile(orderSchema);

// Helper: deep equal excluyendo campos dinámicos
function compareWithGolden(actual: Record<string, unknown>, golden: Record<string, unknown>, excludeFields: string[] = []) {
  const filtered = { ...actual };
  excludeFields.forEach(f => delete filtered[f]);
  const goldenFiltered = { ...golden };
  excludeFields.forEach(f => delete goldenFiltered[f]);
  return JSON.stringify(filtered) === JSON.stringify(goldenFiltered);
}

test.describe('GET /api/v1/orders/{orderId} — {{JIRA_TICKET_ID}}', () => {

  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${VALID_TOKEN}`,
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // ─── AC-01, AC-02, AC-03, AC-04 ───────────────────────────────────────
  test('TC-001 | Happy Path: 200 con payload válido', async () => {
    const startTime = Date.now();
    const response = await apiContext.get(`/api/v1/orders/${VALID_ORDER_ID}`);
    const duration = Date.now() - startTime;
    const body = await response.json();

    // Status code
    expect(response.status(), 'AC-01: Status debe ser 200').toBe(200);

    // Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // Campos obligatorios (AC-02)
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('currency');
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('customer');

    // Enum de status (AC-03)
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    expect(validStatuses, 'AC-03: Status debe ser enum válido').toContain(body.status);

    // Items no vacío si no está cancelado (AC-04)
    if (body.status !== 'CANCELLED') {
      expect(body.items.length, 'AC-04: items[] debe tener al menos 1 elemento').toBeGreaterThanOrEqual(1);
    }

    // JSON Schema Contract
    const isValid = validateSchema(body);
    expect(isValid, `Schema inválido: ${JSON.stringify(validateSchema.errors)}`).toBeTruthy();

    // Golden Dataset comparison
    const matchesGolden = compareWithGolden(body, goldenDataset.expected_response.body, DYNAMIC_FIELDS);
    expect(matchesGolden, 'Payload no coincide con golden dataset').toBeTruthy();

    // Performance (AC-08)
    expect(duration, 'AC-08: Response time debe ser < 800ms').toBeLessThan(800);
  });

  // ─── AC-05 ─────────────────────────────────────────────────────────────
  test('TC-002 | Not Found: 404 cuando orderId no existe', async () => {
    const response = await apiContext.get(`/api/v1/orders/${NONEXISTENT_ORDER_ID}`);
    expect(response.status(), 'AC-05: Status debe ser 404').toBe(404);

    const body = await response.json();
    const hasErrorField = 'error' in body || 'message' in body;
    expect(hasErrorField, 'Body debe contener campo error o message').toBeTruthy();
    expect(JSON.stringify(body)).not.toContain('stack');
  });

  // ─── AC-06 ─────────────────────────────────────────────────────────────
  test('TC-003A | Unauthorized: 401 sin token', async () => {
    const ctx = await (await import('@playwright/test')).request.newContext({ baseURL: BASE_URL });
    const response = await ctx.get(`/api/v1/orders/${VALID_ORDER_ID}`);
    expect(response.status(), 'AC-06: Sin token → 401').toBe(401);
    await ctx.dispose();
  });

  test('TC-003B | Unauthorized: 401 con token inválido', async () => {
    const ctx = await (await import('@playwright/test')).request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': 'Bearer TOKEN_INVALIDO_12345' },
    });
    const response = await ctx.get(`/api/v1/orders/${VALID_ORDER_ID}`);
    expect(response.status(), 'AC-06: Token inválido → 401').toBe(401);
    await ctx.dispose();
  });

  // ─── AC-07 ─────────────────────────────────────────────────────────────
  test('TC-004 | Forbidden: 403 al acceder a orden de otro usuario', async () => {
    const response = await apiContext.get(`/api/v1/orders/${OTHER_USER_ORDER_ID}`);
    expect(response.status(), 'AC-07: Orden de otro usuario → 403').toBe(403);
  });

  // ─── Validación de formatos dinámicos ──────────────────────────────────
  test('TC-005 | Formatos de campos: UUID, fechas, email, currency', async () => {
    const response = await apiContext.get(`/api/v1/orders/${VALID_ORDER_ID}`);
    const body = await response.json();

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const currencyRegex = /^[A-Z]{3}$/;

    expect(body.id).toMatch(uuidRegex);
    expect(body.created_at).toMatch(isoDateRegex);
    expect(body.customer.email).toMatch(emailRegex);
    expect(body.currency).toMatch(currencyRegex);
  });

});
```

---

## 🔧 CONFIGURACIÓN PLAYWRIGHT

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 10_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never' }],
  ],
  use: {
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
  projects: [
    {
      name: 'API Tests',
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],
});
```

---

## 💡 OPTIMIZACIÓN DE COSTOS (Token Budget)

```yaml
estrategia_de_priorización:
  nivel_1_critico:
    - TC-001 (Happy Path)
    descripcion: "Si falla → detener ejecución y reportar inmediatamente"
    tokens_estimados: "~800"

  nivel_2_alto:
    - TC-002 (404)
    - TC-003A / TC-003B (401)
    - TC-004 (403)
    descripcion: "Ejecutar solo si nivel 1 pasa"
    tokens_estimados: "~1200"

  nivel_3_medio:
    - TC-005 (Formato de campos)
    descripcion: "Ejecutar si niveles anteriores pasan"
    tokens_estimados: "~400"

reglas:
  - "Nunca ejecutar pruebas de performance bajo carga en este prompt (usar k6/Gatling por separado)"
  - "Reutilizar el mismo token de autenticación entre casos cuando sea posible"
  - "Cachear el response del TC-001 para validaciones posteriores de formato"
  - "Si ENV=production → omitir TC-003B y TC-004 para no generar ruido en logs"

total_estimado: "~2400 tokens por ejecución completa"
```

---

## 📝 INSTRUCCIÓN FINAL AL AI

```
Una vez que ejecutes todos los casos de prueba:

1. Genera el OUTPUT JSON completo con la estructura definida arriba
2. Genera el archivo TypeScript de Playwright si algún caso falló (para reproducir)
3. Lista los ACs cubiertos vs no cubiertos
4. Si hay FALLAS: incluye en "recommendations" los pasos para reportar el bug en Jira:
   - Título sugerido del bug
   - Pasos para reproducir
   - Resultado esperado vs actual
   - Severidad sugerida (Blocker / Critical / Major / Minor)
5. Optimización: indica qué casos se pueden paralelizar en CI/CD

IMPORTANTE: Redacta tokens sensibles como "***REDACTED***" en todos los outputs.
```

---

*Generado para uso educativo — AI QA Engineer Interview Prep*
*Template versión 1.0.0 — Compatible con Playwright v1.40+ / TypeScript 5+*
