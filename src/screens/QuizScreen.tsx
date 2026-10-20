import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
  Platform,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { allQuestions, PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { calculateDiagnosticResult } from "../services/calc";
import { StorageService } from "../services/storage";
import { ArrowLeft, ArrowRight, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Pillar } from "../types";

const PILLAR_THEMES: Record<Pillar, { border: string; bg: string }> = {
  [Pillar.ENERGIA]: {
    border: "#d97706", // Amber nítido e elegante
    bg: "#fffbeb",     // Fundo pastel sólido
  },
  [Pillar.AGUA]: {
    border: "#0284c7", // Sky blue
    bg: "#f0f9ff",
  },
  [Pillar.RESIDUOS]: {
    border: "#16a34a", // Verde esmeralda
    bg: "#f0fdf4",
  },
  [Pillar.MATERIAIS]: {
    border: "#ea580c", // Laranja queimado
    bg: "#fff7ed",
  },
  [Pillar.GESTAO]: {
    border: "#7c3aed", // Roxo elegante
    bg: "#faf5ff",
  },
};

type QuizScreenRouteProp = RouteProp<RootStackParamList, "Quiz">;

export default function QuizScreen() {
  const route = useRoute<QuizScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const institutionName = route.params?.institutionName || "Instituição";
  const sector = route.params?.sector || "Geral";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const isCompletedRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const currentQuestion = allQuestions[currentIndex];
  const totalQuestions = allQuestions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const selectedScore = answers[currentQuestion.id];

  // Recupera rascunho anterior se existir
  useEffect(() => {
    const checkDraft = async () => {
      const draft = await StorageService.getQuizDraft();
      if (draft && Object.keys(draft.answers).length > 0) {
        if (route.params?.resumeDraft) {
          setAnswers(draft.answers);
          setCurrentIndex(Math.min(draft.currentIndex, totalQuestions - 1));
        } else {
          Alert.alert(
            "Continuar Rascunho?",
            `Encontramos uma avaliação em andamento com ${Object.keys(draft.answers).length} resposta(s) para "${draft.institutionName}". Deseja continuar?`,
            [
              {
                text: "Começar do Zero",
                style: "destructive",
                onPress: async () => {
                  await StorageService.clearQuizDraft();
                },
              },
              {
                text: "Sim, Continuar",
                onPress: () => {
                  setAnswers(draft.answers);
                  setCurrentIndex(Math.min(draft.currentIndex, totalQuestions - 1));
                },
              },
            ]
          );
        }
      }
    };
    checkDraft();
  }, []);

  // Intercepta botão voltar com opção de salvar rascunho ou descartar
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isCompletedRef.current) {
        return;
      }
      e.preventDefault();

      Alert.alert(
        "Pausar Questionário",
        "Você pode salvar seu progresso para continuar mais tarde ou descartar as respostas.",
        [
          { text: "Continuar Respondendo", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: async () => {
              await StorageService.clearQuizDraft();
              isCompletedRef.current = true;
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: "Salvar e Sair",
            onPress: async () => {
              await StorageService.saveQuizDraft({
                institutionName,
                currentIndex,
                answers,
                updatedAt: new Date().toISOString(),
              });
              isCompletedRef.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, currentIndex, answers, institutionName]);

  // Garante que o scroll volte ao topo a cada nova pergunta
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentIndex]);

  const handleSelectOption = (score: number) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {
      if (Platform.OS !== "web") {
        Vibration.vibrate(35);
      }
    }
    const updated = {
      ...answers,
      [currentQuestion.id]: score,
    };
    setAnswers(updated);
    StorageService.saveQuizDraft({
      institutionName,
      currentIndex,
      answers: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleNext = () => {
    if (selectedScore === undefined) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
      Alert.alert(
        "Selecione uma alternativa",
        "Por favor, escolha uma das opções antes de prosseguir."
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (currentIndex < totalQuestions - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      StorageService.saveQuizDraft({
        institutionName,
        currentIndex: nextIdx,
        answers,
        updatedAt: new Date().toISOString(),
      });
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      StorageService.saveQuizDraft({
        institutionName,
        currentIndex: prevIdx,
        answers,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const finishQuiz = async () => {
    // Verifica se todas foram respondidas
    const unanswered = allQuestions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
      Alert.alert(
        "Questionário Incompleto",
        `Faltam ${unanswered.length} questão(ões) a responder.`
      );
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      if (Platform.OS !== "web") {
        Vibration.vibrate([0, 50, 40, 80]);
      }
    }

    isCompletedRef.current = true;
    const result = calculateDiagnosticResult(institutionName, answers, allQuestions, sector);
    await StorageService.saveDiagnostic(result);
    await StorageService.clearQuizDraft();

    navigation.replace("Result", { result });
  };

  const pillarColor = PILLAR_COLORS[currentQuestion.pillar];
  const currentTheme = PILLAR_THEMES[currentQuestion.pillar] || {
    border: "#16a34a",
    bg: "#f0fdf4",
  };
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <View style={styles.container}>
      {/* HEADER DE PROGRESSO */}
      <View style={styles.header}>
        <View style={styles.progressInfoRow}>
          <Text style={styles.progressText}>
            Pergunta {currentIndex + 1} de {totalQuestions}
          </Text>
          <Text style={styles.percentText}>{progressPercent}%</Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%`, backgroundColor: currentTheme.border },
            ]}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
      >
        {/* BADGE DO PILAR */}
        <View style={[styles.pillarBadge, { backgroundColor: currentTheme.bg, borderColor: currentTheme.border, borderWidth: 1 }]}>
          <View style={[styles.pillarDot, { backgroundColor: currentTheme.border }]} />
          <Text style={[styles.pillarBadgeText, { color: currentTheme.border }]}>
            {PILLAR_NAMES[currentQuestion.pillar]}
          </Text>
        </View>

        {/* TÍTULO E DESCRIÇÃO DA QUESTÃO */}
        <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
        {currentQuestion.description && (
          <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
        )}

        {/* ALTERNATIVAS */}
        <View style={styles.optionsList}>
          {currentQuestion.options.map((opt, optIdx) => {
            const isSelected = selectedScore === opt.score;
            const letter = optionLetters[optIdx] || `${optIdx + 1}`;

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionCard,
                  isSelected && {
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.bg,
                  },
                ]}
                onPress={() => handleSelectOption(opt.score)}
                activeOpacity={0.85}
              >
                <View style={styles.optionContentRow}>
                  <View
                    style={[
                      styles.letterBadge,
                      isSelected && {
                        backgroundColor: currentTheme.border,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.letterText,
                        isSelected && styles.letterTextSelected,
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.text}
                  </Text>

                  {isSelected ? (
                    <View
                      style={[
                        styles.checkCircleSelected,
                        { backgroundColor: currentTheme.border },
                      ]}
                    >
                      <Check size={13} color="#ffffff" strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={styles.checkCircleUnselected} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER COM BOTÕES */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentIndex === 0 && styles.buttonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={currentIndex === 0 ? "#9ca3af" : "#374151"} />
          <Text style={[styles.prevButtonText, currentIndex === 0 && { color: "#9ca3af" }]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            { backgroundColor: currentTheme.border },
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === totalQuestions - 1 ? "Concluir Avaliação" : "Próxima"}
          </Text>
          <ArrowRight size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  percentText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  pillarBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
    gap: 6,
  },
  pillarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillarBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  questionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 26,
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#64748b",
  },
  letterTextSelected: {
    color: "#ffffff",
    fontWeight: "800",
  },
  optionContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircleSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  optionText: {
    flex: 1,
    fontSize: 14.5,
    color: "#334155",
    lineHeight: 21,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#0f172a",
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  prevButton: {
    backgroundColor: "#f3f4f6",
  },
  prevButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  nextButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
