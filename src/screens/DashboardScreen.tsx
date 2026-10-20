import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { StorageService } from "../services/storage";
import { DiagnosticResult, Pillar } from "../types";
import { PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { LayoutDashboard, TrendingUp, AlertCircle, CheckCircle2, Play, PieChart, BarChart2 } from "lucide-react-native";
import RadarChart from "../components/RadarChart";
import * as Haptics from "expo-haptics";

export default function DashboardScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [latest, setLatest] = useState<DiagnosticResult | null>(null);
  const [viewMode, setViewMode] = useState<"radar" | "bars">("radar");

  const handleToggleView = (mode: "radar" | "bars") => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    setViewMode(mode);
  };


  const loadLatest = async () => {
    const list = await StorageService.getDiagnostics();
    if (list.length > 0) {
      setLatest(list[0]);
    } else {
      setLatest(null);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadLatest();
    }
  }, [isFocused]);

  if (!latest) {
    return (
      <View style={styles.emptyContainer}>
        <LayoutDashboard size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Nenhum Diagnóstico Realizado</Text>
        <Text style={styles.emptySubtitle}>
          Realize o primeiro questionário para visualizar as métricas dos 5 pilares ambientais.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate("Quiz", { institutionName: "Minha Organização" })}
        >
          <Play size={18} color="#ffffff" fill="#ffffff" />
          <Text style={styles.emptyButtonText}>Começar Agora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Encontra pilar mais forte e mais fraco
  let bestPillar: Pillar = Pillar.ENERGIA;
  let bestScore = -1;
  if (latest.pillarScores) {
    (Object.keys(latest.pillarScores) as Pillar[]).forEach((p) => {
      const score = latest.pillarScores[p] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        bestPillar = p;
      }
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom + 24, 40) },
      ]}
    >
      {/* CARD DO ÚLTIMO DIAGNÓSTICO */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryInst}>{latest.institutionName}</Text>
            <Text style={styles.summaryDate}>
              Última avaliação: {new Date(latest.completedAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{latest.overallScore}</Text>
            <Text style={styles.scoreBadgeSub}>/100</Text>
          </View>
        </View>

        <View style={styles.rowCards}>
          <View style={[styles.miniCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
            <CheckCircle2 size={18} color="#16a34a" />
            <Text style={styles.miniCardLabel}>Maior Destaque</Text>
            <Text style={[styles.miniCardValue, { color: "#15803d" }]}>
              {PILLAR_NAMES[bestPillar] || "Não avaliado"} ({bestScore >= 0 ? bestScore : 0} pts)
            </Text>
          </View>

          <View style={[styles.miniCard, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <AlertCircle size={18} color="#dc2626" />
            <Text style={styles.miniCardLabel}>Ponto Crítico</Text>
            <Text style={[styles.miniCardValue, { color: "#b91c1c" }]}>
              {PILLAR_NAMES[latest.criticalPillar] || "Não avaliado"} ({latest.pillarScores?.[latest.criticalPillar] ?? 0} pts)
            </Text>
          </View>
        </View>
      </View>

      {/* SELETOR DE MODO DE VISUALIZAÇÃO */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === "radar" && styles.toggleBtnActive,
          ]}
          onPress={() => handleToggleView("radar")}
          activeOpacity={0.8}
        >
          <PieChart size={16} color={viewMode === "radar" ? "#16a34a" : "#64748b"} />
          <Text
            style={[
              styles.toggleBtnText,
              viewMode === "radar" && styles.toggleBtnTextActive,
            ]}
          >
            Gráfico Teia / Radar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            viewMode === "bars" && styles.toggleBtnActive,
          ]}
          onPress={() => handleToggleView("bars")}
          activeOpacity={0.8}
        >
          <BarChart2 size={16} color={viewMode === "bars" ? "#16a34a" : "#64748b"} />
          <Text
            style={[
              styles.toggleBtnText,
              viewMode === "bars" && styles.toggleBtnTextActive,
            ]}
          >
            Barras por Dimensão
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO VISUAL DINÂMICO */}
      {viewMode === "radar" ? (
        <RadarChart pillarScores={latest.pillarScores} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desempenho nos 5 Pilares ESG</Text>
          <Text style={styles.cardSub}>
            Média consolidada de conformidade e maturidade ecológica:
          </Text>

          {(Object.keys(latest.pillarScores || {}) as Pillar[]).map((p) => {
            const score = latest.pillarScores?.[p] ?? 0;
            const color = PILLAR_COLORS[p] || "#16a34a";
            return (
              <View key={p} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>{PILLAR_NAMES[p]}</Text>
                  <Text style={[styles.barScore, { color }]}>{score}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* BOTÃO PARA REFAZER / NOVO DIAGNÓSTICO */}
      <TouchableOpacity
        style={styles.retestButton}
        onPress={() => navigation.navigate("Quiz", { institutionName: latest.institutionName })}
      >
        <TrendingUp size={20} color="#ffffff" />
        <Text style={styles.retestButtonText}>Realizar Nova Avaliação</Text>
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#f9fafb",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  summaryCard: {
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
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryInst: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  summaryDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  scoreBadgeText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#059669",
  },
  scoreBadgeSub: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  rowCards: {
    gap: 10,
  },
  miniCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  miniCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginTop: 4,
  },
  miniCardValue: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
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
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  barItem: {
    marginBottom: 14,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  barScore: {
    fontSize: 14,
    fontWeight: "bold",
  },
  barTrack: {
    height: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  retestButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  retestButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 9,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  toggleBtnTextActive: {
    color: "#16a34a",
    fontWeight: "700",
  },
});

