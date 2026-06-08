import { SdetReviewSkill } from '../skills/SdetReviewSkill.ts';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { TestPlan } from './schemas/reviewSchema.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface GoldenEval {
    evalId: string;
    description: string;
    inputs: { jiraId: string; prUrl: string };
    assertions: {
        expectedJsonFields: string[];
        mandatoryKeywordsInPlan: string[];
        forbiddenKeywords: string[];
    };
}

interface EvalResult {
    evalId: string;
    description: string;
    passed: boolean;
    failures: string[];
    output?: TestPlan;
}

function loadGoldenSet(): GoldenEval[] {
    const raw = readFileSync(join(__dirname, '../data-sets/sdet_golden_set.json'), 'utf8');
    return JSON.parse(raw) as GoldenEval[];
}

export class GoldenSetValidator {
    private readonly skill: SdetReviewSkill;

    constructor() {
        this.skill = new SdetReviewSkill();
    }

    async runAll(): Promise<EvalResult[]> {
        const evals = loadGoldenSet();
        const results: EvalResult[] = [];

        for (const evalCase of evals) {
            process.stdout.write(`  Running ${evalCase.evalId}... `);
            const result = await this.runEval(evalCase);
            console.log(result.passed ? 'PASS' : `FAIL (${result.failures.length} issue(s))`);
            results.push(result);
        }

        return results;
    }

    private async runEval(evalCase: GoldenEval): Promise<EvalResult> {
        const failures: string[] = [];
        let output: TestPlan | undefined;

        try {
            output = await this.skill.generateReviewReport(
                evalCase.inputs.jiraId,
                evalCase.inputs.prUrl
            );
        } catch (err: any) {
            return {
                evalId: evalCase.evalId,
                description: evalCase.description,
                passed: false,
                failures: [`Skill threw: ${err.message}`]
            };
        }

        const outputStr = JSON.stringify(output).toLowerCase();

        for (const field of evalCase.assertions.expectedJsonFields) {
            if (!(field in output)) {
                failures.push(`Missing expected field: "${field}"`);
            }
        }

        for (const keyword of evalCase.assertions.mandatoryKeywordsInPlan) {
            if (!outputStr.includes(keyword.toLowerCase())) {
                failures.push(`Mandatory keyword not found in output: "${keyword}"`);
            }
        }

        for (const keyword of evalCase.assertions.forbiddenKeywords) {
            if (outputStr.includes(keyword.toLowerCase())) {
                failures.push(`Forbidden keyword found in output: "${keyword}"`);
            }
        }

        return {
            evalId: evalCase.evalId,
            description: evalCase.description,
            passed: failures.length === 0,
            failures,
            output
        };
    }
}

export async function runGoldenSetValidation(): Promise<void> {
    console.log('\n=== Golden Set Validation ===\n');
    const validator = new GoldenSetValidator();
    const results = await validator.runAll();

    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    console.log(`\nResults: ${passed}/${total} passed\n`);

    for (const result of results.filter(r => !r.passed)) {
        console.log(`FAIL ${result.evalId}: ${result.description}`);
        for (const f of result.failures) {
            console.log(`  - ${f}`);
        }
    }

    if (passed < total) {
        process.exit(1);
    }
}
