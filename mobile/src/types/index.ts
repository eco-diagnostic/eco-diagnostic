export enum Pillar {
  ENERGIA = "ENERGIA",
  AGUA = "AGUA",
  RESIDUOS = "RESIDUOS",
  MATERIAIS = "MATERIAIS",
  GESTAO = "GESTAO",
}

export type MaturityLevel = "CRITICO" | "EM_DESENVOLVIMENTO" | "AVANCADO" | "SUSTENTAVEL";

export interface QuestionOption {
  id: string;
  text: string;
  score: number; // 0 a 100
  order: number;
}

export interface Question {
  id: string;
  pillar: Pillar;
  title: string;
  description?: string;
  weight: number;
  options: QuestionOption[];
}

export interface PillarScore {
  pillar: Pillar;
  score: number;
  totalQuestions: number;
}

export interface DiagnosticResult {
  id: string;
  institutionName: string;
  completedAt: string;
  overallScore: number;
  maturityLevel: MaturityLevel;
  criticalPillar: Pillar;
  pillarScores: Record<Pillar, number>;
  recommendations: string[];
}
