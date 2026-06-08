const testPlanObj = await reviewSkill.generateReviewReport(options.jira, options.pr);
// Como ya viene validado por Zod, guardarlo es seguro:
fs.writeFileSync(outputPath, JSON.stringify(testPlanObj, null, 2), 'utf8');
