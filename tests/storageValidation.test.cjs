const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  safeParse, isValidDiagnostic, parseDiagnostics, parseInstitution, parseQuizDraft,
} = require('../.test-build/services/storageValidation.js');
const { calculateDiagnosticResult } = require('../.test-build/services/calc.js');
const { allQuestions } = require('../.test-build/data/questions.js');

const realDiagnostic = (id = 'd1') => ({
  ...calculateDiagnosticResult(
    'Escola Verde',
    Object.fromEntries(allQuestions.map((q) => [q.id, q.options[1].score])),
    allQuestions,
    'Educação'
  ),
  id,
});

test('JSON corrompido ou ausente não lança erro', () => {
  assert.equal(safeParse('{quebrado'), undefined);
  assert.equal(safeParse(null), undefined);
  assert.deepEqual(safeParse('[1,2]'), [1, 2]);
});

test('diagnóstico gerado pelo app passa na validação, inclusive após salvar e ler', () => {
  const diagnostic = realDiagnostic();
  assert.equal(isValidDiagnostic(diagnostic), true);
  assert.equal(isValidDiagnostic(JSON.parse(JSON.stringify(diagnostic))), true);
});

test('diagnósticos com campos faltando ou fora do formato são rejeitados', () => {
  const base = realDiagnostic();
  const broken = [
    null,
    'texto',
    { ...base, id: '' },
    { ...base, overallScore: 150 },
    { ...base, overallScore: '80' },
    { ...base, maturityLevel: 'OTIMO' },
    { ...base, criticalPillar: 'TRANSPORTE' },
    { ...base, completedAt: 'ontem' },
    { ...base, pillarScores: { ...base.pillarScores, AGUA: undefined } },
    { ...base, recommendations: 'fazer coleta seletiva' },
    { ...base, aiConsultancy: 'texto solto' },
  ];
  for (const item of broken) assert.equal(isValidDiagnostic(item), false);
});

test('histórico mantém registros válidos, descarta inválidos e ids repetidos', () => {
  const result = parseDiagnostics([realDiagnostic('a'), { lixo: true }, realDiagnostic('b'), realDiagnostic('a')]);
  assert.deepEqual(result.valid.map((d) => d.id), ['a', 'b']);
  assert.equal(result.discarded, 2);
  assert.equal(parseDiagnostics({ nao: 'é lista' }), null);
  assert.equal(parseDiagnostics(undefined), null);
});

test('instituição exige os quatro campos de texto', () => {
  const info = { name: 'Escola Verde', sector: 'Educação', city: 'Caraguatatuba', state: 'SP' };
  assert.deepEqual(parseInstitution(info), info);
  assert.equal(parseInstitution({ ...info, city: 12 }), null);
  assert.equal(parseInstitution([]), null);
});

test('rascunho inválido é rejeitado; válido é preservado', () => {
  const draft = {
    institutionName: 'Escola Verde', sector: 'Educação', currentIndex: 3,
    answers: { en_1: 0, en_2: 66 }, updatedAt: '2026-11-23T10:00:00.000Z',
  };
  assert.deepEqual(parseQuizDraft(draft), draft);
  assert.equal(parseQuizDraft({ ...draft, currentIndex: -1 }), null);
  assert.equal(parseQuizDraft({ ...draft, currentIndex: 1.5 }), null);
  assert.equal(parseQuizDraft({ ...draft, answers: { en_1: 'sim' } }), null);
  assert.equal(parseQuizDraft({ ...draft, institutionName: '  ' }), null);
  assert.equal(parseQuizDraft({ ...draft, updatedAt: undefined }), null);
});
