const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeAiConsultancy, isValidStoredAiConsultancy, AI_INVALID_FORMAT_MESSAGE,
} = require('../.test-build/services/aiValidation.js');
const { parseDiagnostics } = require('../.test-build/services/storageValidation.js');
const { calculateDiagnosticResult } = require('../.test-build/services/calc.js');
const { allQuestions } = require('../.test-build/data/questions.js');

const ctx = {
  criticalPillarName: 'Gestão Hídrica', sectorName: 'Educação',
  model: 'gemini-test', generatedAt: '2026-11-24T03:00:00.000Z',
};
const initiative = (overrides = {}) => ({
  title: 'Cisterna', pillar: 'Gestão Hídrica', impact: 'Alto', effort: 'Médio',
  description: 'Instalar cisterna.', estimatedReturn: 'Payback de 12 meses.', ...overrides,
});
const response = (overrides = {}) => ({
  executiveSummary: 'Resumo.', criticalPillarDiagnosis: 'Diagnóstico.', governanceTip: 'Comitê.',
  sectorContext: 'Contexto.', sectorQuickWin: 'Ação rápida.',
  initiatives: [initiative(), initiative({ title: 'LED' }), initiative({ title: 'Compostagem' })], ...overrides,
});

test('resposta completa da IA é aceita e mantém só 3 iniciativas', () => {
  const result = normalizeAiConsultancy(response({ initiatives: [1, 2, 3, 4].map((n) => initiative({ title: `I${n}` })) }), ctx);
  assert.deepEqual(result.initiatives.map((i) => i.title), ['I1', 'I2', 'I3']);
  assert.equal(result.model, 'gemini-test');
  assert.equal(isValidStoredAiConsultancy(result), true);
  assert.equal(isValidStoredAiConsultancy(JSON.parse(JSON.stringify(result))), true);
});

test('JSON válido com formato errado vira erro amigável, não erro técnico', () => {
  for (const parsed of [null, [], 'texto', 42, {}, response({ initiatives: 'lista' }), response({ initiatives: [] }),
    response({ initiatives: [null, 'x', { title: 'Sem descrição' }] })]) {
    assert.throws(() => normalizeAiConsultancy(parsed, ctx), { message: AI_INVALID_FORMAT_MESSAGE });
  }
});

test('iniciativas inválidas são descartadas e campos ausentes recebem texto padrão', () => {
  const result = normalizeAiConsultancy({
    initiatives: [null, initiative({ impact: 'Gigante', effort: 7, pillar: { nome: 'x' }, estimatedReturn: '' })],
    executiveSummary: { texto: 'objeto' },
  }, ctx);
  assert.equal(result.initiatives.length, 1);
  assert.equal(result.initiatives[0].impact, 'Alto');
  assert.equal(result.initiatives[0].effort, 'Médio');
  assert.equal(result.initiatives[0].pillar, 'Gestão Hídrica');
  assert.ok(!result.executiveSummary.includes('[object Object]'));
  assert.ok(result.executiveSummary.includes('Educação'));
  assert.equal(result.sectorContext, undefined);
});

test('consultoria salva corrompida é removida, mas o diagnóstico continua no histórico', () => {
  const diagnostic = {
    ...calculateDiagnosticResult('Escola Verde',
      Object.fromEntries(allQuestions.map((q) => [q.id, q.options[0].score])), allQuestions, 'Educação'),
    id: 'com-ia-quebrada',
    aiConsultancy: { executiveSummary: 'Resumo', initiatives: 'não é lista' },
  };
  const { valid } = parseDiagnostics([diagnostic]);
  assert.equal(valid.length, 1);
  assert.equal(valid[0].id, 'com-ia-quebrada');
  assert.equal('aiConsultancy' in valid[0], false);
});
