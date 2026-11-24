import { DiagnosticResult, MaturityLevel, Pillar } from "../types";

/**
 * Validação dos dados lidos do AsyncStorage.
 * O armazenamento local pode conter JSON corrompido, de uma versão antiga do app
 * ou editado manualmente. Registros inválidos são descartados em vez de quebrar as telas.
 */

export interface InstitutionInfo {
  name: string;
  sector: string;
  city: string;
  state: string;
}

export interface QuizDraft {
  institutionName: string;
  sector?: string;
  currentIndex: number;
  answers: Record<string, number>;
  updatedAt: string;
}

const MATURITY_LEVELS: MaturityLevel[] = ["CRITICO", "EM_DESENVOLVIMENTO", "AVANCADO", "SUSTENTAVEL"];
const PILLARS = Object.values(Pillar);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

/** Converte o texto salvo em objeto; devolve undefined se o JSON estiver corrompido. */
export function safeParse(json: string | null): unknown {
  if (json === null) return undefined;
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

export function isValidDiagnostic(value: unknown): value is DiagnosticResult {
  if (!isRecord(value)) return false;
  const { id, institutionName, sector, completedAt, overallScore, maturityLevel, criticalPillar, pillarScores, recommendations, aiConsultancy } = value;

  return (
    isNonEmptyString(id) &&
    isNonEmptyString(institutionName) &&
    (sector === undefined || typeof sector === "string") &&
    isDate(completedAt) &&
    isScore(overallScore) &&
    MATURITY_LEVELS.includes(maturityLevel as MaturityLevel) &&
    PILLARS.includes(criticalPillar as Pillar) &&
    isRecord(pillarScores) &&
    PILLARS.every((pillar) => isScore(pillarScores[pillar])) &&
    Array.isArray(recommendations) &&
    recommendations.every((item) => typeof item === "string") &&
    (aiConsultancy === undefined || isRecord(aiConsultancy))
  );
}

/** Mantém só os diagnósticos válidos e sem id repetido. Retorna null se o formato geral não for uma lista. */
export function parseDiagnostics(value: unknown): { valid: DiagnosticResult[]; discarded: number } | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<string>();
  const valid: DiagnosticResult[] = [];
  for (const item of value) {
    if (isValidDiagnostic(item) && !seen.has(item.id)) {
      seen.add(item.id);
      valid.push(item);
    }
  }
  return { valid, discarded: value.length - valid.length };
}

export function parseInstitution(value: unknown): InstitutionInfo | null {
  if (!isRecord(value)) return null;
  const { name, sector, city, state } = value;
  if (![name, sector, city, state].every((field) => typeof field === "string")) return null;
  return { name, sector, city, state } as InstitutionInfo;
}

export function parseQuizDraft(value: unknown): QuizDraft | null {
  if (!isRecord(value)) return null;
  const { institutionName, sector, currentIndex, answers, updatedAt } = value;

  if (
    !isNonEmptyString(institutionName) ||
    (sector !== undefined && typeof sector !== "string") ||
    typeof currentIndex !== "number" ||
    !Number.isInteger(currentIndex) ||
    currentIndex < 0 ||
    !isRecord(answers) ||
    !Object.values(answers).every(isScore) ||
    !isDate(updatedAt)
  ) {
    return null;
  }

  return {
    institutionName,
    ...(sector !== undefined ? { sector: sector as string } : {}),
    currentIndex,
    answers: answers as Record<string, number>,
    updatedAt,
  };
}
