export enum Pillar {
  ENERGIA = "ENERGIA",
  AGUA = "AGUA",
  RESIDUOS = "RESIDUOS",
  MATERIAIS = "MATERIAIS",
  GESTAO = "GESTAO",
}

export type MaturityLevel = "CRITICO" | "EM_DESENVOLVIMENTO" | "AVANCADO" | "SUSTENTAVEL";

export type ImpactLevel = "Alto" | "Médio" | "Baixo";
export type EffortLevel = "Baixo" | "Médio" | "Alto";

export interface AiInitiative {
  title: string;
  pillar: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  description: string;
  estimatedReturn: string;
}

export interface AiConsultancyResult {
  executiveSummary: string;
  criticalPillarDiagnosis: string;
  sectorContext?: string; // Análise de benchmark setorial
  sectorQuickWin?: string; // Ação rápida de baixo custo específica do setor
  initiatives: AiInitiative[];
  governanceTip: string;
  generatedAt: string;
  model: string;
}

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
  sector?: string; // Ex: Saúde, Educação, Tecnologia, Varejo, Indústria...
  completedAt: string;
  overallScore: number;
  maturityLevel: MaturityLevel;
  criticalPillar: Pillar;
  pillarScores: Record<Pillar, number>;
  recommendations: string[];
  aiConsultancy?: AiConsultancyResult;
}
