import { Command } from 'commander';
import { SdetAutomationSkill } from './SdetAutomationSkill';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();
program
    .requiredOption('-f, --file <path>', 'Ruta del archivo JSON de reporte generado por el Skill 1')
    .action(async (options) => {
        try {
            // Validar si el archivo existe antes de llamar a la IA
            if (!fs.existsSync(options.file)) {
                throw new Error(`El archivo especificado no existe: ${options.file}`);
            }

            // LEER el reporte generado por el Skill 1
            const jsonTestPlan = fs.readFileSync(options.file, 'utf8');

            const automationSkill = new SdetAutomationSkill();
            console.log(`[Automation] Leyendo reporte e iniciando generación de código Playwright...`);

            const codeOutput = await automationSkill.generatePlaywrightTests(jsonTestPlan);

            // Guardar el código final en un archivo markdown o .spec.ts
            const baseName = path.basename(options.file, '.json');
            const outputPath = path.join(process.cwd(), `${baseName}-spec.md`);
            fs.writeFileSync(outputPath, codeOutput, 'utf8');

            console.log(`✅ Scripts de Playwright guardados con éxito en: ${outputPath}`);
        } catch (error: any) {
            console.error('❌ Error en Skill de Automation:', error.message);
        }
    });

program.parse(process.argv);
