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

  const recommendations = generateRecommendations(
    criticalPillar,
    lowestScore,
    answers,
    questions,
    overallScore
  );

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

const QUESTION_RECOMMENDATIONS: Record<string, string> = {
  en_1: "Implantar sistema de telemetria ou medição mensal setorizada em kWh com metas claras de redução.",
  en_2: "Completar a migração para iluminação 100% LED e instalar sensores de presença automáticos em áreas comuns.",
  en_3: "Realizar estudo de viabilidade para geração solar fotovoltaica própria ou migração para o Mercado Livre de Energia Renovável.",
  en_4: "Estabelecer política mandatória de 'Standby Zero' e rotina de desligamento automático de computadores e aparelhos.",
  ag_1: "Monitorar hidrômetros periodicamente por setor e criar alarmes rápidos contra picos atípicos e vazamentos.",
  ag_2: "Instalar aeradores de vazão em todas as torneiras e bacias sanitárias com caixas de acionamento duplo (3L/6L).",
  ag_3: "Projetar cisterna de captação de água pluvial para uso em descargas sanitárias, jardinagem e lavagem externa.",
  ag_4: "Criar Procedimento Operacional Padrão (POP) com ronda preventiva semanal para sanar vazamentos em até 24 horas.",
  res_1: "Estruturar lixeiras seletivas completas e bem identificadas em todas as salas e setores operacionais.",
  res_2: "Firmar parceria formal com cooperativas de catadores locais e exigir Manifesto de Transporte de Resíduos (MTR).",
  res_3: "Implantar composteira ou minhocário para tratar os resíduos orgânicos das copas e podas de jardim internamente.",
  res_4: "Estruturar ponto formal de descarte ecológico para pilhas, baterias e lixo eletrônico (e-waste) via logística reversa.",
  mat_1: "Eliminar 100% dos copos e utensílios plásticos descartáveis, fornecendo canecas e garrafas duráveis à equipe.",
  mat_2: "Acelerar o programa de digitalização de documentos e assinaturas eletrônicas rumo ao escritório 100% Paperless.",
  mat_3: "Adotar Política formal de Compras Verdes com auditoria periódica e exigência de selos ecológicos aos fornecedores.",
  mat_4: "Substituir 100% da linha de limpeza predial por produtos concentrados biodegradáveis com certificação verde.",
  ges_1: "Redigir, aprovar pela diretoria e publicar formalmente a Política Institucional de Sustentabilidade da organização.",
  ges_2: "Instituir comitê ou responsável formal dedicado ao monitoramento das metas e boas práticas ESG com reporte à diretoria.",
  ges_3: "Criar calendário semestral de capacitação ambiental e integrar módulo de sustentabilidade na admissão de colaboradores.",
  ges_4: "Definir metas quantitativas com indicadores numéricos para redução contínua de água, energia, carbono e resíduos.",
};

function generateRecommendations(
  criticalPillar: Pillar,
  score: number,
  answers: Record<string, number>,
  questions: Question[],
  overallScore: number
): string[] {
  // Se a organização já tem pontuação altíssima (>= 90), sugerir metas de liderança e certificações
  if (overallScore >= 90) {
    return [
      "Buscar certificações internacionais de liderança em sustentabilidade (ISO 14001, Selo Carbono Neutro ou LEED).",
      "Elaborar e publicar o Relatório Anual de Sustentabilidade nos padrões globais da Global Reporting Initiative (GRI).",
      "Inventariar emissões de Gases de Efeito Estufa (GEE) nos Escopos 1, 2 e 3 através do programa GHG Protocol.",
      "Compartilhar as boas práticas desenvolvidas em fóruns setoriais e programas de extensão universitária.",
    ];
  }

  // Identifica questões que tiveram pontuação crítica (menor que 70)
  const weakQuestions: { id: string; score: number; pillar: Pillar }[] = [];

  questions.forEach((q) => {
    const qScore = answers[q.id] ?? 0;
    if (qScore < 70) {
      weakQuestions.push({ id: q.id, score: qScore, pillar: q.pillar });
    }
  });

  // Ordena dando prioridade primeiro para o pilar crítico, depois para as menores notas
  weakQuestions.sort((a, b) => {
    if (a.pillar === criticalPillar && b.pillar !== criticalPillar) return -1;
    if (b.pillar === criticalPillar && a.pillar !== criticalPillar) return 1;
    return a.score - b.score;
  });

  const selectedRecs: string[] = [];

  for (const item of weakQuestions) {
    const recText = QUESTION_RECOMMENDATIONS[item.id];
    if (recText && !selectedRecs.includes(recText)) {
      selectedRecs.push(recText);
    }
    if (selectedRecs.length >= 5) break;
  }

  // Fallback caso não haja recomendações suficientes
  if (selectedRecs.length < 3) {
    const defaultFallbacks = [
      "Manter rotina periódica de auditoria interna dos indicadores de água, energia e resíduos.",
      "Engajar a liderança e os colaboradores em campanhas contínuas de conscientização ambiental.",
      "Revisar semestralmente as metas de sustentabilidade da organização.",
    ];
    for (const fb of defaultFallbacks) {
      if (!selectedRecs.includes(fb) && selectedRecs.length < 4) {
        selectedRecs.push(fb);
      }
    }
  }

  return selectedRecs;
}
