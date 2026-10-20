import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { Pillar, DiagnosticResult, AiConsultancyResult } from "../types";
import {
  AlertTriangle,
  CheckCircle,
  Home,
  Sparkles,
  Share2,
  FileText,
  Printer,
  RotateCw,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Send,
  Zap,
  Building2,
} from "lucide-react-native";
import RadarChart from "../components/RadarChart";
import * as Haptics from "expo-haptics";
import {
  generateAndSharePdfReport,
  printPdfReport,
  getReportFilename,
} from "../services/pdfReport";
import { generateAiConsultancy } from "../services/aiService";
import { StorageService } from "../services/storage";

type ResultScreenRouteProp = RouteProp<RootStackParamList, "Result">;

export default function ResultScreen() {
  const route = useRoute<ResultScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [currentResult, setCurrentResult] = useState<DiagnosticResult>(route.params.result);
  const [aiConsultancy, setAiConsultancy] = useState<AiConsultancyResult | null>(
    route.params.result.aiConsultancy || null
  );
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const getMaturityInfo = () => {
    switch (currentResult.maturityLevel) {
      case "SUSTENTAVEL":
        return {
          label: "Nível Sustentável",
          color: "#059669",
          bg: "#ecfdf5",
          desc: "Práticas exemplares e governança consolidada.",
        };
      case "AVANCADO":
        return {
          label: "Nível Avançado",
          color: "#16a34a",
          bg: "#f0fdf4",
          desc: "Ações estruturadas com metas sólidas em andamento.",
        };
      case "EM_DESENVOLVIMENTO":
        return {
          label: "Em Desenvolvimento",
          color: "#f59e0b",
          bg: "#fffbeb",
          desc: "Iniciativas em evolução, demandando maior padronização.",
        };
      case "CRITICO":
      default:
        return {
          label: "Nível Crítico",
          color: "#ef4444",
          bg: "#fef2f2",
          desc: "Necessita de intervenção e investimentos prioritários urgentes.",
        };
    }
  };

  const mat = getMaturityInfo();
  const pdfFilename = getReportFilename(currentResult);
  const sectorLabel = currentResult.sector || "Geral";

  const handleGenerateAi = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoadingAi(true);
      setAiError(null);

      const aiData = await generateAiConsultancy(currentResult);
      const updated: DiagnosticResult = {
        ...currentResult,
        aiConsultancy: aiData,
      };

      setCurrentResult(updated);
      setAiConsultancy(aiData);
      await StorageService.saveDiagnostic(updated);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.warn("AI generation failed:", err);
      setAiError(err?.message || "Não foi possível conectar com o serviço de IA no momento.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleShareAiConsultancy = async () => {
    if (!aiConsultancy) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const lines = [
        `🤖 *Plano de Ação Estratégico ESG (IA Gemini)*`,
        `🏢 *Organização:* ${currentResult.institutionName}`,
        `🏷️ *Setor de Atuação:* ${sectorLabel}`,
        `⭐ *Nota Geral:* ${currentResult.overallScore}/100 (${mat.label})`,
        ``,
        `📋 *Resumo Executivo:*`,
        aiConsultancy.executiveSummary,
        ``,
        aiConsultancy.sectorContext
          ? `📊 *Contexto & Benchmark Setorial:*\n${aiConsultancy.sectorContext}\n\n`
          : "",
        aiConsultancy.sectorQuickWin
          ? `⚡ *Quick Win Setorial:*\n${aiConsultancy.sectorQuickWin}\n\n`
          : "",
        `⚠️ *Gargalo Prioritário:*`,
        aiConsultancy.criticalPillarDiagnosis,
        ``,
        `🎯 *Iniciativas Estratégicas Prioritárias:*`,
        ...aiConsultancy.initiatives.map(
          (init, idx) =>
            `\n${idx + 1}. *${init.title}* [${init.pillar}]\n` +
            `   • Impacto: ${init.impact} | Esforço: ${init.effort}\n` +
            `   • Ação Prática: ${init.description}\n` +
            `   • Retorno Esperado: ${init.estimatedReturn}`
        ),
        ``,
        `🏛️ *Diretriz de Governança:*`,
        aiConsultancy.governanceTip,
        ``,
        `_Gerado pelo aplicativo Eco Diagnóstico Mobile com Google Gemini._`,
      ].join("\n");

      await Share.share({
        message: lines,
        title: `Consultoria ESG IA - ${currentResult.institutionName}`,
      });
    } catch (e) {
      console.warn("Share AI error:", e);
    }
  };

  const handleSharePdf = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsGeneratingPdf(true);
      await generateAndSharePdfReport(currentResult);
    } catch (e: any) {
      console.warn("PDF export error:", e);
      const errorMsg = String(e?.message || e);
      if (
        !errorMsg.toLowerCase().includes("cancel") &&
        !errorMsg.toLowerCase().includes("dismiss")
      ) {
        Alert.alert(
          "Erro ao Gerar Relatório",
          errorMsg || "Não foi possível criar o documento PDF no momento."
        );
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintPdf = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsPrinting(true);
      await printPdfReport(currentResult);
    } catch (e: any) {
      console.warn("PDF print preview error:", e);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShareText = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const dateStr = new Date(currentResult.completedAt).toLocaleDateString("pt-BR");
      const recsText = currentResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n");
      const message =
        `🌿 *Relatório de Diagnóstico Ecológico ESG*\n` +
        `🏢 *Organização:* ${currentResult.institutionName} (${sectorLabel})\n` +
        `📅 *Data:* ${dateStr}\n` +
        `⭐ *Nota Geral:* ${currentResult.overallScore}/100 — ${mat.label}\n\n` +
        `⚠️ *Pilar Crítico Prioritário:* ${PILLAR_NAMES[currentResult.criticalPillar]} (${currentResult.pillarScores[currentResult.criticalPillar]} pts)\n\n` +
        `📊 *Desempenho por Dimensão:*\n` +
        `• ⚡ Energia: ${currentResult.pillarScores.ENERGIA}/100\n` +
        `• 💧 Água: ${currentResult.pillarScores.AGUA}/100\n` +
        `• ♻️ Resíduos: ${currentResult.pillarScores.RESIDUOS}/100\n` +
        `• 📦 Materiais: ${currentResult.pillarScores.MATERIAIS}/100\n` +
        `• 🏛️ Governança: ${currentResult.pillarScores.GESTAO}/100\n\n` +
        `💡 *Ações Recomendadas:*\n${recsText}\n\n` +
        `_Gerado pelo aplicativo Eco Diagnóstico Mobile._`;

      await Share.share({
        message,
        title: `Diagnóstico ESG - ${currentResult.institutionName}`,
      });
    } catch (e) {
      console.warn("Share error:", e);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
    >
      {/* HEADER DO RESULTADO */}
      <View style={styles.scoreCard}>
        <View style={styles.instRow}>
          <Text style={styles.instName}>{currentResult.institutionName}</Text>
          <View style={styles.instSubRow}>
            <View style={styles.sectorBadgePill}>
              <Building2 size={12} color="#0369a1" />
              <Text style={styles.sectorBadgePillText}>{sectorLabel}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(currentResult.completedAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>

        {/* NOTA GERAL */}
        <View style={[styles.scoreCircle, { borderColor: mat.color }]}>
          <Text style={[styles.scoreValue, { color: mat.color }]}>
            {currentResult.overallScore}
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
          {PILLAR_NAMES[currentResult.criticalPillar]} (Nota: {currentResult.pillarScores[currentResult.criticalPillar]}/100)
        </Text>
        <Text style={styles.criticalText}>
          Este é o ponto com menor desempenho da organização e deve receber foco imediato no plano de ação corretiva.
        </Text>
      </View>

      {/* GRÁFICO RADAR DOS 5 PILARES */}
      <RadarChart pillarScores={currentResult.pillarScores} />

      {/* DETALHAMENTO DOS 5 PILARES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Desempenho por Pilar</Text>

        {(Object.keys(currentResult.pillarScores) as Pillar[]).map((p) => {
          const score = currentResult.pillarScores[p];
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

      {/* ========================================================= */}
      {/* SEÇÃO DA INTELIGÊNCIA ARTIFICIAL (GEMINI 3.8)             */}
      {/* ========================================================= */}
      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <View style={styles.aiHeaderLeft}>
            <View style={styles.aiIconBadge}>
              <Cpu size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiTitle}>Consultoria com IA</Text>
                <View style={styles.aiTag}>
                  <Zap size={11} color="#059669" />
                  <Text style={styles.aiTagText}>Gemini 3.8</Text>
                </View>
              </View>
              <Text style={styles.aiSubtitle} numberOfLines={1}>
                {aiConsultancy
                  ? `Plano hiper-personalizado para o setor ${sectorLabel}`
                  : `Análise sob medida para o setor ${sectorLabel}`}
              </Text>
            </View>
          </View>
        </View>

        {/* ESTADO 1: CARREGANDO */}
        {isLoadingAi && (
          <View style={styles.aiLoadingBox}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.aiLoadingTitle}>O Gemini está analisando o setor {sectorLabel}...</Text>
            <Text style={styles.aiLoadingSub}>
              Cruzando indicadores operacionais de {currentResult.institutionName} e formulando iniciativas de alto impacto para {PILLAR_NAMES[currentResult.criticalPillar]}.
            </Text>
          </View>
        )}

        {/* ESTADO 2: ERRO */}
        {!isLoadingAi && aiError && (
          <View style={styles.aiErrorBox}>
            <AlertTriangle size={20} color="#dc2626" />
            <Text style={styles.aiErrorText}>{aiError}</Text>
            <TouchableOpacity
              style={styles.aiRetryButton}
              onPress={handleGenerateAi}
              activeOpacity={0.8}
            >
              <RotateCw size={15} color="#ffffff" />
              <Text style={styles.aiRetryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ESTADO 3: AINDA NÃO GERADO */}
        {!isLoadingAi && !aiConsultancy && !aiError && (
          <View style={styles.aiEmptyBox}>
            <View style={styles.aiSectorPillIntro}>
              <Building2 size={14} color="#0369a1" />
              <Text style={styles.aiSectorPillIntroText}>
                Foco no Setor: <Text style={{ fontWeight: "bold" }}>{sectorLabel}</Text>
              </Text>
            </View>

            <Text style={styles.aiEmptyDesc}>
              A Inteligência Artificial analisa os 5 pilares considerando a operação de <Text style={{ fontWeight: "700" }}>{sectorLabel}</Text> e formula:
            </Text>
            <View style={styles.aiBenefitList}>
              <View style={styles.aiBenefitItem}>
                <CheckCircle size={15} color="#059669" />
                <Text style={styles.aiBenefitText}>Diagnóstico Executivo do momento atual</Text>
              </View>
              <View style={styles.aiBenefitItem}>
                <CheckCircle size={15} color="#059669" />
                <Text style={styles.aiBenefitText}>Benchmark & Quick Win específico para {sectorLabel}</Text>
              </View>
              <View style={styles.aiBenefitItem}>
                <CheckCircle size={15} color="#059669" />
                <Text style={styles.aiBenefitText}>3 Iniciativas de Alto Impacto com retorno estimado</Text>
              </View>
              <View style={styles.aiBenefitItem}>
                <CheckCircle size={15} color="#059669" />
                <Text style={styles.aiBenefitText}>Diretrizes práticas de Governança para liderança</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.aiGenerateBtn}
              onPress={handleGenerateAi}
              activeOpacity={0.85}
            >
              <Sparkles size={18} color="#ffffff" />
              <Text style={styles.aiGenerateBtnText}>Gerar Plano de Ação por Setor com IA</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ESTADO 4: GERADO COM SUCESSO */}
        {!isLoadingAi && aiConsultancy && (
          <View style={styles.aiContentBox}>
            {/* RESUMO EXECUTIVO */}
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>Resumo Executivo da Situação</Text>
              <View style={styles.aiQuoteBox}>
                <Text style={styles.aiQuoteText}>"{aiConsultancy.executiveSummary}"</Text>
              </View>
            </View>

            {/* BENCHMARK & CONTEXTO SETORIAL */}
            {aiConsultancy.sectorContext ? (
              <View style={styles.aiSection}>
                <Text style={styles.aiSectionTitle}>Benchmark & Realidade do Setor</Text>
                <View style={styles.aiSectorBox}>
                  <Building2 size={16} color="#0369a1" style={{ marginTop: 2 }} />
                  <Text style={styles.aiSectorText}>{aiConsultancy.sectorContext}</Text>
                </View>
              </View>
            ) : null}

            {/* QUICK WIN ESPECÍFICO DO SETOR */}
            {aiConsultancy.sectorQuickWin ? (
              <View style={styles.aiQuickWinBox}>
                <View style={styles.aiQuickWinHeader}>
                  <Zap size={16} color="#059669" />
                  <Text style={styles.aiQuickWinTitle}>Quick Win Específico do Setor</Text>
                </View>
                <Text style={styles.aiQuickWinText}>{aiConsultancy.sectorQuickWin}</Text>
              </View>
            ) : null}

            {/* DIAGNÓSTICO DO PILAR CRÍTICO */}
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>Atenção Prioritária</Text>
              <View style={styles.aiPillarAlertBox}>
                <AlertTriangle size={16} color="#d97706" style={{ marginTop: 2 }} />
                <Text style={styles.aiPillarAlertText}>
                  {aiConsultancy.criticalPillarDiagnosis}
                </Text>
              </View>
            </View>

            {/* 3 INICIATIVAS PRIORITÁRIAS */}
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>Iniciativas Prioritárias de Alto Impacto</Text>
              {aiConsultancy.initiatives.map((init, index) => (
                <View key={index} style={styles.initiativeCard}>
                  <View style={styles.initHeader}>
                    <View style={styles.initNumberCircle}>
                      <Text style={styles.initNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.initTitle}>{init.title}</Text>
                  </View>

                  <View style={styles.initTagsRow}>
                    <View style={styles.initPillarTag}>
                      <Text style={styles.initPillarTagText}>{init.pillar}</Text>
                    </View>
                    <View
                      style={[
                        styles.initBadge,
                        {
                          backgroundColor:
                            init.impact === "Alto" ? "#ecfdf5" : "#fffbeb",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.initBadgeText,
                          {
                            color:
                              init.impact === "Alto" ? "#059669" : "#d97706",
                          },
                        ]}
                      >
                        Impacto {init.impact}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.initBadge,
                        {
                          backgroundColor:
                            init.effort === "Baixo"
                              ? "#ecfdf5"
                              : init.effort === "Médio"
                              ? "#f1f5f9"
                              : "#fef2f2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.initBadgeText,
                          {
                            color:
                              init.effort === "Baixo"
                                ? "#059669"
                                : init.effort === "Médio"
                                ? "#475569"
                                : "#dc2626",
                          },
                        ]}
                      >
                        Esforço {init.effort}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.initDesc}>{init.description}</Text>

                  <View style={styles.initReturnRow}>
                    <TrendingUp size={14} color="#16a34a" />
                    <Text style={styles.initReturnText}>{init.estimatedReturn}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* DIRETRIZ DE GOVERNANÇA */}
            <View style={styles.aiGovBox}>
              <View style={styles.aiGovHeader}>
                <ShieldCheck size={18} color="#059669" />
                <Text style={styles.aiGovTitle}>Diretriz de Governança Recomendada</Text>
              </View>
              <Text style={styles.aiGovText}>{aiConsultancy.governanceTip}</Text>
            </View>

            {/* BOTÕES DE SUPORTE DA IA */}
            <View style={styles.aiActionsRow}>
              <TouchableOpacity
                style={styles.aiSecondaryBtn}
                onPress={handleGenerateAi}
                activeOpacity={0.8}
              >
                <RotateCw size={14} color="#059669" />
                <Text style={styles.aiSecondaryBtnText}>Recalcular com IA</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.aiSecondaryBtn}
                onPress={handleShareAiConsultancy}
                activeOpacity={0.8}
              >
                <Send size={14} color="#059669" />
                <Text style={styles.aiSecondaryBtnText}>Compartilhar Plano IA</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.aiPdfInfoBadge}>
              <CheckCircle size={14} color="#059669" />
              <Text style={styles.aiPdfInfoText}>
                Este plano estratégico para o setor {sectorLabel} foi integrado ao seu Relatório PDF de 1 página.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* RECOMENDAÇÕES E PLANO DE AÇÃO BÁSICO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Diretrizes Complementares</Text>
        <Text style={styles.cardSubtitle}>
          Boas práticas recomendadas pelo questionário:
        </Text>

        {currentResult.recommendations.map((rec, i) => (
          <View key={i} style={styles.recommendationItem}>
            <CheckCircle size={18} color="#16a34a" style={styles.recIcon} />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* BOTÕES DE AÇÃO */}
      <View style={styles.actionButtonsCol}>
        {/* BOTÃO PRINCIPAL: COMPARTILHAR PDF COM O NOME BONITINHO */}
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={handleSharePdf}
          disabled={isGeneratingPdf || isPrinting}
          activeOpacity={0.8}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Share2 size={22} color="#ffffff" />
          )}
          <View style={styles.pdfBtnTextCol}>
            <Text style={styles.pdfButtonText}>
              {isGeneratingPdf ? "Gerando Relatório de 1 Página..." : "Compartilhar Relatório PDF"}
            </Text>
            <Text style={styles.pdfButtonSubtext} numberOfLines={1}>
              📄 {pdfFilename} {aiConsultancy ? "• com IA" : ""}
            </Text>
          </View>
        </TouchableOpacity>

        {/* BOTÃO SECUNDÁRIO: VISUALIZAR / IMPRIMIR PDF */}
        <TouchableOpacity
          style={styles.previewButton}
          onPress={handlePrintPdf}
          disabled={isGeneratingPdf || isPrinting}
          activeOpacity={0.8}
        >
          {isPrinting ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <Printer size={18} color="#059669" />
          )}
          <Text style={styles.previewButtonText}>Visualizar / Imprimir PDF (1 Página)</Text>
        </TouchableOpacity>

        {/* COMPARTILHAR TEXTO */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareText}
          activeOpacity={0.8}
        >
          <FileText size={18} color="#16a34a" />
          <Text style={styles.shareButtonText}>Compartilhar Resumo em Texto</Text>
        </TouchableOpacity>

        {/* VOLTAR AO INÍCIO */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate("HomeTabs")}
          activeOpacity={0.8}
        >
          <Home size={18} color="#ffffff" />
          <Text style={styles.doneButtonText}>Voltar à Página Principal</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827",
  },
  instSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  sectorBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectorBadgePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369a1",
  },
  dateText: {
    fontSize: 12,
    color: "#6b7280",
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

  /* ========================================================= */
  /* ESTILOS DA SEÇÃO DE INTELIGÊNCIA ARTIFICIAL               */
  /* ========================================================= */
  aiCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  aiHeader: {
    marginBottom: 14,
  },
  aiHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  aiSubtitle: {
    fontSize: 12.5,
    color: "#64748b",
    marginTop: 2,
  },
  aiLoadingBox: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  aiLoadingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
    marginTop: 14,
  },
  aiLoadingSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  aiErrorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  aiErrorText: {
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
  },
  aiRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  aiRetryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  aiEmptyBox: {
    paddingTop: 4,
  },
  aiSectorPillIntro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  aiSectorPillIntroText: {
    fontSize: 12.5,
    color: "#0369a1",
  },
  aiEmptyDesc: {
    fontSize: 13.5,
    color: "#334155",
    marginBottom: 10,
    lineHeight: 19,
  },
  aiBenefitList: {
    gap: 8,
    marginBottom: 16,
  },
  aiBenefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiBenefitText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  aiGenerateBtn: {
    backgroundColor: "#059669",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  aiGenerateBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  aiContentBox: {
    gap: 16,
    marginTop: 4,
  },
  aiSection: {
    gap: 6,
  },
  aiSectionTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  aiQuoteBox: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3.5,
    borderLeftColor: "#059669",
    padding: 12,
    borderRadius: 8,
  },
  aiQuoteText: {
    fontSize: 13.5,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 20,
  },
  aiSectorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    padding: 12,
    borderRadius: 10,
  },
  aiSectorText: {
    flex: 1,
    fontSize: 13,
    color: "#0369a1",
    lineHeight: 19,
  },
  aiQuickWinBox: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  aiQuickWinHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiQuickWinTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065f46",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  aiQuickWinText: {
    fontSize: 13,
    color: "#047857",
    lineHeight: 18,
    fontWeight: "500",
  },
  aiPillarAlertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
    borderRadius: 10,
  },
  aiPillarAlertText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  initiativeCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  initHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  initNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  initNumberText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  initTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  initTagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  initPillarTag: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  initPillarTagText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#0369a1",
  },
  initBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  initBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  initDesc: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 8,
  },
  initReturnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  initReturnText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#16a34a",
  },
  aiGovBox: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  aiGovHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiGovTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065f46",
  },
  aiGovText: {
    fontSize: 12.5,
    color: "#047857",
    lineHeight: 18,
  },
  aiActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  aiSecondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
    paddingVertical: 10,
    borderRadius: 10,
  },
  aiSecondaryBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#059669",
  },
  aiPdfInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 8,
  },
  aiPdfInfoText: {
    flex: 1,
    fontSize: 11.5,
    color: "#15803d",
    fontWeight: "500",
  },

  /* ========================================================= */
  /* BOTÕES PRINCIPAIS DE AÇÃO                                 */
  /* ========================================================= */
  actionButtonsCol: {
    gap: 12,
    marginTop: 8,
  },
  pdfButton: {
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  pdfBtnTextCol: {
    alignItems: "flex-start",
  },
  pdfButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pdfButtonSubtext: {
    color: "#d1fae5",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 2,
  },
  previewButton: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1.5,
    borderColor: "#a7f3d0",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewButtonText: {
    color: "#059669",
    fontSize: 14.5,
    fontWeight: "700",
  },
  shareButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareButtonText: {
    color: "#475569",
    fontSize: 14.5,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  doneButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
