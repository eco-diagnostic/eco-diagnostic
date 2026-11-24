import { AI_CONFIG } from "../config/aiConfig";
import { PILLAR_NAMES } from "../data/questions";
import { DiagnosticResult, AiConsultancyResult, Pillar } from "../types";
import { AI_INVALID_FORMAT_MESSAGE, normalizeAiConsultancy } from "./aiValidation";

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
 * Traduz a última falha da IA em uma mensagem amigável para exibir na tela.
 */
function friendlyAiErrorMessage(lastStatus: number | null, lastError: any): string {
  if (lastStatus === 503 || lastStatus === 429) {
    return "Os servidores de IA estão sobrecarregados no momento. Aguarde alguns segundos e tente novamente.";
  }
  if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) {
    return "A chave da API do Gemini foi recusada. Verifique a variável EXPO_PUBLIC_GEMINI_API_KEY.";
  }
  if (lastError?.name === "AbortError") {
    return "A IA demorou demais para responder. Tente novamente.";
  }
  if (lastError instanceof TypeError || /network/i.test(String(lastError?.message))) {
    return "Sem conexão com a internet. Verifique a rede e tente novamente.";
  }
  return "Não foi possível gerar a consultoria agora. Tente novamente.";
}

/**
 * Chama o Gemini API tentando o modelo principal e caindo em modelos de fallback se necessário.
 */
async function callGeminiApi(prompt: string, apiKey: string): Promise<{ text: string; model: string }> {
  const modelsToTry = [AI_CONFIG.defaultModel, ...AI_CONFIG.fallbackModels];
  let lastError: any = null;
  let lastStatus: number | null = null;

  for (const model of modelsToTry) {
    // Evita que a tela fique carregando para sempre se um modelo não responder
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_CONFIG.requestTimeoutMs);

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
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} returned error status ${response.status}:`, errorText);
        lastStatus = response.status;
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
      lastStatus = null;
      lastError = err;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(friendlyAiErrorMessage(lastStatus, lastError));
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
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedJson);
  } catch (parseError) {
    console.error("Falha ao analisar JSON da IA:", text);
    throw new Error(AI_INVALID_FORMAT_MESSAGE);
  }

  const sectorName = result.sector && result.sector.trim().length > 0 ? result.sector.trim() : "Geral";

  // Valida o formato completo: JSON válido ainda pode vir como null, lista ou com campos de outro tipo
  return normalizeAiConsultancy(parsed, {
    criticalPillarName: PILLAR_NAMES[result.criticalPillar] || result.criticalPillar,
    sectorName,
    model,
    generatedAt: new Date().toISOString(),
  });
}
