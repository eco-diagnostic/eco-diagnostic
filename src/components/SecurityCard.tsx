import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { Fingerprint } from "lucide-react-native";
import { authenticate, setBiometricEnabled, useSecurity } from "../services/security";
import { feedback } from "../services/feedback";

/** Cartão da tela Início para ligar ou desligar a proteção por biometria. */
export default function SecurityCard() {
  const security = useSecurity();

  if (!security.loaded) return null;

  const handleChange = async (value: boolean) => {
    if (value) {
      // Para ligar, confirma com a biometria (garante que ela funciona neste aparelho)
      const ok = await authenticate("Confirme para ativar a proteção por biometria");
      if (!ok) {
        feedback.warning();
        return;
      }
      await setBiometricEnabled(true);
      feedback.success();
    } else {
      await setBiometricEnabled(false);
      feedback.next();
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Fingerprint size={22} color={security.available ? "#059669" : "#9ca3af"} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>Proteger com biometria</Text>
        <Text style={styles.subtitle}>
          {security.available
            ? "Peça a digital ou o rosto ao abrir o app."
            : "Indisponível: cadastre uma digital ou rosto nas configurações do aparelho."}
        </Text>
      </View>
      <Switch
        value={security.enabled}
        onValueChange={handleChange}
        disabled={!security.available}
        trackColor={{ false: "#d1d5db", true: "#86efac" }}
        thumbColor={security.enabled ? "#16a34a" : "#f9fafb"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    lineHeight: 17,
  },
});
