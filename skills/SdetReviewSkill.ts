import Anthropic from '@anthropic-ai/sdk';
import { TestPlanSchema, TestPlan } from '../src/schemas/reviewSchema.ts';

const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are a Senior SDET Lead responsible for designing comprehensive test strategies.
Given Jira acceptance criteria and a GitHub PR diff, call submit_test_plan with a complete, actionable
test plan. Cover functional correctness, security boundaries, and performance thresholds.
Prioritize test cases: P0 = smoke/blocker, P1 = high risk, P2 = edge cases.`;

const TEST_PLAN_TOOL: Anthropic.Tool = {
    name: 'submit_test_plan',
    description: 'Submit the structured QA test plan after analyzing the Jira ticket and PR diff.',
    input_schema: {
        type: 'object',
        properties: {
            summary: {
                type: 'string',
                description: 'Executive summary of the testing strategy (2–3 sentences)'
            },
            tools_required: {
                type: 'array',
                items: { type: 'string' },
                description: 'Testing tools required. Choose from: Playwright, Postman, k6, Bruno'
            },
            test_cases: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Unique ID (e.g. TC-001)' },
                        title: { type: 'string' },
                        priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
                        type: { type: 'string', enum: ['Manual', 'Automation'] },
                        tool: { type: 'string', enum: ['Postman', 'Playwright', 'k6', 'Bruno'] },
                        steps: { type: 'array', items: { type: 'string' } },
                        expected_result: { type: 'string' }
                    },
                    required: ['id', 'title', 'priority', 'type', 'tool', 'steps', 'expected_result']
                }
            },
            risk_analysis: {
                type: 'object',
                properties: {
                    security: { type: 'string' },
                    performance: { type: 'string' }
                },
                required: ['security', 'performance']
            }
        },
        required: ['summary', 'tools_required', 'test_cases', 'risk_analysis']
    }
};

export class SdetReviewSkill {
    private readonly client: Anthropic;

    constructor() {
        this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    private async getJiraAcceptanceCriteria(jiraId: string): Promise<string> {
        const baseUrl = process.env.JIRA_BASE_URL;
        const email = process.env.JIRA_EMAIL;
        const token = process.env.JIRA_API_TOKEN;

        if (!baseUrl || !email || !token) {
            console.warn(`[SdetReviewSkill] Jira credentials not set — using stub for ${jiraId}`);
            return `[STUB] Acceptance criteria for ${jiraId}: feature must behave correctly across all supported scenarios including happy path, error states, and security boundaries.`;
        }

        const url = `${baseUrl}/rest/api/3/issue/${jiraId}?fields=summary,description`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { fields: { summary: string; description: unknown } };
        return `Summary: ${data.fields.summary}\nDescription: ${JSON.stringify(data.fields.description)}`;
    }

    private async getGithubPrDiff(prUrl: string): Promise<string> {
        const token = process.env.GITHUB_TOKEN;

        const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
        if (!match) {
            console.warn('[SdetReviewSkill] Invalid GitHub PR URL — using stub diff');
            return `[STUB] PR diff not available. URL: ${prUrl}`;
        }

        const [, owner, repo, prNumber] = match;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

        const headers: Record<string, string> = {
            Accept: 'application/vnd.github.v3.diff',
            'X-GitHub-Api-Version': '2022-11-28'
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, { headers });
        if (!response.ok) {
            console.warn(`[SdetReviewSkill] GitHub API ${response.status} — using stub diff`);
            return `[STUB] PR diff unavailable (${response.status}).`;
        }

        const diff = await response.text();
        return diff.length > 4000 ? `${diff.slice(0, 4000)}\n... [truncated]` : diff;
    }

    private async callModel(messages: Anthropic.MessageParam[]): Promise<Anthropic.Message> {
        return this.client.messages.create({
            model: MODEL,
            max_tokens: 4096,
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            tools: [TEST_PLAN_TOOL],
            tool_choice: { type: 'tool', name: 'submit_test_plan' },
            messages
        });
    }

    private extractToolBlock(response: Anthropic.Message): Anthropic.ToolUseBlock | undefined {
        return response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    }

    public async generateReviewReport(jiraId: string, githubPrUrl: string): Promise<TestPlan> {
        const [jiraContext, prDiff] = await Promise.all([
            this.getJiraAcceptanceCriteria(jiraId),
            this.getGithubPrDiff(githubPrUrl)
        ]);

        const userMessage: Anthropic.MessageParam = {
            role: 'user',
            content: `Generate a complete test plan for:\n\nJira [${jiraId}]:\n${jiraContext}\n\nPR Diff:\n${prDiff}`
        };

        console.log('[SdetReviewSkill] Calling model with tool use...');
        const response = await this.callModel([userMessage]);

        const toolBlock = this.extractToolBlock(response);
        if (!toolBlock) {
            throw new Error('Model did not invoke the submit_test_plan tool');
        }

        try {
            return TestPlanSchema.parse(toolBlock.input);
        } catch (zodError: any) {
            console.warn('[SdetReviewSkill] Zod validation failed — attempting self-healing...');
            return this.retryWithCorrection(userMessage, response, zodError);
        }
    }

    private async retryWithCorrection(
        originalMessage: Anthropic.MessageParam,
        assistantResponse: Anthropic.Message,
        zodError: any
    ): Promise<TestPlan> {
        const errorDetail = zodError.errors
            ? JSON.stringify(zodError.errors, null, 2)
            : zodError.message;

        const correctionMessages: Anthropic.MessageParam[] = [
            originalMessage,
            { role: 'assistant', content: assistantResponse.content },
            {
                role: 'user',
                content: `Your tool call failed schema validation. Correct the following fields and call submit_test_plan again:\n\n${errorDetail}`
            }
        ];

        const retryResponse = await this.callModel(correctionMessages);
        const retryBlock = this.extractToolBlock(retryResponse);

        if (!retryBlock) {
            throw new Error('Self-healing attempt did not produce a valid tool call');
        }

        return TestPlanSchema.parse(retryBlock.input);
    }
}
