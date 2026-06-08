import { z } from 'zod';

export const TestCaseSchema = z.object({
    id: z.string(),
    title: z.string(),
    priority: z.enum(['P0', 'P1', 'P2']),
    type: z.enum(['Manual', 'Automation']),
    tool: z.enum(['Postman', 'Playwright', 'k6', 'Bruno']),
    steps: z.array(z.string()).min(1),
    expected_result: z.string()
});

export const TestPlanSchema = z.object({
    summary: z.string({ error: 'summary is required' }),
    tools_required: z.array(z.string()).min(1),
    test_cases: z.array(TestCaseSchema).min(1),
    risk_analysis: z.object({
        security: z.string(),
        performance: z.string()
    })
});

export type TestCase = z.infer<typeof TestCaseSchema>;
export type TestPlan = z.infer<typeof TestPlanSchema>;
