"use server";

import { prisma } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { GoogleGenAI } from "@google/genai";
import { Pillar } from "@prisma/client";
import { generateAiReportSchema, GenerateAiReportSchema } from "./schema";

const pillarLabels: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "Energia",
  [Pillar.AGUA]: "Água",
  [Pillar.RESIDUOS]: "Resíduos",
  [Pillar.MATERIAIS]: "Materiais",
  [Pillar.GESTAO]: "Gestão",
};

export interface AiReportResponse {
  content: string;
  summary?: string | null;
  fromCache: boolean;
  createdAt?: Date;
}

/**
 * Busca o plano de ação já salvo no banco para o diagnóstico informado
 */
export async function getActionPlanAction(
  diagnosticId: string,
): Promise<AiReportResponse | null> {
  const existing = await prisma.actionPlan.findUnique({
    where: { diagnosticId },
  });

  if (!existing) return null;

  return {
    content: existing.content,
    summary: existing.summary,
    fromCache: true,
    createdAt: existing.createdAt,
  };
}

/**
 * Gera ou recupera o relatório com IA do diagnóstico específico (salvando no banco de dados para evitar reprocessamento)
 * Também suporta de forma escalável a análise dos últimos 30 dias / mensal.
 */
export const generateAiReport = async (
  input: GenerateAiReportSchema,
): Promise<AiReportResponse> => {
  const { diagnosticId, month, forceRegenerate } =
    generateAiReportSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Não autorizado. Faça login para continuar.");
  }

  // =========================================================================
  // CASO 1: Relatório de um Diagnóstico Específico (Individual)
  // =========================================================================
  if (diagnosticId) {
    // 1. Se não for regeneração forçada, verifica se já existe no banco de dados
    if (!forceRegenerate) {
      const existingPlan = await prisma.actionPlan.findUnique({
        where: { diagnosticId },
      });

      if (existingPlan) {
        return {
          content: existingPlan.content,
          summary: existingPlan.summary,
          fromCache: true,
          createdAt: existingPlan.createdAt,
        };
      }
    }

    // 2. Busca os dados completos do diagnóstico, instituição, notas dos pilares e respostas
    const diagnostic = await prisma.diagnostic.findUnique({
      where: { id: diagnosticId },
      include: {
        institution: true,
        pillarScores: true,
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    if (!diagnostic || diagnostic.userId !== userId) {
      throw new Error("Diagnóstico não encontrado ou não autorizado.");
    }

    const pillarScoresText = diagnostic.pillarScores
      .map(
        (ps) =>
          `- ${pillarLabels[ps.pillar] || ps.pillar}: ${Math.round(ps.score)}/100`,
      )
      .join("\n");

    const answersDetailText = diagnostic.answers
      .map((ans) => {
        const pillarName = pillarLabels[ans.pillar] || ans.pillar;
        const optText =
          ans.selectedOption?.text || ans.customText || "Opção selecionada";
        const score = Math.round(ans.scoreObtained);
        return `• [${pillarName}] ${ans.question.title} -> Resposta: "${optText}" (Nota: ${score}/100)`;
      })
      .join("\n");

    const criticalPillarName = diagnostic.criticalPillar
      ? pillarLabels[diagnostic.criticalPillar]
      : "Não especificado";

    const prompt = `Você é um consultor sênior especialista em sustentabilidade corporativa e ESG.
Analise detalhadamente os resultados do Eco-Diagnóstico da instituição abaixo e elabore um relatório técnico e altamente acionável.

--- DADOS DA INSTITUIÇÃO ---
- Nome: ${diagnostic.institution?.name || "Instituição"}
- Setor: ${diagnostic.institution?.sector || "Geral"}
- Porte: ${diagnostic.institution?.size || "Pequeno/Médio"}
- Cidade/UF: ${diagnostic.institution?.city || ""}/${diagnostic.institution?.state || ""}

--- RESULTADOS DO DIAGNÓSTICO ---
- Pontuação Geral (Índice de Sustentabilidade): ${Math.round(diagnostic.overallScore || 0)} / 100
- Nível de Maturidade: ${diagnostic.maturityLevel || "EM_DESENVOLVIMENTO"}
- Principal Pilar Crítico: ${criticalPillarName}

--- NOTAS POR PILAR (0 a 100) ---
${pillarScoresText}

--- RESPOSTAS DETALHADAS ---
${answersDetailText}

--- INSTRUÇÕES DE FORMATAÇÃO ---
Estruture a resposta EXATAMENTE com as 3 seções em formato Markdown abaixo, usando títulos bem destacados, listas e tópicos claros:

# 📋 Descrição do Diagnóstico
(Apresente uma análise executiva abrangente da instituição, contextualizando seu estágio de sustentabilidade com base na pontuação geral de ${Math.round(diagnostic.overallScore || 0)}/100 e nas respostas fornecidas.)

# ⚠️ Pontos de Atenção
(Destaque os gargalos mais urgentes e vulnerabilidades operacionais identificadas, com ênfase especial no pilar crítico "${criticalPillarName}" e nas respostas com menor pontuação.)

# 🎯 Plano Estratégico de Ação
(Apresente um plano prático e realista com ações divididas em 3 horizontes temporais):
- **Curto Prazo (0 a 3 meses):** Ações rápidas (quick wins), de baixo custo e implementação imediata.
- **Médio Prazo (3 a 6 meses):** Ajustes de processos, engajamento da equipe e melhoria de infraestrutura.
- **Longo Prazo (6 a 12 meses):** Projetos estruturantes, investimentos e metas para certificação/evolução da nota.

Adote um tom profissional, orientador, motivador. E nao use hifen como espaço.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Chave GEMINI_API_KEY não configurada nas variáveis de ambiente (.env).",
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction:
          "Você é um auditor e especialista líder em sustentabilidade empresarial (ESG), focado em eficiência de recursos (energia, água, resíduos, materiais) e governança. Responda em Português do Brasil com excelente formatação Markdown.",
      },
    });

    const reportContent =
      response.text ||
      "Não foi possível obter o conteúdo do relatório gerado pela IA.";

    const summaryText = `Score Geral: ${Math.round(diagnostic.overallScore || 0)}/100 • Nível: ${diagnostic.maturityLevel || "EM_DESENVOLVIMENTO"} • Ponto Crítico: ${criticalPillarName}`;

    // 3. Salva no banco de dados (ActionPlan) para persistência e consultas futuras sem consumo repetido de IA
    const savedPlan = await prisma.actionPlan.upsert({
      where: { diagnosticId: diagnostic.id },
      update: {
        content: reportContent,
        summary: summaryText,
        promptContext: `Índice ${diagnostic.overallScore}, Pilar Crítico: ${diagnostic.criticalPillar}`,
        aiModel: "gemini-3.1-flash-lite",
      },
      create: {
        diagnosticId: diagnostic.id,
        content: reportContent,
        summary: summaryText,
        promptContext: `Índice ${diagnostic.overallScore}, Pilar Crítico: ${diagnostic.criticalPillar}`,
        aiModel: "gemini-3.1-flash-lite",
      },
    });

    return {
      content: savedPlan.content,
      summary: savedPlan.summary,
      fromCache: false,
      createdAt: savedPlan.createdAt,
    };
  }

  // =========================================================================
  // CASO 2: Relatório Consolidado dos Últimos 30 Dias / Mensal (Escalabilidade)
  // =========================================================================
  const year = new Date().getFullYear();
  const targetMonth =
    month || String(new Date().getMonth() + 1).padStart(2, "0");
  const startDate = startOfMonth(new Date(`${year}-${targetMonth}-01`));
  const endDate = endOfMonth(new Date(`${year}-${targetMonth}-01`));

  const diagnostics = await prisma.diagnostic.findMany({
    where: {
      userId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      institution: true,
      pillarScores: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (diagnostics.length === 0) {
    return {
      content: "Nenhum diagnóstico encontrado para o período selecionado.",
      fromCache: false,
    };
  }

  const avgScore =
    diagnostics.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
    diagnostics.length;

  const monthlyPrompt = `Você é um consultor sênior em sustentabilidade e ESG.
Analise a evolução de sustentabilidade da instituição no mês ${targetMonth}/${year} com base em ${diagnostics.length} diagnóstico(s) realizado(s).
Média do Índice no Período: ${Math.round(avgScore)}/100.

Estruture a resposta com:
# 📋 Visão Geral do Período (${targetMonth}/${year})
# ⚠️ Principais Gargalos e Pontos de Atenção Consolidados
# 🎯 Plano Estratégico Geral para os Próximos 30 Dias`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Chave GEMINI_API_KEY não configurada nas variáveis de ambiente (.env).",
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: monthlyPrompt,
    config: {
      systemInstruction:
        "Você é um consultor ESG corporativo. Responda em Português do Brasil com formatação Markdown e sem hifen.",
    },
  });

  const content = response.text || "Relatório mensal gerado.";

  return {
    content,
    summary: `Média do período: ${Math.round(avgScore)}/100 em ${diagnostics.length} diagnósticos.`,
    fromCache: false,
  };
};
