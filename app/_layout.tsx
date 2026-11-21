import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BiometricGate from "../src/components/BiometricGate";

/**
 * Layout raiz (Expo Router): pilha de navegação do app.
 * - (tabs): abas inferiores (Início, Painel, Histórico)
 * - quiz: questionário de 20 perguntas
 * - result: resultado do diagnóstico (recebe ?id=<id do diagnóstico>)
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      {/* Biometria opcional: tela de bloqueio ao abrir e convite para ativar (uma vez) */}
      <BiometricGate>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#ffffff" },
            headerTintColor: "#16a34a",
            headerTitleStyle: { fontWeight: "bold", color: "#111827" },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="quiz"
            options={{ title: "Questionário Ecológico", headerBackTitle: "Voltar" }}
          />
          <Stack.Screen
            name="result"
            options={{ title: "Diagnóstico Concluído", headerBackVisible: false }}
          />
        </Stack>
      </BiometricGate>
    </>
  );
}
