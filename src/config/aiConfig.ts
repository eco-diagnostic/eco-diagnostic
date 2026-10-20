/**
 * Configurações da API de Inteligência Artificial (Google Gemini)
 */
export const AI_CONFIG = {
  // Chave da API do Google Gemini via variável de ambiente Expo
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",

  // Modelo principal ativo e validado
  defaultModel: "gemini-3.8-flash",

  // Modelos de fallback automático caso haja indisponibilidade temporária de cota
  fallbackModels: ["gemini-3.5-flash", "gemini-flash-latest"],

  // Endpoint oficial da API do Gemini
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
};
