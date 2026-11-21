/**
 * Configurações da API de Inteligência Artificial (Google Gemini)
 */
export const AI_CONFIG = {
  // Chave da API do Google Gemini via variável de ambiente Expo
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",

  // Modelo principal ativo e validado
  defaultModel: "gemini-3.8-flash",

  // Modelos de fallback automático caso o principal esteja indisponível
  // (ex.: erro 503 de alta demanda ou limite de cota)
  fallbackModels: ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"],

  // Tempo máximo de espera por modelo antes de tentar o próximo (ms)
  requestTimeoutMs: 40000,

  // Endpoint oficial da API do Gemini
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
};
