import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { Pillar } from "../types";
import { AlertTriangle, CheckCircle, ArrowRight, Home, Sparkles } from "lucide-react-native";

type ResultScreenRouteProp = RouteProp<RootStackParamList, "Result">;

export default function ResultScreen() {
  const route = useRoute<ResultScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const result = route.params.result;

  const getMaturityInfo = () => {
    switch (result.maturityLevel) {
      case "SUSTENTAVEL":
        return { label: "Nível Sustentável", color: "#059669", bg: "#ecfdf5", desc: "Práticas exemplares e governança consolidada." };
      case "AVANCADO":
        return { label: "Nível Avançado", color: "#16a34a", bg: "#f0fdf4", desc: "Ações estruturadas com metas sólidas em andamento." };
      case "EM_DESENVOLVIMENTO":
        return { label: "Em Desenvolvimento", color: "#f59e0b", bg: "#fffbeb", desc: "Iniciativas em evolução, demandando maior padronização." };
      case "CRITICO":
      default:
        return { label: "Nível Crítico", color: "#ef4444", bg: "#fef2f2", desc: "Necessita de intervenção e investimentos prioritários urgentes." };
    }
  };

  const mat = getMaturityInfo();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER DO RESULTADO */}
      <View style={styles.scoreCard}>
        <View style={styles.instRow}>
          <Text style={styles.instName}>{result.institutionName}</Text>
          <Text style={styles.dateText}>
            {new Date(result.completedAt).toLocaleDateString("pt-BR")}
          </Text>
        </View>

        {/* NOTA GERAL */}
        <View style={[styles.scoreCircle, { borderColor: mat.color }]}>
          <Text style={[styles.scoreValue, { color: mat.color }]}>
            {result.overallScore}
          </Text>
          <Text style={styles.scoreMax}>de 100</Text>
        </View>

        {/* NÍVEL DE MATURIDADE */}
        <View style={[styles.maturityBadge, { backgroundColor: mat.bg }]}>
          <Sparkles size={16} color={mat.color} />
          <Text style={[styles.maturityText, { color: mat.color }]}>{mat.label}</Text>
        </View>
        <Text style={styles.maturityDesc}>{mat.desc}</Text>
      </View>

      {/* CARD DO PILAR CRÍTICO */}
      <View style={styles.criticalCard}>
        <View style={styles.criticalHeader}>
          <AlertTriangle size={24} color="#dc2626" />
          <Text style={styles.criticalTitle}>Pilar Crítico Prioritário</Text>
        </View>
        <Text style={styles.criticalPillarName}>
          {PILLAR_NAMES[result.criticalPillar]} (Nota: {result.pillarScores[result.criticalPillar]}/100)
        </Text>
        <Text style={styles.criticalText}>
          Este é o ponto com menor desempenho da organização e deve receber foco imediato no plano de ação corretiva.
        </Text>
      </View>

      {/* DETALHAMENTO DOS 5 PILARES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Desempenho por Pilar</Text>

        {(Object.keys(result.pillarScores) as Pillar[]).map((p) => {
          const score = result.pillarScores[p];
          const color = PILLAR_COLORS[p];
          return (
            <View key={p} style={styles.pillarProgressRow}>
              <View style={styles.pillarProgressHeader}>
                <Text style={styles.pillarNameText}>{PILLAR_NAMES[p]}</Text>
                <Text style={[styles.pillarScoreText, { color }]}>{score}/100</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${score}%`, backgroundColor: color }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* RECOMENDAÇÕES E PLANO DE AÇÃO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Plano de Ação Recomendado</Text>
        <Text style={styles.cardSubtitle}>
          Diretrizes prioritárias para evolução ecológica imediata:
        </Text>

        {result.recommendations.map((rec, i) => (
          <View key={i} style={styles.recommendationItem}>
            <CheckCircle size={18} color="#16a34a" style={styles.recIcon} />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* BOTÃO FINAL */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate("HomeTabs")}
        activeOpacity={0.8}
      >
        <Home size={20} color="#ffffff" />
        <Text style={styles.doneButtonText}>Voltar à Página Principal</Text>
      </TouchableOpacity>
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
  scoreCard: {
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
  instRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  instName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  dateText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 38,
    fontWeight: "900",
  },
  scoreMax: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
  },
  maturityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  maturityText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  maturityDesc: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  criticalCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  criticalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  criticalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#991b1b",
  },
  criticalPillarName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 4,
  },
  criticalText: {
    fontSize: 13,
    color: "#7f1d1d",
    lineHeight: 18,
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
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  pillarProgressRow: {
    marginBottom: 14,
  },
  pillarProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  pillarNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  pillarScoreText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  track: {
    height: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 5,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  recIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  doneButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
