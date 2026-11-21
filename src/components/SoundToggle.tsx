import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Volume2, VolumeX } from "lucide-react-native";
import { useSoundEnabled } from "../services/feedback";

/** Botão do cabeçalho para ligar/desligar os sons do app. */
export default function SoundToggle() {
  const { soundOn, toggle } = useSoundEnabled();

  return (
    <TouchableOpacity
      onPress={toggle}
      style={styles.button}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={soundOn ? "Desativar sons" : "Ativar sons"}
    >
      {soundOn ? <Volume2 size={22} color="#16a34a" /> : <VolumeX size={22} color="#9ca3af" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 16,
  },
});
