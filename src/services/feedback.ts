import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

/**
 * Feedback sensorial do app: vibração (expo-haptics) + efeitos sonoros curtos (expo-audio).
 * - Os sons são tons sintetizados em assets/sounds (sem direitos autorais).
 * - O som respeita o modo silencioso do celular e pode ser silenciado no botão do cabeçalho.
 * - A preferência de mudo fica salva no aparelho (AsyncStorage).
 */

type SoundName = "tap" | "next" | "success" | "warn";

const SOUND_FILES: Record<SoundName, number> = {
  tap: require("../../assets/sounds/tap.wav"),
  next: require("../../assets/sounds/next.wav"),
  success: require("../../assets/sounds/success.wav"),
  warn: require("../../assets/sounds/warn.wav"),
};

const MUTE_KEY = "@eco_sound_muted";

let muted = false;
let initialized: Promise<void> | null = null;
const players: Partial<Record<SoundName, AudioPlayer>> = {};
const listeners = new Set<(isMuted: boolean) => void>();

function notify() {
  listeners.forEach((listener) => listener(muted));
}

/** Carrega a preferência de mudo e configura o áudio (uma única vez). */
export function initFeedback(): Promise<void> {
  if (!initialized) {
    initialized = (async () => {
      try {
        muted = (await AsyncStorage.getItem(MUTE_KEY)) === "1";
        await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: "mixWithOthers" });
      } catch (e) {
        console.warn("Feedback init fallback:", e);
      }
      notify();
    })();
  }
  return initialized;
}

function playSound(name: SoundName) {
  if (muted) return;
  try {
    let player = players[name];
    if (!player) {
      player = createAudioPlayer(SOUND_FILES[name]);
      players[name] = player;
    }
    const current = player;
    // Volta ao início para o som poder tocar de novo logo em seguida
    Promise.resolve(current.seekTo(0))
      .catch(() => {})
      .finally(() => current.play());
  } catch (e) {
    console.warn("Falha ao tocar som:", e);
  }
}

function haptic(run: () => Promise<void>) {
  try {
    run().catch(() => {});
  } catch (e) {
    // dispositivos sem motor de vibração: ignora
  }
}

export const feedback = {
  /** Escolher uma alternativa */
  select() {
    haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    playSound("tap");
  },
  /** Avançar ou voltar de pergunta */
  next() {
    haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    playSound("next");
  },
  /** Concluir uma etapa com sucesso */
  success() {
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    playSound("success");
  },
  /** Aviso (ex.: falta escolher uma alternativa) */
  warning() {
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
    playSound("warn");
  },
  /** Erro (ex.: falha da IA) */
  error() {
    haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    playSound("warn");
  },
};

async function setMuted(next: boolean) {
  muted = next;
  notify();
  try {
    await AsyncStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch (e) {
    console.warn("Não foi possível salvar a preferência de som:", e);
  }
  if (!next) playSound("tap"); // confirma que o som voltou
}

/** Hook do botão de mudo: estado atual + alternar. */
export function useSoundEnabled() {
  const [isMuted, setIsMuted] = useState(muted);

  useEffect(() => {
    listeners.add(setIsMuted);
    initFeedback().then(() => setIsMuted(muted));
    return () => {
      listeners.delete(setIsMuted);
    };
  }, []);

  const toggle = useCallback(() => {
    setMuted(!muted);
  }, []);

  return { soundOn: !isMuted, toggle };
}

initFeedback();
