import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { DiagnosticResult, Pillar } from "../types";
import { PILLAR_NAMES, PILLAR_COLORS } from "../data/questions";
import { LOGO_ECO_BASE64 } from "../assets/logoBase64";

/**
 * Converte uma string base64 para Uint8Array de forma confiável e rápida
 */
function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") bufferLength--;
  }
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (p < bufferLength) bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return bytes;
}

/**
 * Gera um nome limpo e amigável ("bonitinho") para o arquivo PDF
 * Exemplo: Relatorio-ESG-Escola-Verde-2026-10-19.pdf
 */
export function getReportFilename(result: DiagnosticResult): string {
  const cleanName = (result.institutionName || "Instituicao")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9]/g, "-") // substitui caracteres especiais por hífen
    .replace(/-+/g, "-") // remove hífens duplicados
    .replace(/^-|-$/g, "") // remove hífens das pontas
    .slice(0, 32);

  const dateStr = new Date(result.completedAt).toISOString().slice(0, 10);
  return `Relatorio-ESG-${cleanName || "Diagnostico"}-${dateStr}.pdf`;
}

/**
 * Gera o HTML do relatório rigorosamente calibrado para caber em exatamente 1 PÁGINA A4,
 * com nossa logo oficial em alta resolução, paleta ESG executiva e grid moderno.
 */
export function generatePdfHtml(result: DiagnosticResult): string {
  const dateFormatted = new Date(result.completedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getMaturityData = (level: string) => {
    switch (level) {
      case "SUSTENTAVEL":
        return {
          label: "Nível Sustentável",
          color: "#059669",
          bg: "#ecfdf5",
          desc: "Práticas exemplares de sustentabilidade corporativa, governança madura e gestão de impacto contínua.",
        };
      case "AVANCADO":
        return {
          label: "Nível Avançado",
          color: "#16a34a",
          bg: "#f0fdf4",
          desc: "Ações estruturadas com metas consolidadas, monitoramento sistemático e indicadores ativos.",
        };
      case "EM_DESENVOLVIMENTO":
        return {
          label: "Em Desenvolvimento",
          color: "#d97706",
          bg: "#fffbeb",
          desc: "Iniciativas em evolução que demandam formalização de processos, padronização e investimentos prioritários.",
        };
      case "CRITICO":
      default:
        return {
          label: "Nível Crítico",
          color: "#dc2626",
          bg: "#fef2f2",
          desc: "Vulnerabilidade ambiental elevada. Necessita de plano emergencial e alocação urgente de recursos.",
        };
    }
  };

  const mat = getMaturityData(result.maturityLevel);
  const ai = result.aiConsultancy;
  const hasAi = !!(ai && ai.initiatives && ai.initiatives.length > 0);

  const pillarsHtml = (Object.keys(result.pillarScores) as Pillar[])
    .map((p) => {
      const score = result.pillarScores[p];
      const color = PILLAR_COLORS[p];
      const name = PILLAR_NAMES[p];
      return `
        <div style="margin-bottom: 7px;">
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 600; margin-bottom: 3px; color: #1e293b;">
            <span>${name}</span>
            <span style="color: ${color}; font-weight: 700;">${score}/100</span>
          </div>
          <div style="width: 100%; height: 6.5px; background-color: #f1f5f9; border-radius: 3.5px; overflow: hidden;">
            <div style="width: ${score}%; height: 100%; background-color: ${color}; border-radius: 3.5px;"></div>
          </div>
        </div>
      `;
    })
    .join("");

  // Conteúdo do Plano de Ação: Prioriza IA Estruturada se gerada, senão usa as regras padrão
  const actionPlanHtml = hasAi
    ? `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${ai!.initiatives
          .map(
            (init, idx) => `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <span style="font-size: 9.5px; font-weight: 700; color: #0f172a;">${idx + 1}. ${init.title}</span>
              <span style="font-size: 8px; font-weight: 700; padding: 1px 5px; border-radius: 3px; background-color: ${
                init.impact === "Alto" ? "#ecfdf5" : "#fffbeb"
              }; color: ${init.impact === "Alto" ? "#059669" : "#d97706"};">
                Impacto ${init.impact}
              </span>
            </div>
            <div style="font-size: 8.5px; color: #475569; line-height: 1.3; margin-bottom: 3px;">
              ${init.description}
            </div>
            <div style="font-size: 8px; font-weight: 600; color: #16a34a;">
              📈 ${init.estimatedReturn} • Esforço ${init.effort}
            </div>
          </div>
        `
          )
          .join("")}
          <div style="background-color: #f0fdf4; border-left: 2.5px solid #16a34a; border-radius: 4px; padding: 4px 7px; font-size: 8px; color: #166534; line-height: 1.3;">
            <strong>Diretriz de Governança:</strong> ${ai!.governanceTip}
          </div>
          ${
            ai!.sectorQuickWin
              ? `
            <div style="background-color: #f0fdf4; border-left: 2.5px solid #059669; border-radius: 4px; padding: 4px 7px; font-size: 8px; color: #065f46; line-height: 1.3;">
              <strong>⚡ Quick Win Setorial (${result.sector || "Setor"}):</strong> ${ai!.sectorQuickWin}
            </div>
          `
              : ""
          }
        </div>
      `
    : result.recommendations
        .slice(0, 5)
        .map(
          (rec, i) => `
        <div style="display: flex; align-items: flex-start; gap: 7px; margin-bottom: 6px; font-size: 10px; color: #334155; line-height: 1.38;">
          <span style="width: 16px; height: 16px; border-radius: 8px; background-color: #16a34a; color: #ffffff; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">
            ${i + 1}
          </span>
          <div style="flex: 1;">${rec}</div>
        </div>
      `
        )
        .join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <title>Relatório ESG - ${result.institutionName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          line-height: 1.35;
          font-size: 11px;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 2px solid #16a34a;
          margin-bottom: 10px;
        }
        .brand-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: contain;
        }
        .brand-title {
          font-size: 18px;
          font-weight: 800;
          color: #15803d;
          letter-spacing: -0.3px;
          line-height: 1.1;
        }
        .brand-title span {
          color: #16a34a;
        }
        .brand-subtitle {
          font-size: 9.5px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        .meta-container {
          text-align: right;
          font-size: 10px;
          color: #64748b;
        }
        .official-badge {
          display: inline-block;
          background: #ecfdf5;
          color: #059669;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          border: 1px solid #a7f3d0;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .summary-banner {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 9px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .summary-info h1 {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 2px;
        }
        .summary-info p {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 5px;
        }
        .maturity-pill {
          display: inline-block;
          background-color: ${mat.bg};
          border: 1px solid ${mat.color}40;
          color: ${mat.color};
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
        }
        .score-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 3.5px solid ${mat.color};
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
        }
        .score-val {
          font-size: 24px;
          font-weight: 800;
          color: ${mat.color};
          line-height: 1;
        }
        .score-sub {
          font-size: 8px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }
        .critical-box {
          background-color: #fef2f2;
          border-left: 3.5px solid #dc2626;
          border-radius: 6px;
          padding: 7px 12px;
          margin-bottom: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .critical-title {
          font-size: 11px;
          font-weight: 700;
          color: #dc2626;
        }
        .critical-text {
          font-size: 9.5px;
          color: #991b1b;
          margin-top: 1px;
        }
        .grid-2col {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }
        .col-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 9px 12px;
        }
        .col-left {
          flex: 1;
        }
        .col-right {
          flex: 1.1;
        }
        .card-title {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 5px;
          margin-bottom: 7px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          margin-top: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8.5px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <!-- CABEÇALHO COM NOSSA LOGO OFICIAL -->
      <div class="header-bar">
        <div class="brand-container">
          <img src="${LOGO_ECO_BASE64}" class="brand-logo" alt="Eco Diagnóstico" />
          <div>
            <div class="brand-title">Eco <span>Diagnóstico</span></div>
            <div class="brand-subtitle">Relatório Executivo de Maturidade & Governança ESG</div>
          </div>
        </div>
        <div class="meta-container">
          <div class="official-badge">${hasAi ? "✓ Documento Oficial • Análise IA" : "✓ Documento Oficial"}</div>
          <div>ID: #${result.id.slice(-8).toUpperCase()}</div>
          <div>${dateFormatted}</div>
        </div>
      </div>

      <!-- BANNER EXECUTIVO COM NOTA GERAL -->
      <div class="summary-banner">
        <div class="summary-info">
          <h1>${result.institutionName} <span style="font-size: 10px; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 2px 7px; border-radius: 4px; vertical-align: middle;">🏢 ${result.sector || "Setor Geral"}</span></h1>
          <p>${hasAi && ai?.executiveSummary ? ai.executiveSummary : "Auditoria multidimensional de sustentabilidade ambiental corporativa"}</p>
          <div class="maturity-pill">${mat.label} — ${mat.desc}</div>
        </div>
        <div class="score-circle">
          <div class="score-val">${result.overallScore}</div>
          <div class="score-sub">de 100 pts</div>
        </div>
      </div>

      <!-- ALERTA DE PILAR CRÍTICO -->
      <div class="critical-box">
        <div>
          <div class="critical-title">⚠️ Pilar Crítico Prioritário: ${PILLAR_NAMES[result.criticalPillar]} (${result.pillarScores[result.criticalPillar]} pts)</div>
          <div class="critical-text">${hasAi && ai?.criticalPillarDiagnosis ? ai.criticalPillarDiagnosis : "Esta dimensão representa o principal gargalo ecológico e deve ser priorizada no plano de metas imediatas."}</div>
        </div>
      </div>

      <!-- GRID DE 2 COLUNAS: PILARES & PLANO DE AÇÃO -->
      <div class="grid-2col">
        <div class="col-card col-left">
          <div class="card-title">
            <span>Desempenho por Dimensão ESG</span>
            <span style="font-size: 9px; color: #64748b; font-weight: 500;">5 Pilares</span>
          </div>
          <div>
            ${pillarsHtml}
          </div>
        </div>

        <div class="col-card col-right">
          <div class="card-title">
            <span>${hasAi ? "Plano Estratégico (IA Gemini)" : "Plano de Ação Recomendado"}</span>
            <span style="font-size: 9px; color: #16a34a; font-weight: 600;">${hasAi ? "Iniciativas Prioritárias" : "Diretrizes Imediatas"}</span>
          </div>
          <div>
            ${actionPlanHtml}
          </div>
        </div>
      </div>

      <!-- RODAPÉ COMPACTO -->
      <div class="footer">
        <div>Eco Diagnóstico Mobile • Metodologia de Avaliação Ecológica & ESG Corporativo</div>
        <div>Auditoria Concluída • Página 1 de 1</div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Gera o PDF de 1 página e abre a folha de compartilhamento nativa (WhatsApp, Email, etc.)
 * gravando o arquivo binário com nome bonitinho dentro do sandbox permitido pelo Android.
 */
export async function generateAndSharePdfReport(result: DiagnosticResult): Promise<void> {
  const htmlContent = generatePdfHtml(result);

  if (Platform.OS === "web") {
    await Print.printAsync({ html: htmlContent });
    return;
  }

  const filename = getReportFilename(result);

  // 1. Gera o PDF capturando tanto o arquivo quanto a string base64
  const { uri, base64 } = await Print.printToFileAsync({
    html: htmlContent,
    base64: true,
  });

  let shareUri = uri;

  // 2. Converte base64 para bytes binários e grava em Paths.cache
  // Isso resolve 100% o erro 'Not allowed to read file' do Android / Expo Go
  if (base64) {
    try {
      const targetFile = new File(Paths.cache, filename);
      if (targetFile.exists) {
        try {
          targetFile.delete();
        } catch (e) {}
      }
      const binaryBytes = base64ToUint8Array(base64);
      targetFile.write(binaryBytes);
      if (targetFile.exists) {
        shareUri = targetFile.uri;
      }
    } catch (fsErr) {
      console.warn("Could not write binary to Paths.cache, using original uri:", fsErr);
    }
  }

  // 3. Verifica se o compartilhamento nativo está disponível
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("O compartilhamento de arquivos não está disponível neste dispositivo.");
  }

  // 4. Dispara a folha de compartilhamento nativa
  await Sharing.shareAsync(shareUri, {
    UTI: "com.adobe.pdf",
    mimeType: "application/pdf",
    dialogTitle: `Compartilhar ${filename}`,
  });
}

/**
 * Abre diretamente a caixa de visualização/impressão nativa do sistema operacional
 * onde o usuário pode visualizar o PDF de 1 página e imprimir ou salvar.
 */
export async function printPdfReport(result: DiagnosticResult): Promise<void> {
  const htmlContent = generatePdfHtml(result);
  await Print.printAsync({ html: htmlContent });
}
