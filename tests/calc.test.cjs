const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateDiagnosticResult } = require('../.test-build/services/calc.js');
const { allQuestions } = require('../.test-build/data/questions.js');
const { Pillar } = require('../.test-build/types/index.js');

const answersFor = (optionIndex) => Object.fromEntries(
  allQuestions.map((question) => [question.id, question.options[optionIndex].score])
);
const calculate = (answers, questions = allQuestions) =>
  calculateDiagnosticResult(' Escola Verde ', answers, questions, ' Educação ');

test('20 perguntas, IDs únicos e quatro perguntas por pilar', () => {
  assert.equal(allQuestions.length, 20);
  assert.equal(new Set(allQuestions.map((q) => q.id)).size, 20);
  for (const pillar of Object.values(Pillar)) {
    assert.equal(allQuestions.filter((q) => q.pillar === pillar).length, 4);
  }
});

test('notas extremas preservam zero e cem em todos os pilares', () => {
  for (const [option, score, level] of [[0, 0, 'CRITICO'], [3, 100, 'SUSTENTAVEL']]) {
    const result = calculate(answersFor(option));
    assert.equal(result.overallScore, score);
    assert.equal(result.maturityLevel, level);
    assert.deepEqual(Object.values(result.pillarScores), Array(5).fill(score));
    assert.equal(result.institutionName, 'Escola Verde');
    assert.equal(result.sector, 'Educação');
  }
});

test('limites de classificação: 39/40, 69/70 e 89/90', () => {
  for (const [score, level] of [[39, 'CRITICO'], [40, 'EM_DESENVOLVIMENTO'],
    [69, 'EM_DESENVOLVIMENTO'], [70, 'AVANCADO'], [89, 'AVANCADO'], [90, 'SUSTENTAVEL']]) {
    const questions = allQuestions.map((q) => ({ ...q, options: [{ id: `${q.id}_test`, text: 'Teste', order: 1, score }] }));
    const answers = Object.fromEntries(questions.map((q) => [q.id, score]));
    assert.equal(calculate(answers, questions).maturityLevel, level);
  }
});

test('ponderação por questão e média com o mesmo peso para cada pilar', () => {
  const answers = answersFor(0);
  answers.en_3 = 100; // peso 1,2; demais pesos do pilar somam 3
  const result = calculate(answers);
  assert.equal(result.pillarScores.ENERGIA, 29);
  assert.equal(result.overallScore, 6);
  assert.equal(result.criticalPillar, Pillar.AGUA);
});

test('pilar crítico e recomendações priorizam a dimensão de menor nota', () => {
  const answers = answersFor(3);
  for (const q of allQuestions.filter((q) => q.pillar === Pillar.AGUA)) answers[q.id] = 0;
  const result = calculate(answers);
  assert.equal(result.overallScore, 80);
  assert.equal(result.criticalPillar, Pillar.AGUA);
  assert.match(result.recommendations[0], /hidrômetros/);
  assert.equal(new Set(result.recommendations).size, result.recommendations.length);
});

test('liderança sustentável recebe recomendações próprias', () => {
  assert.match(calculate(answersFor(3)).recommendations[0], /certificações/);
});

test('respostas ausentes, não numéricas ou fora das alternativas são rejeitadas', () => {
  for (const score of [undefined, null, '0', NaN, Infinity, -1, 101, 42]) {
    assert.throws(() => calculate({ ...answersFor(0), en_1: score }), /Responda novamente/);
  }
  const missing = answersFor(0);
  delete missing.en_1;
  assert.throws(() => calculate(missing), /Responda novamente/);
  assert.throws(() => calculate(Object.create(answersFor(0))), /Responda novamente/);
});

test('questionário vazio, pilar ausente, IDs duplicados e pesos inválidos são rejeitados', () => {
  assert.throws(() => calculate({}, []), /cinco pilares/);
  assert.throws(() => calculate(answersFor(0), allQuestions.filter((q) => q.pillar !== Pillar.GESTAO)), /cinco pilares/);
  assert.throws(() => calculate(answersFor(0), [...allQuestions, allQuestions[0]]), /duplicada/);
  for (const weight of [0, -1, NaN, Infinity]) {
    assert.throws(() => calculate(answersFor(0), allQuestions.map((q, i) => i === 0 ? { ...q, weight } : q)), /Configuração inválida/);
  }
});
