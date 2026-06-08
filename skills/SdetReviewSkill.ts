import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { TestPlanSchema, TestPlan } from './schemas/reviewSchema'; // Importamos Zod

export class SdetReviewSkill {
    private aiClient: Anthropic;
    // ... (Variables e inicialización de tokens se mantienen igual)

    constructor() {
        this.aiClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    // ... (Métodos getJiraAcceptanceCriteria y getGithubPrDiff se mantienen igual)

    public async generateReviewReport(jiraId: string, githubPrUrl: string): Promise<TestPlan> {
        // 1. Extracción de contexto externa (Jira + GitHub)
        const [acceptanceCriteria, prDiff] = await Promise.all([
            this.getJiraAcceptanceCriteria(jiraId),
            this.getGithubPrDiff(githubPrUrl)
        ]);

        // 2. Prompt del Sistema inyectando el esquema esperado
        const systemPrompt = `
    Actúa como un Senior SDET Lead. Tu objetivo es diseñar una estrategia de pruebas exhaustiva.
    Debes responder ÚNICAMENTE con un objeto JSON que cumpla estrictamente con la estructura esperada.
    No incluyas texto de bienvenida, ni bloques de código markdown (\`\`\`json ... \`\`\`). Solo el JSON crudo.
    `;

        const userContent = `
    [ESQUEMA OBLIGATORIO DE SALIDA]
    Utiliza exactamente estos campos y tipos:
    ${JSON.stringify(TestPlanSchema.shape, null, 2)}

    [INPUTS DE TRABAJO]
    - Criterios de Aceptación Jira [${jiraId}]: ${acceptanceCriteria}
    - Cambios de Código (Diff PR): ${prDiff}
    `;

        console.log('[Skill] Enviando a Claude con Validación Estricta Zod...');
        const response = await this.aiClient.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: userContent }]
        });

        const rawText = response.content.type === 'text' ? response.content.text : '{}';

        try {
            // 3. LA MAGIA DE ZOD: Parseo y Validación en una sola línea
            // Si el JSON es válido y cumple la estructura, devuelve el objeto tipado como 'TestPlan'
            const validatedJson = TestPlanSchema.parse(JSON.parse(rawText));
            return validatedJson;

        } catch (error: any) {
            // Si la IA alucina o cambia la estructura, Zod arroja un error detallado campo por campo
            console.error('❌ [Zod Validation Error]: El formato de la IA no cumple con el contrato.');
            if (error.errors) {
                console.error(JSON.stringify(error.errors, null, 2)); // Te dice exactamente qué campo falló
            }
            throw new Error(`La IA falló las aserciones de contrato estructural de software: ${error.message}`);
        }
    }
}
