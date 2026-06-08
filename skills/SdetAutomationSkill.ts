import Anthropic from '@anthropic-ai/sdk';

export class SdetAutomationSkill {
    private aiClient: Anthropic;

    constructor() {
        this.aiClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    public async generatePlaywrightTests(jsonTestPlan: string): Promise<string> {
        const systemPrompt = "Actúa como un SDET Automation Engineer Senior especialista en Playwright y TypeScript.";
        const userContent = `Toma este Plan de Pruebas en formato JSON y tradúcelo a scripts funcionales de Playwright robustos e independientes:\n\n${jsonTestPlan}`;

        const response = await this.aiClient.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: userContent }]
        });

        return response.content.type === 'text' ? response.content.text : '';
    }
}
