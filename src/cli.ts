// src/cli.ts
import { Command } from 'commander';
import { SdetAutomationSkill } from './SdetAutomationSkill';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
    .name('sdet-ai')
    .description('Herramienta CLI para generar estrategias de prueba y automatización con IA')
    .version('1.0.0')
    .requiredOption('-j, --jira <id>', 'ID del ticket de Jira (ej. QA-502)')
    .requiredOption('-p, --pr <url>', 'URL completa del Pull Request de GitHub')
    .action(async (options) => {
        const { jira, pr } = options;
        console.log(`\n🚀 Ejecutando SDET AI para Jira: ${jira} y PR: ${pr}`);

        try {
            const sdetAI = new SdetAutomationSkill();
            const resultado = await sdetAI.executeTestGenerationPipeline(jira, pr);

            // Crear carpeta de salida si no existe
            const outputDir = path.join(process.cwd(), 'ai-output');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            // Guardar archivos resultantes
            fs.writeFileSync(path.join(outputDir, `${jira}-plan.json`), resultado.testPlanJson, 'utf8');
            fs.writeFileSync(path.join(outputDir, `${jira}-tests.md`), resultado.automationCodeScripts, 'utf8');

            console.log(`\n✅ ¡Proceso completado con éxito!`);
            console.log(`📁 Resultados guardados en la carpeta: ./ai-output/`);
        } catch (error: any) {
            console.error(`\n❌ Error durante la ejecución:`, error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);
