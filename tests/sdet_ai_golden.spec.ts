it('Debería validar la estructura del contrato usando Zod', async () => {
    const outputObj = await sdetSkill.generateReviewReport(jiraId, prUrl);

    // Si la función no arrojó error, significa que Zod validó con éxito
    // la presencia de summary, test_cases, risk_analysis, tipos de datos y Enums.
    expect(outputObj).toBeDefined();
    expect(outputObj.test_cases.length).toBeGreaterThan(0);
});
