import AsyncStorage from "@react-native-async-storage/async-storage";
import { DiagnosticResult } from "../types";
import {
  InstitutionInfo,
  QuizDraft,
  parseDiagnostics,
  parseInstitution,
  parseQuizDraft,
  safeParse,
} from "./storageValidation";

export type { InstitutionInfo, QuizDraft };

const DIAGNOSTICS_KEY = "@eco_diagnostic_history";
const INSTITUTION_KEY = "@eco_institution_info";
const QUIZ_DRAFT_KEY = "@eco_quiz_draft";

// In-memory fallback para garantir que o app nunca trave caso haja qualquer problema de I/O
let memoryDiagnostics: DiagnosticResult[] = [];
let memoryInstitution: InstitutionInfo | null = null;
let memoryDraft: QuizDraft | null = null;

export const StorageService = {
  async getDiagnostics(): Promise<DiagnosticResult[]> {
    try {
      const json = await AsyncStorage.getItem(DIAGNOSTICS_KEY);
      if (json) {
        const parsed = parseDiagnostics(safeParse(json));
        if (!parsed) {
          console.warn("StorageService getDiagnostics: histórico salvo em formato inválido, ignorado.");
          return memoryDiagnostics;
        }
        if (parsed.discarded > 0) {
          console.warn(`StorageService getDiagnostics: ${parsed.discarded} registro(s) inválido(s) ignorado(s).`);
        }
        memoryDiagnostics = parsed.valid;
        return parsed.valid;
      }
      return memoryDiagnostics;
    } catch (e) {
      console.warn("StorageService getDiagnostics fallback:", e);
      return memoryDiagnostics;
    }
  },

  async saveDiagnostic(result: DiagnosticResult): Promise<void> {
    const existing = await this.getDiagnostics();
    const alreadySaved = existing.some((d) => d.id === result.id);
    // Diagnóstico novo entra no topo; um já salvo (ex.: ao gerar a consultoria de IA depois)
    // é atualizado no mesmo lugar, para não bagunçar a ordem do histórico e do painel.
    const updated = alreadySaved
      ? existing.map((d) => (d.id === result.id ? result : d))
      : [result, ...existing];
    memoryDiagnostics = updated;
    try {
      await AsyncStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("StorageService saveDiagnostic fallback:", e);
    }
  },

  async deleteDiagnostic(id: string): Promise<void> {
    const existing = await this.getDiagnostics();
    const updated = existing.filter((d) => d.id !== id);
    memoryDiagnostics = updated;
    try {
      await AsyncStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("StorageService deleteDiagnostic fallback:", e);
    }
  },

  async clearDiagnostics(): Promise<void> {
    memoryDiagnostics = [];
    try {
      await AsyncStorage.removeItem(DIAGNOSTICS_KEY);
    } catch (e) {
      console.warn("StorageService clearDiagnostics fallback:", e);
    }
  },

  async getInstitution(): Promise<InstitutionInfo | null> {
    try {
      const json = await AsyncStorage.getItem(INSTITUTION_KEY);
      if (json) {
        const parsed = parseInstitution(safeParse(json));
        if (!parsed) {
          console.warn("StorageService getInstitution: dados da instituição inválidos, ignorados.");
          return memoryInstitution;
        }
        memoryInstitution = parsed;
        return parsed;
      }
      return memoryInstitution;
    } catch (e) {
      console.warn("StorageService getInstitution fallback:", e);
      return memoryInstitution;
    }
  },

  async saveInstitution(info: InstitutionInfo): Promise<void> {
    memoryInstitution = info;
    try {
      await AsyncStorage.setItem(INSTITUTION_KEY, JSON.stringify(info));
    } catch (e) {
      console.warn("StorageService saveInstitution fallback:", e);
    }
  },

  async getQuizDraft(): Promise<QuizDraft | null> {
    try {
      const json = await AsyncStorage.getItem(QUIZ_DRAFT_KEY);
      if (json) {
        const parsed = parseQuizDraft(safeParse(json));
        if (!parsed) {
          console.warn("StorageService getQuizDraft: rascunho inválido, ignorado.");
          return memoryDraft;
        }
        memoryDraft = parsed;
        return parsed;
      }
      return memoryDraft;
    } catch (e) {
      console.warn("StorageService getQuizDraft fallback:", e);
      return memoryDraft;
    }
  },

  async saveQuizDraft(draft: QuizDraft): Promise<void> {
    memoryDraft = draft;
    try {
      await AsyncStorage.setItem(QUIZ_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn("StorageService saveQuizDraft fallback:", e);
    }
  },

  async clearQuizDraft(): Promise<void> {
    memoryDraft = null;
    try {
      await AsyncStorage.removeItem(QUIZ_DRAFT_KEY);
    } catch (e) {
      console.warn("StorageService clearQuizDraft fallback:", e);
    }
  },
};
