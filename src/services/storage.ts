import AsyncStorage from "@react-native-async-storage/async-storage";
import { DiagnosticResult } from "../types";

const DIAGNOSTICS_KEY = "@eco_diagnostic_history";
const INSTITUTION_KEY = "@eco_institution_info";

export interface InstitutionInfo {
  name: string;
  sector: string;
  city: string;
  state: string;
}

// In-memory fallback para garantir que o app nunca trave caso haja qualquer problema de I/O
let memoryDiagnostics: DiagnosticResult[] = [];
let memoryInstitution: InstitutionInfo | null = null;

export const StorageService = {
  async getDiagnostics(): Promise<DiagnosticResult[]> {
    try {
      const json = await AsyncStorage.getItem(DIAGNOSTICS_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        memoryDiagnostics = parsed;
        return parsed;
      }
      return memoryDiagnostics;
    } catch (e) {
      console.warn("StorageService getDiagnostics fallback:", e);
      return memoryDiagnostics;
    }
  },

  async saveDiagnostic(result: DiagnosticResult): Promise<void> {
    memoryDiagnostics = [result, ...memoryDiagnostics];
    try {
      const existing = await this.getDiagnostics();
      const updated = [result, ...existing.filter((d) => d.id !== result.id)];
      await AsyncStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("StorageService saveDiagnostic fallback:", e);
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
        const parsed = JSON.parse(json);
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
};
