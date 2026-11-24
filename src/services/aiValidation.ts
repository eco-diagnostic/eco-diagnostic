import { AiConsultancyResult, AiInitiative, EffortLevel, ImpactLevel } from "../types";

/**
 * Validação do JSON devolvido pela IA e da consultoria salva no aparelho.
 * JSON sintaticamente válido ainda pode ter formato errado (null, lista, campos de outro tipo).
 */

export const AI_INVALID_FORMAT_MESSAGE = "A IA respondeu em formato inválido. Tente novamente.";

const IMPACTS: ImpactLevel[] = ["Alto", "Médio", "Baixo"];
const EFFORTS: EffortLevel[] = ["Baixo", "Médio", "Alto"];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Texto não vazio; números viram texto. Objetos e listas são rejeitados (evita "[object Object]"). */
function text(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

export interface AiNormalizeContext {
  criticalPillarName: string;
  sectorName: string;
  model: string;
  generatedAt: string;
}

/**
 * Converte a resposta da IA no formato usado pelo app.
 * Campos de texto ausentes recebem um texto padrão; sem nenhuma iniciativa utilizável, lança erro.
 */
export function normalizeAiConsultancy(parsed: unknown, ctx: AiNormalizeContext): AiConsultancyResult {
  if (!isRecord(parsed) || !Array.isArray(parsed.initiatives)) {
    throw new Error(AI_INVALID_FORMAT_MESSAGE);
  }

  const initiatives: AiInitiative[] = parsed.initiatives
    .filter(isRecord)
    .filter((item) => text(item.title) && text(item.description))
    .slice(0, 3)
    .map((item) => ({
      title: text(item.title)!,
      pillar: text(item.pillar) ?? ctx.criticalPillarName,
      impact: IMPACTS.includes(item.impact as ImpactLevel) ? (item.impact as ImpactLevel) : "Alto",
      effort: EFFORTS.includes(item.effort as EffortLevel) ? (item.effort as EffortLevel) : "Médio",
      description: text(item.description)!,
      estimatedReturn: text(item.estimatedReturn) ?? "Eficiência operacional e conformidade regulatória.",
    }));

  if (initiatives.length === 0) {
    throw new Error(AI_INVALID_FORMAT_MESSAGE);
  }

  return {
    executiveSummary:
      text(parsed.executiveSummary) ?? `Diagnóstico ecológico concluído para o setor ${ctx.sectorName}.`,
    sectorContext: text(parsed.sectorContext),
    sectorQuickWin: text(parsed.sectorQuickWin),
    criticalPillarDiagnosis:
      text(parsed.criticalPillarDiagnosis) ??
      `O pilar ${ctx.criticalPillarName} requer intervenção estratégica prioritária no setor ${ctx.sectorName}.`,
    initiatives,
    governanceTip:
      text(parsed.governanceTip) ??
      "Estabeleça um comitê interno mensal para acompanhamento das métricas de sustentabilidade.",
    generatedAt: ctx.generatedAt,
    model: ctx.model,
  };
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

/** Confere se uma consultoria lida do armazenamento tem tudo que as telas e o PDF usam. */
export function isValidStoredAiConsultancy(value: unknown): value is AiConsultancyResult {
  if (!isRecord(value)) return false;
  const { executiveSummary, criticalPillarDiagnosis, governanceTip, generatedAt, model, sectorContext, sectorQuickWin, initiatives } = value;

  return (
    [executiveSummary, criticalPillarDiagnosis, governanceTip, generatedAt, model].every((field) => typeof field === "string") &&
    isOptionalString(sectorContext) &&
    isOptionalString(sectorQuickWin) &&
    Array.isArray(initiatives) &&
    initiatives.every(
      (item) =>
        isRecord(item) &&
        [item.title, item.pillar, item.description, item.estimatedReturn].every((field) => typeof field === "string") &&
        IMPACTS.includes(item.impact as ImpactLevel) &&
        EFFORTS.includes(item.effort as EffortLevel)
    )
  );
}
