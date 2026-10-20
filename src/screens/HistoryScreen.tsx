import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { StorageService } from "../services/storage";
import { DiagnosticResult, Pillar } from "../types";
import { PILLAR_NAMES } from "../data/questions";
import { History, Trash2, ChevronRight, Calendar, AlertTriangle, TrendingUp, TrendingDown, Minus, Award, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function HistoryScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<DiagnosticResult[]>([]);

  const loadHistory = async () => {
    const list = await StorageService.getDiagnostics();
    setHistory(list);
  };

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const handleClear = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    Alert.alert(
      "Limpar Histórico",
      "Deseja realmente apagar todos os diagnósticos salvos no dispositivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (e) {}
            await StorageService.clearDiagnostics();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleDeleteOne = (id: string, name: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    Alert.alert(
      "Excluir Avaliação",
      `Deseja excluir a avaliação da "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (e) {}
            await StorageService.deleteDiagnostic(id);
            setHistory((prev) => prev.filter((d) => d.id !== id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: DiagnosticResult }) => {
    const dateFormatted = new Date(item.completedAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const getScoreColor = (score: number) => {
      if (score >= 90) return "#059669";
      if (score >= 70) return "#16a34a";
      if (score >= 40) return "#f59e0b";
      return "#ef4444";
    };

    const color = getScoreColor(item.overallScore);

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (e) {}
          navigation.navigate("Result", { result: item });
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardInstName} numberOfLines={1}>{item.institutionName}</Text>
          <View style={styles.headerRightActions}>
            {item.aiConsultancy && (
              <View style={styles.aiHistoryBadge}>
                <Sparkles size={11} color="#059669" />
                <Text style={styles.aiHistoryBadgeText}>IA</Text>
              </View>
            )}
            <View style={[styles.scoreBadge, { backgroundColor: `${color}15` }]}>
              <Text style={[styles.scoreBadgeText, { color }]}>{item.overallScore} pts</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteItemBtn}
              onPress={() => handleDeleteOne(item.id, item.institutionName)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.dateText}>{dateFormatted}</Text>
        </View>

        <View style={styles.criticalPillarRow}>
          <AlertTriangle size={14} color="#dc2626" />
          <Text style={styles.criticalPillarText}>
            Pilar Crítico: {PILLAR_NAMES[item.criticalPillar]}
          </Text>
        </View>

        <View style={styles.arrowRow}>
          <Text style={styles.viewDetailsText}>Ver detalhes e recomendações</Text>
          <ChevronRight size={16} color="#16a34a" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEvolutionHeader = () => {
    if (history.length < 2) return null;

    const latest = history[0];
    const prev = history[1];
    const scoreDiff = latest.overallScore - prev.overallScore;

    // Encontra pilar de maior ganho
    let bestGainPillar: Pillar | null = null;
    let maxGain = -999;
    (Object.keys(latest.pillarScores) as Pillar[]).forEach((p) => {
      const diff = (latest.pillarScores[p] ?? 0) - (prev.pillarScores[p] ?? 0);
      if (diff > maxGain) {
        maxGain = diff;
        bestGainPillar = p;
      }
    });

    const isPositive = scoreDiff > 0;
    const isNegative = scoreDiff < 0;
    const diffColor = isPositive ? "#16a34a" : isNegative ? "#dc2626" : "#64748b";
    const diffBg = isPositive ? "#f0fdf4" : isNegative ? "#fef2f2" : "#f8fafc";
    const diffBorder = isPositive ? "#bbf7d0" : isNegative ? "#fecaca" : "#e2e8f0";

    return (
      <View style={[styles.evolutionCard, { backgroundColor: diffBg, borderColor: diffBorder }]}>
        <View style={styles.evolutionHeader}>
          <View style={styles.evolutionTitleRow}>
            {isPositive ? (
              <TrendingUp size={18} color="#16a34a" />
            ) : isNegative ? (
              <TrendingDown size={18} color="#dc2626" />
            ) : (
              <Minus size={18} color="#64748b" />
            )}
            <Text style={styles.evolutionTitle}>Evolução Entre Avaliações</Text>
          </View>
          <View style={[styles.evolutionBadge, { backgroundColor: diffColor }]}>
            <Text style={styles.evolutionBadgeText}>
              {scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`} pts
            </Text>
          </View>
        </View>

        <Text style={styles.evolutionDesc}>
          Comparativo da avaliação mais recente com a anterior (
          {new Date(prev.completedAt).toLocaleDateString("pt-BR")}).
        </Text>

        {bestGainPillar && maxGain > 0 && (
          <View style={styles.evolutionPillarGainRow}>
            <Award size={14} color="#16a34a" />
            <Text style={styles.evolutionPillarGainText}>
              Maior evolução: <Text style={{ fontWeight: "700" }}>{PILLAR_NAMES[bestGainPillar]}</Text> (+{maxGain} pts)
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {history.length > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.countText}>{history.length} avaliação(ões) salva(s)</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Trash2 size={16} color="#dc2626" />
            <Text style={styles.clearBtnText}>Limpar Tudo</Text>
          </TouchableOpacity>
        </View>
      )}

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <History size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhum Registro Salvo</Text>
          <Text style={styles.emptySubtitle}>
            Quando você concluir diagnósticos, o histórico das avaliações ficará disponível offline aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderEvolutionHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 20, 30) },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  countText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearBtnText: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardInstName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  aiHistoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    gap: 3,
  },
  aiHistoryBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteItemBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#6b7280",
  },
  criticalPillarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    marginBottom: 10,
  },
  criticalPillarText: {
    fontSize: 13,
    color: "#991b1b",
    fontWeight: "600",
  },
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  evolutionCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  evolutionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  evolutionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  evolutionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
  },
  evolutionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  evolutionBadgeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
  evolutionDesc: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
    marginBottom: 8,
  },
  evolutionPillarGainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  evolutionPillarGainText: {
    fontSize: 12,
    color: "#166534",
  },
});
