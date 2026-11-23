import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { DiagnosticResult } from "../types";
import { generatePdfHtml, getReportFilename } from "./reportHtml";

// Mantém a API usada pelas telas; o template puro pode ser testado sem módulos nativos.
export { generatePdfHtml, getReportFilename } from "./reportHtml";

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
