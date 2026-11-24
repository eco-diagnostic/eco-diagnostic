const { test } = require('node:test');
const assert = require('node:assert/strict');
const { findEvolution, organizationKey } = require('../.test-build/services/evolution.js');

const scores = (value, overrides = {}) => ({
  ENERGIA: value, AGUA: value, RESIDUOS: value, MATERIAIS: value, GESTAO: value, ...overrides,
});
const diagnostic = (id, institutionName, completedAt, overallScore, pillarScores = scores(overallScore)) => ({
  id, institutionName, completedAt, overallScore, pillarScores,
  maturityLevel: 'CRITICO', criticalPillar: 'ENERGIA', recommendations: [],
});

test('nome da organização ignora maiúsculas, acentos e espaços extras', () => {
  assert.equal(organizationKey('  Escola   Verde '), organizationKey('escola verde'));
  assert.equal(organizationKey('Associação Ação'), organizationKey('ASSOCIACAO acao'));
  assert.notEqual(organizationKey('Escola Verde'), organizationKey('Escola Azul'));
});

test('evolução compara apenas avaliações da mesma organização', () => {
  const history = [
    diagnostic('3', 'Escola Verde', '2026-11-20T10:00:00Z', 60),
    diagnostic('2', 'Mercado Central', '2026-11-19T10:00:00Z', 90),
    diagnostic('1', 'escola verde', '2026-11-01T10:00:00Z', 40),
  ];
  const evolution = findEvolution(history);
  assert.equal(evolution.latest.id, '3');
  assert.equal(evolution.previous.id, '1');
  assert.equal(evolution.scoreDiff, 20);
});

test('sem avaliação anterior da mesma organização, não há comparação', () => {
  assert.equal(findEvolution([]), null);
  assert.equal(findEvolution([diagnostic('1', 'Escola Verde', '2026-11-01T10:00:00Z', 50)]), null);
  assert.equal(findEvolution([
    diagnostic('2', 'Mercado Central', '2026-11-19T10:00:00Z', 90),
    diagnostic('1', 'Escola Verde', '2026-11-01T10:00:00Z', 40),
  ]), null);
});

test('usa a data de conclusão, mesmo se a lista vier fora de ordem', () => {
  const evolution = findEvolution([
    diagnostic('1', 'Escola Verde', '2026-11-01T10:00:00Z', 40),
    diagnostic('2', 'Escola Verde', '2026-11-20T10:00:00Z', 30),
  ]);
  assert.equal(evolution.latest.id, '2');
  assert.equal(evolution.scoreDiff, -10);
});

test('maior evolução aponta o pilar com maior ganho e ignora quedas', () => {
  const latest = diagnostic('2', 'Escola Verde', '2026-11-20T10:00:00Z', 50, scores(50, { AGUA: 80 }));
  const previous = diagnostic('1', 'Escola Verde', '2026-11-01T10:00:00Z', 50, scores(50, { AGUA: 45 }));
  const gain = findEvolution([latest, previous]);
  assert.equal(gain.bestGainPillar, 'AGUA');
  assert.equal(gain.bestGain, 35);

  const drop = findEvolution([
    diagnostic('2', 'Escola Verde', '2026-11-20T10:00:00Z', 30, scores(30)),
    diagnostic('1', 'Escola Verde', '2026-11-01T10:00:00Z', 50, scores(50)),
  ]);
  assert.equal(drop.bestGainPillar, null);
  assert.equal(drop.bestGain, 0);
});
