import { z } from 'zod';

// 1. Definimos el esquema de validación en tiempo de ejecución (Runtime)
export const TestPlanSchema = z.object({
    summary: z.string({ required_error: "El resumen es obligatorio" }),
    tools_required: z.array(z.string()),
    test_cases: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            priority: z.enum(['P0', 'P1', 'P2']), // Restringido solo a estos valores
            type: z.enum(['Manual', 'Automation']),
            tool: z.enum(['Postman', 'Playwright', 'k6', 'Bruno']),
            steps: z.array(z.string()),
            expected_result: z.union([z.string(), z.record(z.any())]) // Puede ser texto o un objeto JSON
        })
    ),
    risk_analysis: z.object({
        security: z.string(),
        performance: z.string()
    })
});

// 2. Inferimos el tipo de TypeScript AUTOMÁTICAMENTE a partir del esquema de arriba
// Ya no tienes que escribir interfaces duplicadas a mano.
export type TestPlan = z.infer<typeof TestPlanSchema>;
