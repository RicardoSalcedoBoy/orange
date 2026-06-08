import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 8192;

const SYSTEM_PROMPT = `You are a Senior SDET Automation Engineer specialized in Playwright and TypeScript.

When given a JSON test plan, generate production-ready Playwright test scripts following these standards:
- Use Page Object Model for UI tests; use APIRequestContext for API tests
- Each test must be fully independent — no shared mutable state between tests
- Group related tests inside test.describe blocks
- Include meaningful assertion messages (third argument to expect())
- Redact all sensitive values (tokens, passwords) as ***REDACTED*** in comments and logs
- Output valid TypeScript only — no markdown fences, no explanatory prose`;

export class SdetAutomationSkill {
    private readonly client: Anthropic;

    constructor() {
        this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    async generatePlaywrightTests(jsonTestPlan: string): Promise<string> {
        const response = await this.client.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            messages: [
                {
                    role: 'user',
                    content: `Translate this JSON test plan into robust, independent Playwright scripts:\n\n${jsonTestPlan}`
                }
            ]
        });

        const block = response.content[0];
        return block.type === 'text' ? block.text : '';
    }
}
