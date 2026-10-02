import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { allQuestions, PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { calculateDiagnosticResult } from "../services/calc";
import { StorageService } from "../services/storage";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react-native";

type QuizScreenRouteProp = RouteProp<RootStackParamList, "Quiz">;

export default function QuizScreen() {
  const route = useRoute<QuizScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const institutionName = route.params?.institutionName || "Instituição";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = allQuestions[currentIndex];
  const totalQuestions = allQuestions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const selectedScore = answers[currentQuestion.id];

  const handleSelectOption = (score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: score,
    }));
  };

  const handleNext = () => {
    if (selectedScore === undefined) {
      Alert.alert(
        "Selecione uma alternativa",
        "Por favor, escolha uma das opções antes de prosseguir."
      );
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finishQuiz = async () => {
    // Verifica se todas foram respondidas
    const unanswered = allQuestions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      Alert.alert(
        "Questionário Incompleto",
        `Faltam ${unanswered.length} questão(ões) a responder.`
      );
      return;
    }

    const result = calculateDiagnosticResult(institutionName, answers, allQuestions);
    await StorageService.saveDiagnostic(result);

    navigation.replace("Result", { result });
  };

  const pillarColor = PILLAR_COLORS[currentQuestion.pillar];

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
              { width: `${progressPercent}%`, backgroundColor: pillarColor },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.content}>
        {/* BADGE DO PILAR */}
        <View style={[styles.pillarBadge, { backgroundColor: `${pillarColor}15` }]}>
          <View style={[styles.pillarDot, { backgroundColor: pillarColor }]} />
          <Text style={[styles.pillarBadgeText, { color: pillarColor }]}>
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
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedScore === opt.score;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  isSelected && { borderColor: pillarColor },
                ]}
                onPress={() => handleSelectOption(opt.score)}
                activeOpacity={0.8}
              >
                <View style={styles.radioWrapper}>
                  {isSelected ? (
                    <CheckCircle2 size={22} color={pillarColor} />
                  ) : (
                    <Circle size={22} color="#d1d5db" />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER COM BOTÕES */}
      <View style={styles.footer}>
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
            { backgroundColor: pillarColor },
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
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  optionCardSelected: {
    backgroundColor: "#ffffff",
    shadowOpacity: 0.1,
    elevation: 3,
  },
  radioWrapper: {
    marginTop: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  optionTextSelected: {
    color: "#111827",
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
