import { Command } from 'commander';
import { SdetReviewSkill } from '../skills/SdetReviewSkill.ts';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
    .name('sdet-review')
    .description('Generate a structured JSON test plan from a Jira ticket and GitHub PR')
    .version('1.0.0')
    .requiredOption('-j, --jira <id>', 'Jira ticket ID (e.g. QA-502)')
    .requiredOption('-p, --pr <url>', 'GitHub Pull Request URL')
    .action(async (options) => {
        const { jira, pr } = options as { jira: string; pr: string };
        console.log(`\n[Review] Generating test plan for Jira: ${jira} | PR: ${pr}`);

        try {
            const skill = new SdetReviewSkill();
            const testPlan = await skill.generateReviewReport(jira, pr);

            const outputDir = join(process.cwd(), 'ai-output');
            if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

            const outputPath = join(outputDir, `${jira}-plan.json`);
            writeFileSync(outputPath, JSON.stringify(testPlan, null, 2), 'utf8');

            console.log(`\nTest plan saved to: ${outputPath}`);
            console.log(`Test cases generated: ${testPlan.test_cases.length}`);
            console.log(`Tools required: ${testPlan.tools_required.join(', ')}`);
        } catch (err: any) {
            console.error(`\nError: ${err.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);
