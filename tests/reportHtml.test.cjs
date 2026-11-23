const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generatePdfHtml, getReportFilename } = require('../.test-build/services/reportHtml.js');
const { calculateDiagnosticResult } = require('../.test-build/services/calc.js');
const { allQuestions } = require('../.test-build/data/questions.js');

function fixture() {
  const answers = Object.fromEntries(allQuestions.map((q) => [q.id, 100]));
  return {
    ...calculateDiagnosticResult('Escola Verde', answers, allQuestions, 'Educação'),
    completedAt: '2026-11-23T12:00:00.000Z',
  };
}

test('relatório sem IA mantém nota, cinco pilares e recomendações', () => {
  const result = fixture();
  const html = generatePdfHtml(result);
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Escola Verde'));
  assert.ok(html.includes('Nível Sustentável'));
  assert.ok(html.includes('certificações internacionais'));
  assert.equal((html.match(/100\/100/g) || []).length, 5);
  assert.ok(!html.includes('undefined'));
});

test('nome, setor e recomendações com HTML são apresentados como texto', () => {
  const payload = '<script>alert("teste")</script>';
  const result = { ...fixture(), institutionName: `A & B ${payload}`, sector: payload, recommendations: [payload] };
  const html = generatePdfHtml(result);
  assert.ok(!html.includes(payload));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('A &amp; B &lt;script&gt;alert(&quot;teste&quot;)&lt;/script&gt;'));
  assert.equal((html.match(/&lt;script&gt;/g) || []).length, 4);
});

test('todos os textos da consultoria são escapados, preservando a marcação do template', () => {
  const payload = '<img src="x" onerror="alert(1)"> & \'teste\'';
  const result = fixture();
  result.aiConsultancy = {
    executiveSummary: payload,
    criticalPillarDiagnosis: payload,
    governanceTip: payload,
    sectorQuickWin: payload,
    generatedAt: result.completedAt,
    model: 'modelo-de-teste',
    initiatives: [{ title: payload, pillar: 'Energia', impact: 'Alto', effort: 'Baixo', description: payload, estimatedReturn: payload }],
  };
  const html = generatePdfHtml(result);
  assert.ok(!html.includes(payload));
  assert.ok(!html.includes('<img src="x"'));
  assert.equal((html.match(/&lt;img/g) || []).length, 7);
  assert.ok(html.includes('&#39;teste&#39;'));
  assert.ok(html.includes('<strong>Diretriz de Governança:</strong>'));
  assert.ok(html.includes('Plano Estratégico (IA Gemini)'));
});

test('nome de arquivo remove acentos e separadores de diretório', () => {
  assert.equal(getReportFilename({ ...fixture(), institutionName: 'São José / Unidade \\ A' }),
    'Relatorio-ESG-Sao-Jose-Unidade-A-2026-11-23.pdf');
  assert.equal(getReportFilename({ ...fixture(), institutionName: '///' }),
    'Relatorio-ESG-Diagnostico-2026-11-23.pdf');
});
