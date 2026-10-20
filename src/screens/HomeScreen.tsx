import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { StorageService, QuizDraft } from "../services/storage";
import { PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { Pillar } from "../types";
import { Zap, Droplets, Trash2, Package, Award, Play, RotateCcw, Building2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const POPULAR_SECTORS = [
  { label: "Saúde & Clínicas", icon: "🏥" },
  { label: "Educação & Escolas", icon: "🎓" },
  { label: "Tecnologia & TI", icon: "💻" },
  { label: "Comércio & Varejo", icon: "🛒" },
  { label: "Indústria & Fábricas", icon: "🏭" },
  { label: "Alimentação & Bares", icon: "🍽️" },
  { label: "Hotelaria & Turismo", icon: "🏨" },
  { label: "Serviços & Escritórios", icon: "🏢" },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [institutionName, setInstitutionName] = useState("");
  const [sector, setSector] = useState("");
  const [totalDiagnostics, setTotalDiagnostics] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [draft, setDraft] = useState<QuizDraft | null>(null);

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
    const currentDraft = await StorageService.getQuizDraft();
    setDraft(currentDraft);
  };

  const handleResumeDraft = () => {
    if (!draft) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    navigation.navigate("Quiz", {
      institutionName: draft.institutionName,
      sector: sector.trim() || "Geral",
      resumeDraft: true,
    });
  };

  const handleDiscardDraft = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    await StorageService.clearQuizDraft();
    setDraft(null);
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const handleStart = async () => {
    const finalName = institutionName.trim() || "Minha Organização";
    const finalSector = sector.trim() || "Geral";
    await StorageService.saveInstitution({
      name: finalName,
      sector: finalSector,
      city: "",
      state: "",
    });

    navigation.navigate("Quiz", {
      institutionName: finalName,
      sector: finalSector,
    });
  };

  const handleSelectSectorChip = (chipLabel: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setSector(chipLabel);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER HERO */}
        <View style={styles.heroCard}>
          <Image
            source={require("../../assets/avatar-github.png")}
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

        {/* CARD DE RASCUNHO EM ANDAMENTO */}
        {draft && Object.keys(draft.answers).length > 0 && (
          <View style={styles.draftCard}>
            <View style={styles.draftHeader}>
              <View style={styles.draftBadge}>
                <RotateCcw size={15} color="#d97706" />
                <Text style={styles.draftBadgeText}>Rascunho Não Finalizado</Text>
              </View>
              <Text style={styles.draftPercentText}>
                {Math.round((Object.keys(draft.answers).length / 20) * 100)}% concluído
              </Text>
            </View>

            <Text style={styles.draftTitle}>{draft.institutionName}</Text>
            <Text style={styles.draftDesc}>
              Você já respondeu {Object.keys(draft.answers).length} de 20 questões desta avaliação.
            </Text>

            <View style={styles.draftActionsRow}>
              <TouchableOpacity
                style={styles.draftDiscardBtn}
                onPress={handleDiscardDraft}
                activeOpacity={0.7}
              >
                <Text style={styles.draftDiscardText}>Descartar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.draftResumeBtn}
                onPress={handleResumeDraft}
                activeOpacity={0.8}
              >
                <Play size={14} color="#ffffff" fill="#ffffff" />
                <Text style={styles.draftResumeText}>Continuar de Onde Parou</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* DADOS DA INSTITUIÇÃO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados da Organização Avaliada</Text>
          <Text style={styles.cardDescription}>
            Personalize o diagnóstico e o plano de ação estratégico com Inteligência Artificial:
          </Text>

          <Text style={styles.inputLabel}>Nome da Empresa ou Instituição:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Hospital São Lucas, Colégio Alfa, Tech Soluções..."
            placeholderTextColor="#9ca3af"
            value={institutionName}
            onChangeText={setInstitutionName}
          />

          <View style={styles.sectorLabelRow}>
            <Text style={styles.inputLabel}>Setor de Atuação (para IA Hiper-Personalizada):</Text>
            {sector.length > 0 && (
              <TouchableOpacity onPress={() => setSector("")}>
                <Text style={styles.clearSectorText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CHIPS RÁPIDOS DE SETORES POPULARES */}
          <View style={styles.sectorChipsContainer}>
            {POPULAR_SECTORS.map((s) => {
              const isSelected = sector.toLowerCase().includes(s.label.split(" ")[0].toLowerCase());
              return (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.sectorChip, isSelected && styles.sectorChipActive]}
                  onPress={() => handleSelectSectorChip(s.label)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.sectorChipIcon}>{s.icon}</Text>
                  <Text
                    style={[
                      styles.sectorChipText,
                      isSelected && styles.sectorChipTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ou digite outro setor personalizado..."
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
          Eco Diagnóstico Mobile • Metodologia Integrada com Inteligência Artificial
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandGreenLight: {
    fontSize: 26,
    fontWeight: "900",
    color: "#16a34a",
  },
  brandGreenDark: {
    fontSize: 26,
    fontWeight: "900",
    color: "#15803d",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
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
  draftCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#fde68a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  draftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  draftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  draftBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b45309",
    textTransform: "uppercase",
  },
  draftPercentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d97706",
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#78350f",
    marginBottom: 4,
  },
  draftDesc: {
    fontSize: 13,
    color: "#92400e",
    marginBottom: 14,
    lineHeight: 18,
  },
  draftActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  draftDiscardBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
    alignItems: "center",
    justifyContent: "center",
  },
  draftDiscardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400e",
  },
  draftResumeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#d97706",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  draftResumeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
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
  cardDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 14,
    lineHeight: 18,
  },
  sectorLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  clearSectorText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
  },
  sectorChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 10,
  },
  sectorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectorChipActive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#10b981",
  },
  sectorChipIcon: {
    fontSize: 13,
  },
  sectorChipText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  sectorChipTextActive: {
    color: "#059669",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14.5,
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
    marginTop: 12,
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
