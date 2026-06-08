import { Command } from 'commander';
import { SdetReviewSkill } from '../skills/SdetReviewSkill.ts';
import { SdetAutomationSkill } from '../skills/SdetAutomationSkill.ts';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
    .name('sdet-ai')
    .description('End-to-end pipeline: Jira + PR → test plan → Playwright scripts')
    .version('1.0.0')
    .requiredOption('-j, --jira <id>', 'Jira ticket ID (e.g. QA-502)')
    .requiredOption('-p, --pr <url>', 'GitHub Pull Request URL')
    .action(async (options) => {
        const { jira, pr } = options as { jira: string; pr: string };
        console.log(`\nRunning SDET AI pipeline for Jira: ${jira} | PR: ${pr}`);

        try {
            const reviewSkill = new SdetReviewSkill();
            const automationSkill = new SdetAutomationSkill();

            console.log('\n[1/2] Generating test plan from Jira + PR...');
            const testPlan = await reviewSkill.generateReviewReport(jira, pr);
            const testPlanJson = JSON.stringify(testPlan, null, 2);

            console.log('\n[2/2] Generating Playwright scripts from test plan...');
            const playwrightCode = await automationSkill.generatePlaywrightTests(testPlanJson);

            const outputDir = join(process.cwd(), 'ai-output');
            if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

            writeFileSync(join(outputDir, `${jira}-plan.json`), testPlanJson, 'utf8');
            writeFileSync(join(outputDir, `${jira}-tests.ts`), playwrightCode, 'utf8');

            console.log(`\nDone. Results saved to ./ai-output/`);
            console.log(`  ${jira}-plan.json`);
            console.log(`  ${jira}-tests.ts`);
        } catch (err: any) {
            console.error(`\nError: ${err.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);
