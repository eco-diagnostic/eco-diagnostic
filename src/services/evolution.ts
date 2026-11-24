import { DiagnosticResult, Pillar } from "../types";

export interface EvolutionComparison {
  latest: DiagnosticResult;
  previous: DiagnosticResult;
  scoreDiff: number;
  bestGainPillar: Pillar | null;
  bestGain: number;
}

/**
 * Chave usada para reconhecer a mesma organização em avaliações diferentes.
 * Ignora maiúsculas, acentos e espaços extras: "Escola  Verde" e "escola verde" são a mesma.
 */
export function organizationKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function timeOf(result: DiagnosticResult): number {
  const time = Date.parse(result.completedAt);
  return Number.isFinite(time) ? time : 0;
}

/**
 * Compara a avaliação mais recente com a anterior DA MESMA organização.
 * Retorna null quando a organização mais recente só tem uma avaliação,
 * em vez de comparar organizações diferentes entre si.
 */
export function findEvolution(history: DiagnosticResult[]): EvolutionComparison | null {
  if (history.length < 2) return null;

  const ordered = [...history].sort((a, b) => timeOf(b) - timeOf(a));
  const latest = ordered[0];
  const key = organizationKey(latest.institutionName);
  const previous = ordered.slice(1).find((item) => organizationKey(item.institutionName) === key);
  if (!previous) return null;

  let bestGainPillar: Pillar | null = null;
  let bestGain = 0;
  for (const pillar of Object.values(Pillar)) {
    const gain = (latest.pillarScores[pillar] ?? 0) - (previous.pillarScores[pillar] ?? 0);
    if (gain > bestGain) {
      bestGain = gain;
      bestGainPillar = pillar;
    }
  }

  return {
    latest,
    previous,
    scoreDiff: latest.overallScore - previous.overallScore,
    bestGainPillar,
    bestGain,
  };
}
