import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

/**
 * Proteção opcional por biometria (digital ou rosto) com expo-local-authentication.
 * - Fica desligada por padrão; o app oferece ativar uma única vez, depois que a pessoa entra.
 * - A escolha é guardada no aparelho (AsyncStorage). O bloqueio vale na abertura do app.
 * - Se a biometria deixar de estar disponível (ex.: digitais removidas), o app não bloqueia,
 *   para ninguém ficar trancado fora dos próprios dados.
 */

const ENABLED_KEY = "@eco_biometric_enabled";
const PROMPTED_KEY = "@eco_biometric_prompted";

export interface SecurityState {
  /** Já leu as preferências e verificou o aparelho */
  loaded: boolean;
  /** O aparelho tem sensor e biometria cadastrada */
  available: boolean;
  /** Proteção ligada (só vale se estiver disponível) */
  enabled: boolean;
  /** O convite para ativar já foi respondido */
  prompted: boolean;
}

let state: SecurityState = { loaded: false, available: false, enabled: false, prompted: false };
let loading: Promise<void> | null = null;
const listeners = new Set<(s: SecurityState) => void>();

function update(patch: Partial<SecurityState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

/** Lê as preferências e verifica se o aparelho tem biometria (uma única vez). */
export function loadSecurity(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      let available = false;
      let enabled = false;
      let prompted = false;
      try {
        const [enabledRaw, promptedRaw] = await Promise.all([
          AsyncStorage.getItem(ENABLED_KEY),
          AsyncStorage.getItem(PROMPTED_KEY),
        ]);
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        available = hasHardware && (await LocalAuthentication.isEnrolledAsync());
        enabled = enabledRaw === "1" && available;
        prompted = promptedRaw === "1";
      } catch (e) {
        console.warn("Security load fallback:", e);
      }
      update({ loaded: true, available, enabled, prompted });
    })();
  }
  return loading;
}

/** Abre o prompt do sistema (digital, rosto ou senha do aparelho). */
export async function authenticate(message: string): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: message,
      cancelLabel: "Cancelar",
      fallbackLabel: "Usar senha do aparelho",
    });
    return result.success;
  } catch (e) {
    console.warn("Falha na autenticação:", e);
    return false;
  }
}

export async function setBiometricEnabled(enabled: boolean) {
  update({ enabled, prompted: true });
  try {
    await Promise.all([
      AsyncStorage.setItem(ENABLED_KEY, enabled ? "1" : "0"),
      AsyncStorage.setItem(PROMPTED_KEY, "1"),
    ]);
  } catch (e) {
    console.warn("Não foi possível salvar a preferência de biometria:", e);
  }
}

/** Marca que o convite já foi respondido ("Agora não"), para não perguntar de novo. */
export async function markPrompted() {
  update({ prompted: true });
  try {
    await AsyncStorage.setItem(PROMPTED_KEY, "1");
  } catch (e) {
    console.warn("Não foi possível salvar a resposta ao convite:", e);
  }
}

/** Hook: estado atual da proteção, atualizado quando algo muda. */
export function useSecurity(): SecurityState {
  const [snapshot, setSnapshot] = useState<SecurityState>(state);

  useEffect(() => {
    listeners.add(setSnapshot);
    setSnapshot(state);
    loadSecurity();
    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);

  return snapshot;
}
