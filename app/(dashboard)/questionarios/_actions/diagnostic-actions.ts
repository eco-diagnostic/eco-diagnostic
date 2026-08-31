"use server";

import { prisma } from "@/app/_lib/prisma";
import { Pillar, MaturityLevel, DiagnosticStatus, InstitutionSize } from "@prisma/client";


export interface QuestionWithOptions {
  id: string;
  pillar: Pillar;
  title: string;
  description: string | null;
  weight: number;
  options: {
    id: string;
    text: string;
    score: number;
    order: number;
    allowsCustomText: boolean;
  }[];
}

/**
 * Sorteia aleatoriamente 4 perguntas ativas para cada um dos 5 pilares (Total: 20 perguntas)
 */
export async function getDiagnosticQuestionsAction(): Promise<QuestionWithOptions[]> {
  const pillars = [
    Pillar.ENERGIA,
    Pillar.AGUA,
    Pillar.RESIDUOS,
    Pillar.MATERIAIS,
    Pillar.GESTAO,
  ];

  const selectedQuestions: QuestionWithOptions[] = [];

  for (const pillar of pillars) {
    // Busca todas as perguntas ativas deste pilar com suas opções
    const questionsInPillar = await prisma.question.findMany({
      where: {
        pillar,
        isActive: true,
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Embaralha aleatoriamente as perguntas do pilar
    const shuffled = [...questionsInPillar].sort(() => 0.5 - Math.random());
    
    // Seleciona até 4 perguntas
    const picked = shuffled.slice(0, 4);

    selectedQuestions.push(...picked);
  }

  return selectedQuestions;
}

/**
 * Garante ou busca a Instituição vinculada ao usuário
 */
export async function getOrCreateInstitutionAction(userId: string = "user_default") {
  let institution = await prisma.institution.findUnique({
    where: { userId },
  });

  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        userId,
        name: "Minha Instituição",
        sector: "Educação / Corporativo",
        city: "São Paulo",
        state: "SP",
        size: InstitutionSize.PEQUENA,
        description: "Instituição avaliada pelo Eco Diagnóstico",
      },
    });
  }

  return institution;
}

export interface SubmitDiagnosticAnswerInput {
  questionId: string;
  selectedOptionId?: string;
  customText?: string;
}

export interface SubmitDiagnosticPayload {
  userId?: string;
  institutionId?: string;
  answers: SubmitDiagnosticAnswerInput[];
}

/**
 * Submete as 20 respostas, calcula as notas dos 5 pilares, nível de maturidade e ponto crítico
 */
export async function submitDiagnosticAction(payload: SubmitDiagnosticPayload) {
  const userId = payload.userId || "user_default";
  
  // Garante a instituição
  let institutionId = payload.institutionId;
  if (!institutionId) {
    const inst = await getOrCreateInstitutionAction(userId);
    institutionId = inst.id;
  }

  // Busca todas as perguntas e opções submetidas para conferir e calcular notas reais no backend
  const questionIds = payload.answers.map((a) => a.questionId);
  const questionsFromDb = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { options: true },
  });

  const questionMap = new Map(questionsFromDb.map((q) => [q.id, q]));

  // Agrupamento por pilar para cálculo das médias ponderadas
  const pillarScoresMap: Record<Pillar, { totalPoints: number; count: number }> = {
    [Pillar.ENERGIA]: { totalPoints: 0, count: 0 },
    [Pillar.AGUA]: { totalPoints: 0, count: 0 },
    [Pillar.RESIDUOS]: { totalPoints: 0, count: 0 },
    [Pillar.MATERIAIS]: { totalPoints: 0, count: 0 },
    [Pillar.GESTAO]: { totalPoints: 0, count: 0 },
  };

  const processedAnswers: {
    questionId: string;
    pillar: Pillar;
    selectedOptionId?: string;
    customText?: string;
    scoreObtained: number;
  }[] = [];

  for (const item of payload.answers) {
    const question = questionMap.get(item.questionId);
    if (!question) continue;

    let scoreObtained = 0;
    if (item.selectedOptionId) {
      const option = question.options.find((o) => o.id === item.selectedOptionId);
      if (option) {
        scoreObtained = option.score;
      }
    }

    processedAnswers.push({
      questionId: question.id,
      pillar: question.pillar,
      selectedOptionId: item.selectedOptionId,
      customText: item.customText,
      scoreObtained,
    });

    pillarScoresMap[question.pillar].totalPoints += scoreObtained;
    pillarScoresMap[question.pillar].count += 1;
  }

  // Calcula o score consolidado de cada um dos 5 pilares
  const pillarResults: { pillar: Pillar; score: number; count: number }[] = [];
  let lowestPillar: Pillar = Pillar.ENERGIA;
  let lowestScore = 999;

  for (const pillar of Object.keys(pillarScoresMap) as Pillar[]) {
    const data = pillarScoresMap[pillar];
    const score = data.count > 0 ? Math.round(data.totalPoints / data.count) : 0;
    pillarResults.push({
      pillar,
      score,
      count: data.count,
    });

    if (score < lowestScore) {
      lowestScore = score;
      lowestPillar = pillar;
    }
  }

  // Calcula a média geral (Overall Score)
  const totalPillarsScore = pillarResults.reduce((acc, curr) => acc + curr.score, 0);
  const overallScore = Math.round(totalPillarsScore / (pillarResults.length || 1));

  // Define o nível de maturidade
  let maturityLevel: MaturityLevel = MaturityLevel.EM_DESENVOLVIMENTO;
  if (overallScore < 40) {
    maturityLevel = MaturityLevel.CRITICO;
  } else if (overallScore < 70) {
    maturityLevel = MaturityLevel.EM_DESENVOLVIMENTO;
  } else if (overallScore < 90) {
    maturityLevel = MaturityLevel.AVANCADO;
  } else {
    maturityLevel = MaturityLevel.SUSTENTAVEL;
  }

  // Grava o Diagnóstico e suas dependências em transação atômica
  const createdDiagnostic = await prisma.$transaction(async (tx) => {
    const diag = await tx.diagnostic.create({
      data: {
        institutionId,
        userId,
        status: DiagnosticStatus.CONCLUIDO,
        overallScore,
        maturityLevel,
        criticalPillar: lowestPillar,
        totalQuestions: processedAnswers.length,
        answeredCount: processedAnswers.length,
        completedAt: new Date(),
        answers: {
          create: processedAnswers.map((ans) => ({
            questionId: ans.questionId,
            pillar: ans.pillar,
            selectedOptionId: ans.selectedOptionId,
            customText: ans.customText,
            scoreObtained: ans.scoreObtained,
          })),
        },
        pillarScores: {
          create: pillarResults.map((p) => ({
            pillar: p.pillar,
            score: p.score,
            questionsCount: p.count,
          })),
        },
      },
    });

    return diag;
  });

  return {
    success: true,
    diagnosticId: createdDiagnostic.id,
    overallScore,
    criticalPillar: lowestPillar,
    maturityLevel,
  };
}
