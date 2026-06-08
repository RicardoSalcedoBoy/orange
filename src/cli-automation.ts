import { Command } from 'commander';
import { SdetAutomationSkill } from '../skills/SdetAutomationSkill.ts';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

const program = new Command();

program
    .name('sdet-automation')
    .description('Generate Playwright scripts from a JSON test plan produced by sdet-review')
    .version('1.0.0')
    .requiredOption('-f, --file <path>', 'Path to the JSON test plan (e.g. ai-output/QA-502-plan.json)')
    .action(async (options) => {
        const { file } = options as { file: string };

        if (!existsSync(file)) {
            console.error(`File not found: ${file}`);
            process.exit(1);
        }

        try {
            const jsonTestPlan = readFileSync(file, 'utf8');
            const skill = new SdetAutomationSkill();

            console.log(`\n[Automation] Generating Playwright scripts from: ${file}`);
            const code = await skill.generatePlaywrightTests(jsonTestPlan);

            const baseName = basename(file, '.json');
            const outputPath = join(process.cwd(), 'ai-output', `${baseName}-tests.ts`);
            writeFileSync(outputPath, code, 'utf8');

            console.log(`\nPlaywright scripts saved to: ${outputPath}`);
        } catch (err: any) {
            console.error(`\nError: ${err.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);
