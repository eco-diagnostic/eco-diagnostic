import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { StorageService } from "../services/storage";
import { PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { Pillar } from "../types";
import { Zap, Droplets, Trash2, Package, Award, Play } from "lucide-react-native";

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();

  const [institutionName, setInstitutionName] = useState("");
  const [sector, setSector] = useState("");
  const [totalDiagnostics, setTotalDiagnostics] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const loadData = async () => {
    const inst = await StorageService.getInstitution();
    if (inst) {
      setInstitutionName(inst.name);
      setSector(inst.sector);
    }
    const history = await StorageService.getDiagnostics();
    setTotalDiagnostics(history.length);
    if (history.length > 0) {
      setLastScore(history[0].overallScore);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const handleStart = async () => {
    const finalName = institutionName.trim() || "Minha Organização";
    await StorageService.saveInstitution({
      name: finalName,
      sector: sector.trim() || "Geral",
      city: "",
      state: "",
    });

    navigation.navigate("Quiz", { institutionName: finalName });
  };

  const getPillarIcon = (pillar: Pillar) => {
    const size = 18;
    switch (pillar) {
      case Pillar.ENERGIA:
        return <Zap size={size} color={PILLAR_COLORS[pillar]} />;
      case Pillar.AGUA:
        return <Droplets size={size} color={PILLAR_COLORS[pillar]} />;
      case Pillar.RESIDUOS:
        return <Trash2 size={size} color={PILLAR_COLORS[pillar]} />;
      case Pillar.MATERIAIS:
        return <Package size={size} color={PILLAR_COLORS[pillar]} />;
      case Pillar.GESTAO:
        return <Award size={size} color={PILLAR_COLORS[pillar]} />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER HERO */}
      <View style={styles.heroCard}>
        <Image
          source={require("../../assets/folha.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleRow}>
          <Text style={styles.brandGreenLight}>Eco </Text>
          <Text style={styles.brandGreenDark}>Diagnóstico</Text>
        </View>
        <Text style={styles.subtitle}>
          Avaliação da Maturidade Ecológica & Governança ESG
        </Text>
      </View>

      {/* CARD DE ESTATÍSTICA RÁPIDA */}
      {totalDiagnostics > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalDiagnostics}</Text>
            <Text style={styles.statLabel}>Avaliações Realizadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#16a34a" }]}>
              {lastScore !== null ? `${lastScore}/100` : "-"}
            </Text>
            <Text style={styles.statLabel}>Última Pontuação</Text>
          </View>
        </View>
      )}

      {/* DADOS DA INSTITUIÇÃO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dados da Organização Avaliada</Text>
        <Text style={styles.inputLabel}>Nome da Empresa ou Instituição:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Universidade XYZ, Empresa ABC..."
          placeholderTextColor="#9ca3af"
          value={institutionName}
          onChangeText={setInstitutionName}
        />

        <Text style={styles.inputLabel}>Ramo / Setor de Atuação:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Educação, Tecnologia, Saúde, Comércio..."
          placeholderTextColor="#9ca3af"
          value={sector}
          onChangeText={setSector}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleStart} activeOpacity={0.8}>
          <Play size={20} color="#ffffff" fill="#ffffff" />
          <Text style={styles.primaryButtonText}>Iniciar Diagnóstico (20 Questões)</Text>
        </TouchableOpacity>
      </View>

      {/* OS 5 PILARES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Os 5 Pilares de Avaliação</Text>
        <Text style={styles.cardDescription}>
          Cada pilar analisa 4 práticas estratégicas com pontuação calibrada de 0 a 100:
        </Text>

        {(Object.keys(PILLAR_NAMES) as Pillar[]).map((p) => (
          <View key={p} style={styles.pillarRow}>
            <View style={[styles.pillarIconBadge, { backgroundColor: `${PILLAR_COLORS[p]}20` }]}>
              {getPillarIcon(p)}
            </View>
            <View style={styles.pillarTextCol}>
              <Text style={styles.pillarName}>{PILLAR_NAMES[p]}</Text>
              <Text style={styles.pillarSub}>4 perguntas avaliativas</Text>
            </View>
            <View style={[styles.pillarDot, { backgroundColor: PILLAR_COLORS[p] }]} />
          </View>
        ))}
      </View>

      <Text style={styles.footerNote}>
        Eco Diagnóstico Mobile • Projeto Extensionista Universitário
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandGreenLight: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22c55e",
  },
  brandGreenDark: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#15803d",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#e5e7eb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 14,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pillarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pillarIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pillarTextCol: {
    flex: 1,
  },
  pillarName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  pillarSub: {
    fontSize: 12,
    color: "#9ca3af",
  },
  pillarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },
});
