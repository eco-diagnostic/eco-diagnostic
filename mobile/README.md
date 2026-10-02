# 📱 Eco Diagnóstico Mobile — React Native (Expo)

> **Aplicativo Mobile Universitário para Diagnóstico de Sustentabilidade e Governança Ecológica (ESG)**  
> Desenvolvido em **React Native com Expo e TypeScript**, com suporte a armazenamento offline e navegação nativa.

---

## 🌟 Visão Geral do Aplicativo
O **Eco Diagnóstico Mobile** é um aplicativo nativo projetado para avaliar o nível de maturidade sustentável de empresas, instituições de ensino e organizações através de um questionário objetivo de **20 perguntas** divididas igualmente em **5 dimensões ecológicas**:

1. ⚡ **Energia e Clima:** Eficiência energética, fontes renováveis, combate ao consumo em standby e automação.
2. 💧 **Gestão Hídrica:** Monitoramento de hidrômetros, dispositivos economizadores, captação pluvial e inspeção de vazamentos.
3. ♻️ **Resíduos e Reciclagem:** Coleta seletiva na fonte, compostagem de orgânicos, logística reversa e descarte de perigosos/eletrônicos.
4. 📦 **Materiais e Compras Verdes:** Banimento de plásticos descartáveis, digitalização (Paperless), homologação de fornecedores e produtos biodegradáveis.
5. 🏛️ **Governança e Práticas ESG:** Política ambiental formal, comitê responsável, capacitações periódicas e metas quantitativas.

---

## 🏗️ Arquitetura e Tecnologias Utilizadas

* **Framework Base:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (SDK 52+)
* **Linguagem:** TypeScript
* **Navegação Mobile:** [React Navigation](https://reactnavigation.org/)
  * `createBottomTabNavigator` (Abas inferiores: Início, Painel ESG, Histórico)
  * `createNativeStackNavigator` (Fluxo de navegação para o Questionário e Resultado)
* **Persistência de Dados (Offline):** `@react-native-async-storage/async-storage`
* **Ícones Nativos:** `lucide-react-native` + `react-native-svg`
* **Cálculo de Maturidade:**
  * **0 a 39 pts:** Nível Crítico
  * **40 a 69 pts:** Em Desenvolvimento
  * **70 a 89 pts:** Nível Avançado
  * **90 a 100 pts:** Nível Sustentável
  * Detecção automática do **Pilar Crítico** prioritário e geração de recomendações de melhoria.

---

## 🚀 Como Executar o Projeto no Celular

### 1. Pré-requisitos
* Ter o aplicativo gratuito **Expo Go** instalado no seu smartphone:
  * [Download no Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  * [Download na App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)

### 2. Iniciar o Servidor de Desenvolvimento
No terminal, dentro da pasta `mobile/`:

```bash
cd mobile
npx expo start
```

### 3. Abrir no Celular
* **Android:** Abra o aplicativo **Expo Go** e toque em **"Scan QR Code"** para apontar a câmera para o QR Code gerado no terminal.
* **iPhone:** Abra a câmera padrão do iOS, aponte para o QR Code e toque no banner do Expo.
* O aplicativo carregará instantaneamente na tela do seu celular!

---

## 📦 Como Gerar o Arquivo .APK do Android

Para gerar o arquivo instalável `.apk` diretamente para a entrega da faculdade:

### Opção 1: Via EAS Build (Nuvem da Expo - Gratuito e Recomendado)
1. Instale o CLI do EAS:
   ```bash
   npm install -g eas-cli
   ```
2. Faça login na sua conta Expo (grátis):
   ```bash
   eas login
   ```
3. Configure a compilação do APK:
   ```bash
   eas build:configure
   ```
4. Gere o arquivo APK com o comando:
   ```bash
   eas build -p android --profile preview
   ```
5. Ao concluir, o terminal exibirá o link direto para download do arquivo `.apk` pronto para instalar.

### Opção 2: Pré-compilação Local (com Android Studio)
```bash
npx expo run:android
```

---

## 📂 Estrutura de Pastas

```
mobile/
├── assets/                 # Imagens e logo da folha
├── src/
│   ├── data/
│   │   └── questions.ts    # 20 perguntas calibradas dos 5 pilares
│   ├── navigation/
│   │   ├── AppNavigator.tsx# Configuração das Tabs e Stack
│   │   └── types.ts        # Tipagem das rotas
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Tela inicial e identificação
│   │   ├── QuizScreen.tsx      # Questionário interativo (20 questões)
│   │   ├── ResultScreen.tsx    # Resultado, pilar crítico e recomendações
│   │   ├── DashboardScreen.tsx # Painel com gráficos de barras dos pilares
│   │   └── HistoryScreen.tsx   # Histórico de avaliações offline
│   ├── services/
│   │   ├── calc.ts         # Motor de cálculo e regras de negócio
│   │   └── storage.ts      # Armazenamento local (AsyncStorage)
│   └── types/
│       └── index.ts        # Interfaces TypeScript
├── App.tsx                 # Ponto de entrada com Providers
├── app.json                # Configurações do Expo e pacote Android
└── package.json            # Dependências React Native
```
