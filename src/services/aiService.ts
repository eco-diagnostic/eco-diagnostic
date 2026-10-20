import { AI_CONFIG } from "../config/aiConfig";
import { PILLAR_NAMES } from "../data/questions";
import { DiagnosticResult, AiConsultancyResult, AiInitiative, Pillar } from "../types";

/**
 * Limpa blocos de código markdown ou caracteres extras ao redor do JSON retornado pela IA.
 */
function extractJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * Constrói o prompt analítico hiper-personalizado por setor para o Gemini.
 */
function buildPrompt(result: DiagnosticResult): string {
  const critName = PILLAR_NAMES[result.criticalPillar] || result.criticalPillar;
  const critScore = result.pillarScores[result.criticalPillar] ?? 0;
  const sector =
    result.sector && result.sector.trim().length > 0 ? result.sector.trim() : "Geral / Serviços";

  const scoresBreakdown = (Object.keys(result.pillarScores) as Pillar[])
    .map((p) => `- ${PILLAR_NAMES[p] || p}: ${result.pillarScores[p]}/100`)
    .join("\n");

  return `Você é um consultor executivo sênior especialista em Sustentabilidade, Governança ESG e Engenharia Operacional com vasta experiência no setor "${sector}".
Analise em profundidade o diagnóstico ecológico da organização abaixo:

ORGANIZAÇÃO: "${result.institutionName}"
SETOR / RAMO DE ATUAÇÃO: "${sector}"
PONTUAÇÃO GERAL: ${result.overallScore}/100 (Nível de Maturidade: ${result.maturityLevel})
PILAR CRÍTICO MAIS VULNERÁVEL: ${critName} (Nota: ${critScore}/100)
DESEMPENHO POR PILAR:
${scoresBreakdown}

DIRETRIZ DE HIPER-PERSONALIZAÇÃO POR SETOR:
Sua consultoria NÃO deve ser genérica. Ela DEVE refletir a realidade operacional, os desafios técnicos, os equipamentos típicos, os fluxos de trabalho e a legislação/normas aplicáveis ao setor "${sector}".
Exemplos de vocabulário e contexto esperado:
- Se for Saúde/Hospitalar/Clínicas: considere resíduos infectantes (RSS), autoclaves, gases medicinais, esterilização, climatização em áreas limpas, RDC da ANVISA.
- Se for Educação/Universidades/Escolas: considere comunidade acadêmica, cantinas, desperdício em banheiros/salas, climatização, computadores em laboratórios, compras sustentáveis.
- Se for Tecnologia/TI/Software: considere data centers/servidores, trabalho remoto/híbrido, descarte de lixo eletrônico (e-waste), consumo de ar-condicionado corporativo, paperless.
- Se for Comércio/Varejo/Supermercados: considere câmaras frias, refrigeração comercial, iluminação de vitrines, desperdício de alimentos, sacolas plásticas, logística reversa.
- Se for Indústria/Manufatura: considere motores elétricos de alto rendimento, ar comprimido, efluentes industriais, caldeiras, aproveitamento de sobras de processo.
- Se for Alimentação/Bares/Restaurantes: considere óleo vegetal usado, compostagem de resíduos orgânicos, conservação de frio, água na cozinha industrial, embalagens delivery.
- Se for Hotelaria: considere lavanderia, troca consciente de toalhas e lençóis, amenities ecológicos, frigobares, eficiência de caldeiras de água quente.

Responda EXCLUSIVAMENTE em formato JSON estrito, sem textos explicativos antes ou depois, seguindo exatamente este esquema:

{
  "executiveSummary": "Síntese executiva de 2 a 3 frases avaliando o momento ecológico de ${result.institutionName} considerando as peculiaridades do setor ${sector}.",
  "sectorContext": "Diagnóstico do setor: Como organizações de referência do segmento '${sector}' atuam para equilibrar rentabilidade com sustentabilidade e quais os riscos regulatórios mais comuns.",
  "sectorQuickWin": "Uma ação prática 'Quick Win' específica para o setor '${sector}', de custo muito baixo e implementação rápida que gera resultado visível.",
  "criticalPillarDiagnosis": "Diagnóstico específico de 1 a 2 frases explicando por que o pilar ${critName} é um risco crítico nesta operação de ${sector}.",
  "initiatives": [
    {
      "title": "Título conciso e profissional da iniciativa sob medida",
      "pillar": "Nome do pilar correspondente",
      "impact": "Alto",
      "effort": "Médio",
      "description": "Instrução prática passo a passo de implementação adequada ao contexto de ${sector}.",
      "estimatedReturn": "Estimativa objetiva de retorno financeiro, payback ou conformidade regulatória (ex: Payback estimado de 6 a 12 meses, Redução de até 25% na fatura)."
    }
  ],
  "governanceTip": "Uma recomendação estratégica indispensável para o comitê ou diretoria de ${sector} acompanhar as metas."
}

Regras:
1. Gere EXATAMENTE 3 iniciativas prioritárias na lista "initiatives".
2. A iniciativa 1 DEVE ser focada no Pilar Crítico (${critName}) aplicando soluções específicas do setor "${sector}".
3. Os campos "impact" devem ser: "Alto", "Médio" ou "Baixo".
4. Os campos "effort" devem ser: "Baixo", "Médio" ou "Alto".
5. Use linguagem executiva, persuasiva, técnica e fundamentada em português brasileiro.`;
}

/**
 * Chama o Gemini API tentando o modelo principal e caindo em modelos de fallback se necessário.
 */
async function callGeminiApi(prompt: string, apiKey: string): Promise<{ text: string; model: string }> {
  const modelsToTry = [AI_CONFIG.defaultModel, ...AI_CONFIG.fallbackModels];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `${AI_CONFIG.baseUrl}/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.35,
          },
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} returned error status ${response.status}:`, errorText);
        lastError = new Error(`Falha no modelo ${model} (${response.status}): ${errorText}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Resposta da IA vazia ou incompleta.");
      }

      return { text: rawText, model };
    } catch (err) {
      console.warn(`Erro ao tentar modelo ${model}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Não foi possível conectar com os servidores de IA no momento.");
}

/**
 * Gera a consultoria estratégica hiper-personalizada por setor com IA para o resultado do diagnóstico.
 */
export async function generateAiConsultancy(result: DiagnosticResult): Promise<AiConsultancyResult> {
  const apiKey = AI_CONFIG.apiKey;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("Chave de API do Gemini não configurada.");
  }

  const prompt = buildPrompt(result);
  const { text, model } = await callGeminiApi(prompt, apiKey);

  const cleanedJson = extractJson(text);
  let parsed: any;
  try {
    parsed = JSON.parse(cleanedJson);
  } catch (parseError) {
    console.error("Falha ao analisar JSON da IA:", text);
    throw new Error("A IA respondeu em formato inválido. Tente novamente.");
  }

  const sectorName = result.sector && result.sector.trim().length > 0 ? result.sector.trim() : "Geral";

  // Validação e normalização dos dados recebidos
  const initiatives: AiInitiative[] = Array.isArray(parsed.initiatives)
    ? parsed.initiatives.slice(0, 3).map((item: any, idx: number) => ({
        title: String(item.title || `Iniciativa Estratégica ${idx + 1}`),
        pillar: String(item.pillar || PILLAR_NAMES[result.criticalPillar]),
        impact: item.impact === "Médio" || item.impact === "Baixo" ? item.impact : "Alto",
        effort: item.effort === "Alto" || item.effort === "Baixo" ? item.effort : "Médio",
        description: String(item.description || "Implementação de melhoria contínua e monitoramento dos indicadores."),
        estimatedReturn: String(item.estimatedReturn || "Eficiência operacional e conformidade regulatória."),
      }))
    : [];

  return {
    executiveSummary:
      String(parsed.executiveSummary || `Diagnóstico ecológico concluído para o setor ${sectorName}.`),
    sectorContext: parsed.sectorContext ? String(parsed.sectorContext) : undefined,
    sectorQuickWin: parsed.sectorQuickWin ? String(parsed.sectorQuickWin) : undefined,
    criticalPillarDiagnosis:
      String(
        parsed.criticalPillarDiagnosis ||
          `O pilar ${PILLAR_NAMES[result.criticalPillar]} requer intervenção estratégica prioritária no setor ${sectorName}.`
      ),
    initiatives,
    governanceTip:
      String(
        parsed.governanceTip ||
          "Estabeleça um comitê interno mensal para acompanhamento das métricas de sustentabilidade."
      ),
    generatedAt: new Date().toISOString(),
    model,
  };
}
