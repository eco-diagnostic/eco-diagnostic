import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Fingerprint, Lock } from "lucide-react-native";
import {
  authenticate,
  markPrompted,
  setBiometricEnabled,
  useSecurity,
} from "../services/security";
import { feedback } from "../services/feedback";

/**
 * Envolve o app e cuida da biometria opcional:
 * 1) se a proteção estiver ligada, mostra a tela de bloqueio ao abrir e pede a biometria;
 * 2) se estiver desligada e o aparelho tiver biometria, oferece ativar UMA vez,
 *    logo depois que a pessoa entra no app.
 */
export default function BiometricGate({ children }: { children: React.ReactNode }) {
  const security = useSecurity();
  const [unlocked, setUnlocked] = useState(false);
  const [autoTried, setAutoTried] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteError, setInviteError] = useState(false);

  const locked = security.loaded && security.enabled && !unlocked;

  const unlock = useCallback(async () => {
    const ok = await authenticate("Desbloquear o Eco Diagnóstico");
    if (ok) {
      feedback.next();
      setUnlocked(true);
    }
  }, []);

  // Ao abrir o app protegido, já pede a biometria (o botão permite tentar de novo)
  useEffect(() => {
    if (locked && !autoTried) {
      setAutoTried(true);
      unlock();
    }
  }, [locked, autoTried, unlock]);

  // Convite: só depois de entrar, uma única vez, e só se o aparelho tiver biometria
  useEffect(() => {
    if (security.loaded && security.available && !security.enabled && !security.prompted) {
      const timer = setTimeout(() => setShowInvite(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [security.loaded, security.available, security.enabled, security.prompted]);

  const handleActivate = async () => {
    setInviteError(false);
    const ok = await authenticate("Confirme para ativar a proteção por biometria");
    if (ok) {
      setUnlocked(true); // já está dentro: não bloqueia de novo nesta sessão
      await setBiometricEnabled(true);
      feedback.success();
      setShowInvite(false);
    } else {
      setInviteError(true);
    }
  };

  const handleSkip = async () => {
    await markPrompted();
    setShowInvite(false);
  };

  if (!security.loaded) {
    return <View style={styles.blank} />;
  }

  if (locked) {
    return (
      <View style={styles.lockScreen}>
        <Image source={require("../../assets/avatar-github.png")} style={styles.lockLogo} resizeMode="contain" />
        <View style={styles.lockBadge}>
          <Lock size={16} color="#059669" />
          <Text style={styles.lockBadgeText}>Aplicativo protegido</Text>
        </View>
        <Text style={styles.lockTitle}>Eco Diagnóstico</Text>
        <Text style={styles.lockText}>Use sua digital ou seu rosto para ver os seus diagnósticos.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={unlock} activeOpacity={0.85}>
          <Fingerprint size={20} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Desbloquear</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {children}
      <Modal visible={showInvite} transparent animationType="fade" onRequestClose={handleSkip}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Fingerprint size={34} color="#059669" />
            </View>
            <Text style={styles.cardTitle}>Proteger seus diagnósticos?</Text>
            <Text style={styles.cardText}>
              Quer usar a sua digital ou o seu rosto para abrir o app? Os diagnósticos ficam guardados
              no aparelho e só você poderá vê-los.
            </Text>
            <Text style={styles.cardHint}>Você pode mudar isso depois, na tela Início.</Text>
            {inviteError && (
              <Text style={styles.errorText}>Não foi possível confirmar. Tente de novo ou toque em "Agora não".</Text>
            )}
            <TouchableOpacity style={styles.primaryButton} onPress={handleActivate} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Ativar biometria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.secondaryButtonText}>Agora não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  lockScreen: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  lockLogo: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  lockBadgeText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#059669",
  },
  lockTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#15803d",
    marginBottom: 8,
  },
  lockText: {
    fontSize: 14.5,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14.5,
    color: "#374151",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 12.5,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 18,
  },
  errorText: {
    fontSize: 12.5,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 12,
  },
  primaryButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  secondaryButtonText: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "600",
  },
});
