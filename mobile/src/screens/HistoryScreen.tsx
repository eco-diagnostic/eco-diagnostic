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
import { RootStackParamList } from "../navigation/types";
import { StorageService } from "../services/storage";
import { DiagnosticResult } from "../types";
import { PILLAR_NAMES } from "../data/questions";
import { History, Trash2, ChevronRight, Calendar, AlertTriangle } from "lucide-react-native";

export default function HistoryScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
    Alert.alert(
      "Limpar Histórico",
      "Deseja realmente apagar todos os diagnósticos salvos no dispositivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            await StorageService.clearDiagnostics();
            setHistory([]);
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
        onPress={() => navigation.navigate("Result", { result: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardInstName}>{item.institutionName}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.scoreBadgeText, { color }]}>{item.overallScore} pts</Text>
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
          contentContainerStyle={styles.listContent}
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
});
