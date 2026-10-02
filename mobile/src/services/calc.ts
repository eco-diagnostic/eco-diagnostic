import { Pillar, MaturityLevel, DiagnosticResult, Question } from "../types";
import { PILLAR_NAMES } from "../data/questions";

export function calculateDiagnosticResult(
  institutionName: string,
  answers: Record<string, number>, // questionId -> optionScore
  questions: Question[]
): DiagnosticResult {
  const pillarTotals: Record<Pillar, { weightedScoreSum: number; weightSum: number }> = {
    [Pillar.ENERGIA]: { weightedScoreSum: 0, weightSum: 0 },
    [Pillar.AGUA]: { weightedScoreSum: 0, weightSum: 0 },
    [Pillar.RESIDUOS]: { weightedScoreSum: 0, weightSum: 0 },
    [Pillar.MATERIAIS]: { weightedScoreSum: 0, weightSum: 0 },
    [Pillar.GESTAO]: { weightedScoreSum: 0, weightSum: 0 },
  };

  questions.forEach((q) => {
    const score = answers[q.id] ?? 0;
    const weight = q.weight || 1.0;
    pillarTotals[q.pillar].weightedScoreSum += score * weight;
    pillarTotals[q.pillar].weightSum += weight;
  });

  const pillarScores: Record<Pillar, number> = {
    [Pillar.ENERGIA]: 0,
    [Pillar.AGUA]: 0,
    [Pillar.RESIDUOS]: 0,
    [Pillar.MATERIAIS]: 0,
    [Pillar.GESTAO]: 0,
  };

  let criticalPillar: Pillar = Pillar.ENERGIA;
  let lowestScore = 101;
  let totalScoreSum = 0;

  (Object.keys(pillarTotals) as Pillar[]).forEach((p) => {
    const data = pillarTotals[p];
    const avg = data.weightSum > 0 ? Math.round(data.weightedScoreSum / data.weightSum) : 0;
    pillarScores[p] = avg;
    totalScoreSum += avg;

    if (avg < lowestScore) {
      lowestScore = avg;
      criticalPillar = p;
    }
  });

  const overallScore = Math.round(totalScoreSum / 5);

  let maturityLevel: MaturityLevel = "CRITICO";
  if (overallScore >= 90) {
    maturityLevel = "SUSTENTAVEL";
  } else if (overallScore >= 70) {
    maturityLevel = "AVANCADO";
  } else if (overallScore >= 40) {
    maturityLevel = "EM_DESENVOLVIMENTO";
  } else {
    maturityLevel = "CRITICO";
  }

  const recommendations = generateRecommendations(criticalPillar, lowestScore);

  return {
    id: `diag_${Date.now()}`,
    institutionName: institutionName || "Instituição / Empresa",
    completedAt: new Date().toISOString(),
    overallScore,
    maturityLevel,
    criticalPillar,
    pillarScores,
    recommendations,
  };
}

function generateRecommendations(criticalPillar: Pillar, score: number): string[] {
  const map: Record<Pillar, string[]> = {
    [Pillar.ENERGIA]: [
      "Substituição imediata de lâmpadas convencionais restantes por LED com sensores de presença.",
      "Criar uma rotina de checagem ao fim do expediente para desligamento de computadores e aparelhos em standby.",
      "Realizar estudo de viabilidade para instalação de energia solar fotovoltaica ou migração para o mercado livre renovável.",
    ],
    [Pillar.AGUA]: [
      "Instalar aeradores de vazão em torneiras e válvulas de descarga com duplo acionamento (3L/6L).",
      "Implantar ronda preventiva semanal contra vazamentos em sanitários e tubulações.",
      "Avaliar a implantação de cisterna para captação de água pluvial destinada à limpeza externa e jardins.",
    ],
    [Pillar.RESIDUOS]: [
      "Estruturar estações de coleta seletiva bem identificadas em todos os setores da instituição.",
      "Firmar parceria formal com cooperativas de catadores locais para destinação rastreada dos recicláveis.",
      "Iniciar programa de compostagem ou minhocário para os resíduos orgânicos das copas e podas de jardim.",
    ],
    [Pillar.MATERIAIS]: [
      "Eliminar 100% dos copos e utensílios plásticos descartáveis, fornecendo canecas duráveis à equipe.",
      "Avançar no processo de digitalização de documentos e assinaturas eletrônicas rumo ao escritório Paperless.",
      "Estabelecer critérios socioambientais e selos verdes nas compras e contratação de fornecedores.",
    ],
    [Pillar.GESTAO]: [
      "Redigir e aprovar formalmente uma Política de Sustentabilidade Institucional com metas públicas.",
      "Designar um comitê interno ou responsável formal com reuniões mensais de monitoramento ESG.",
      "Realizar treinamentos periódicos de capacitação e conscientização ecológica para todos os colaboradores.",
    ],
  };

  return map[criticalPillar] || [
    "Monitorar continuamente os indicadores de consumo.",
    "Engajar colaboradores em campanhas internas de redução de impacto.",
  ];
}
