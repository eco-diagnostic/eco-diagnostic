# 🌿 Eco Diagnóstico — Plataforma de Diagnóstico de Sustentabilidade

> **Projeto Extensionista Universitário — Inovação e Sustentabilidade**  
> Avaliação, monitoramento e geração de planos de ação para a evolução sustentável de empresas e instituições.

---

## 📌 Índice
1. [Visão Geral e PDR (Product Definition & Requirements)](#-1-visão-geral-e-pdr)
2. [Arquitetura do Backend & Banco de Dados](#-2-arquitetura-do-backend--banco-de-dados)
3. [Estrutura e Separação dos 5 Pilares no Sistema](#-3-estrutura-e-separação-dos-5-pilares-no-sistema)
4. [Lógica do Backend: Busca de Questões, Cálculo de Pontuação e Regras de Negócio](#-4-lógica-do-backend-busca-de-questões-cálculo-de-pontuação-e-regras-de-negócio)
5. [Tipagens, Interfaces e Server Actions](#-5-tipagens-interfaces-e-server-actions)
6. [Integração com Inteligência Artificial (Gemini)](#-6-integração-com-inteligência-artificial-gemini)
7. [Guia de Execução da Plataforma Web](#-7-guia-de-execução-e-migrações)
8. [Aplicativo Mobile — React Native (Expo)](#-8-aplicativo-mobile--react-native-expo)
9. [Rotas do Sistema Web](#-rotas-do-sistema)

---

## 🎯 1. Visão Geral e PDR (Product Definition & Requirements)

### 1.1. Contexto e Proposta
A plataforma web **Eco Diagnóstico** foi concebida como um projeto extensionista com o objetivo de aproximar tecnologia e sustentabilidade prática. A instituição avaliada responde a um questionário objetivo de **20 perguntas** divididas igualmente entre **5 dimensões ecológicas e de governança** (4 perguntas por pilar).

A partir das respostas:
1. O backend processa as notas individuais de cada resposta, calcula a média consolidada de cada um dos 5 pilares e a pontuação global (**0 a 100**).
2. O sistema classifica o **Nível de Maturidade** da instituição e identifica o **Pilar Crítico** prioritário.
3. Permite a geração de um **Plano de Ação Inteligente** com IA (Google Gemini), com armazenamento no banco de dados para evitar reprocessamento e consumo excessivo de tokens.
4. Possibilita o acompanhamento contínuo da **Evolução Temporal** entre diagnósticos sucessivos (Ex: *Diagnóstico Inicial: 45/100 ➔ Diagnóstico Atual: 64/100*).

### 1.2. Autenticação e Usuário
* **Autenticação com Clerk:** Para manter a arquitetura simples e sem sobrecarga de tabelas desnecessárias, apenas o identificador `userId: String` do Clerk é armazenado nas tabelas `Institution` e `Diagnostic`.
* **Primeiro Acesso:** Se o usuário ainda não tiver uma instituição cadastrada no banco Neon, o sistema registra os dados essenciais (`name`, `sector`, `city`, `state`, `size`).

---

## 🗄️ 2. Arquitetura do Backend & Banco de Dados

O backend é construído com **Next.js 16 (App Router + Server Actions)** integrado ao **Prisma ORM 7** conectado a um banco **PostgreSQL Serverless (Neon DB)**.

```mermaid
erDiagram
    Institution ||--o{ Diagnostic : "realiza"
    Diagnostic ||--o{ DiagnosticAnswer : "contém (20 respostas)"
    Diagnostic ||--o{ DiagnosticPillarScore : "possui (5 notas por pilar)"
    Diagnostic ||--o| ActionPlan : "gera com IA"
    Question ||--o{ QuestionOption : "possui (4 alternativas)"
    Question ||--o{ DiagnosticAnswer : "referencia"
    QuestionOption ||--o{ DiagnosticAnswer : "selecionada"
    Institution ||--o{ GeneralSummary : "consolida (30 dias)"
```

### 2.1. Modelos do Schema Prisma (`prisma/schema.prisma`)

* **`Institution`**: Armazena os dados da empresa/instituição vinculada ao `userId` do Clerk (`name`, `sector`, `city`, `state`, `size`).
* **`Question`**: Banco de questões categorizadas por pilar (`ENERGIA`, `AGUA`, `RESIDUOS`, `MATERIAIS`, `GESTAO`), com peso e status ativo.
* **`QuestionOption`**: 4 opções de resposta para cada questão, com pontuação calibrada (`score` de 0 a 100) e indicador `allowsCustomText`.
* **`Diagnostic`**: Registro imutável de cada avaliação realizada (`overallScore`, `maturityLevel`, `criticalPillar`, `completedAt`).
* **`DiagnosticAnswer`**: Histórico detalhado de cada uma das 20 respostas submetidas no diagnóstico com a nota obtida.
* **`DiagnosticPillarScore`**: Notas consolidadas por pilar de cada diagnóstico para permitir gráficos rápidos e relatórios sem recalcular tudo on-the-fly.
* **`ActionPlan`**: Plano de ação detalhado gerado pela IA em formato Markdown, com foco imediato no pilar crítico.
* **`GeneralSummary`**: Relatório executivo consolidado com a análise de tendências dos últimos 30 dias.

---

## 🏛️ 3. Estrutura e Separação dos 5 Pilares no Sistema

Os 5 pilares são modelados nativamente no banco de dados e no TypeScript como um Enum fortemente tipado:

```prisma
enum Pillar {
  ENERGIA
  AGUA
  RESIDUOS
  MATERIAIS
  GESTAO
}
```

### 3.1. Divisão e Significado dos Pilares

| Pilar | Descrição | Foco de Avaliação Prática |
| :--- | :--- | :--- |
| ⚡ **ENERGIA** | Eficiência energética e matriz limpa | Monitoramento mensal, iluminação LED, sensores, equipamentos eficientes e energia solar/renovável. |
| 💧 **AGUA** | Gestão hídrica e conservação | Dispositivos economizadores, combate a vazamentos, medição setorizada e captação de água da chuva. |
| ♻️ **RESIDUOS** | Gestão de resíduos e economia circular | Coleta seletiva, descarte de eletrônicos/perigosos, compostagem e parcerias com cooperativas. |
| 📦 **MATERIAIS** | Compras sustentáveis e insumos | Eliminação de descartáveis plásticos, papel reciclado/digitalização, critérios ecológicos com fornecedores. |
| 📋 **GESTAO** | Governança, treinamento e cultura ESG | Política ambiental formalizada, comitê de sustentabilidade, capacitação da equipe e metas públicas. |

---

## 🧮 4. Lógica do Backend: Busca de Questões, Cálculo de Pontuação e Regras de Negócio

Toda a inteligência de sorteio, validação, pontuação e persistência está centralizada no arquivo de Server Actions:  
📁 [`app/(dashboard)/questionarios/_actions/diagnostic-actions.ts`](app/%28dashboard%29/questionarios/_actions/diagnostic-actions.ts)

Abaixo está a explicação técnica detalhada de cada etapa e de cada função do backend:

---

### 4.1. Sorteio Aleatório das 20 Perguntas (`getDiagnosticQuestionsAction`)

Para garantir que os diagnósticos sejam variados e não repitam sempre a mesma sequência fixa de perguntas, o backend executa a função `getDiagnosticQuestionsAction()`:

```typescript
export async function getDiagnosticQuestionsAction(): Promise<QuestionWithOptions[]> {
  const pillars = [
    Pillar.ENERGIA,
    Pillar.AGUA,
    Pillar.RESIDUOS,
    Pillar.MATERIAIS,
    Pillar.GESTAO,
  ];

  const selectedQuestions: QuestionWithOptions[] = [];

  for (const pillar of pillars) {
    // 1. Executa findMany no Prisma buscando apenas perguntas ativas do pilar corrente
    const questionsInPillar = await prisma.question.findMany({
      where: {
        pillar,
        isActive: true,
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // 2. Embaralha aleatoriamente as questões do pilar
    const shuffled = [...questionsInPillar].sort(() => 0.5 - Math.random());
    
    // 3. Pega exatamente 4 questões deste pilar
    const picked = shuffled.slice(0, 4);

    selectedQuestions.push(...picked);
  }

  // 4. Retorna as 20 questões (5 pilares * 4 questões = 20 perguntas)
  return selectedQuestions;
}
```

* **O que o `prisma.question.findMany` faz:** Busca todas as perguntas cadastradas para o pilar atual (`where: { pillar, isActive: true }`) e inclui via relacionamento (`include: { options: true }`) as 4 alternativas de resposta ordenadas por `order: "asc"`.
* **Como faz o sorteio:** Embaralha a lista do pilar com `.sort(() => 0.5 - Math.random())` e extrai as 4 primeiras com `.slice(0, 4)`.
* **Resultado:** Garante que o questionário sempre tenha exatamente 4 perguntas de Energia, 4 de Água, 4 de Resíduos, 4 de Materiais e 4 de Gestão (totalizando 20 perguntas).

---

### 4.2. Escala de Pontuação das Alternativas (Seed)

No banco de dados, cada uma das 4 opções de resposta possui um valor calibrado de `score` (de 0 a 100 pontos), definido no arquivo [`prisma/seed.ts`](prisma/seed.ts) de acordo com o grau de maturidade da prática sustentável:

| Alternativa | Grau de Maturidade | Pontuação Atribuída | Exemplo Prático |
| :---: | :--- | :---: | :--- |
| **A** | **Inexistente / Nulo** | **0 pontos** | *"Não realizamos monitoramento ou separação."* |
| **B** | **Reativo / Inicial** | **30 a 35 pontos** | *"Acompanhamos apenas quando há aumento de custos ou problemas."* |
| **C** | **Sistemático / Regular** | **70 a 75 pontos** | *"Monitoramento periódico e procedimentos estruturados na instituição."* |
| **D** | **Excelente / Proativo** | **100 pontos** | *"Possui metas formais de redução contínua e certificações."* |

---

### 4.3. Validação Segura e Cálculo das Notas no Backend (`submitDiagnosticAction`)

Quando o formulário do questionário é submetido, o front-end envia apenas o `questionId` e o `selectedOptionId` escolhido pelo usuário.  
**O front-end não calcula nem envia notas**, garantindo segurança e integridade total.

A função `submitDiagnosticAction` realiza os seguintes passos:

#### Passo 1: Busca de Segurança com `findMany`
O backend extrai a lista de `questionIds` submetidos e consulta o banco Neon para buscar os dados oficiais das questões e das opções:

```typescript
const questionIds = payload.answers.map((a) => a.questionId);

// Busca todas as perguntas e opções submetidas diretamente do banco
const questionsFromDb = await prisma.question.findMany({
  where: { id: { in: questionIds } },
  include: { options: true },
});

// Cria um Map em memória para busca rápida O(1)
const questionMap = new Map(questionsFromDb.map((q) => [q.id, q]));
```

#### Passo 2: Acumulador de Pontos por Pilar (`pillarScoresMap`)
O backend inicializa uma estrutura de acumulação com os 5 pilares:

```typescript
const pillarScoresMap: Record<Pillar, { totalPoints: number; count: number }> = {
  [Pillar.ENERGIA]: { totalPoints: 0, count: 0 },
  [Pillar.AGUA]: { totalPoints: 0, count: 0 },
  [Pillar.RESIDUOS]: { totalPoints: 0, count: 0 },
  [Pillar.MATERIAIS]: { totalPoints: 0, count: 0 },
  [Pillar.GESTAO]: { totalPoints: 0, count: 0 },
};
```

Em seguida, percorre cada uma das 20 respostas submetidas:
1. Encontra a questão correspondente no `questionMap`.
2. Localiza a opção selecionada (`selectedOptionId`) dentro de `question.options` e obtém o `score` oficial (0, 35, 75 ou 100).
3. Soma a nota obtida no acumulador do respectivo pilar:
   ```typescript
   pillarScoresMap[question.pillar].totalPoints += scoreObtained;
   pillarScoresMap[question.pillar].count += 1;
   ```

---

### 4.4. Como é Calculada a Nota de Cada Pilar

Para cada um dos 5 pilares, a nota final consolidada é a média aritmética das 4 perguntas respondidas naquele pilar:

$$\text{Nota do Pilar} = \text{Math.round}\left( \frac{\text{totalPoints}}{\text{count}} \right)$$

**Exemplo Prático (Pilar Energia com 4 perguntas):**
* Pergunta 1: Opção D (100 pontos)
* Pergunta 2: Opção C (75 pontos)
* Pergunta 3: Opção C (75 pontos)
* Pergunta 4: Opção D (100 pontos)
* **Cálculo:** $(100 + 75 + 75 + 100) \div 4 = 350 \div 4 = 87.5 \xrightarrow{\text{round}} \mathbf{88 \text{ pontos (88\%)}}$

Durante essa iteração, o backend também rastreia qual pilar obteve a menor nota (`lowestScore`), identificando automaticamente o **`criticalPillar`** (Ponto Crítico).

---

### 4.5. Como é Calculada a Porcentagem Geral (Overall Score)

A pontuação geral da instituição (**Índice de Sustentabilidade Geral**) é a média aritmética simples das notas finais dos **5 pilares**:

$$\text{Overall Score} = \text{Math.round}\left( \frac{\text{Nota}_{\text{ENERGIA}} + \text{Nota}_{\text{AGUA}} + \text{Nota}_{\text{RESIDUOS}} + \text{Nota}_{\text{MATERIAIS}} + \text{Nota}_{\text{GESTAO}}}{5} \right)$$

**Exemplo Prático:**
* ⚡ Energia: **88%**
* 💧 Água: **70%**
* ♻️ Resíduos: **41%**
* 📦 Materiais: **55%**
* 📋 Gestão: **66%**
* **Soma das 5 notas:** $88 + 70 + 41 + 55 + 66 = 320$
* **Overall Score:** $320 \div 5 = \mathbf{64 \text{ pontos} \quad (64/100)}$
* **Pilar Crítico identificado:** ♻️ **Resíduos** (menor nota: 41%).

---

### 4.6. Classificação do Nível de Maturidade (`MaturityLevel`)

Com base no `overallScore` obtido, o backend classifica a instituição em uma das 4 faixas de maturidade:

```typescript
let maturityLevel: MaturityLevel = MaturityLevel.EM_DESENVOLVIMENTO;

if (overallScore < 40) {
  maturityLevel = MaturityLevel.CRITICO;
} else if (overallScore < 70) {
  maturityLevel = MaturityLevel.EM_DESENVOLVIMENTO;
} else if (overallScore < 90) {
  maturityLevel = MaturityLevel.AVANCADO;
} else {
  maturityLevel = MaturityLevel.SUSTENTAVEL;
}
```

```
               0                40                70                90               100
Pontuação:     |-----------------|-----------------|-----------------|-----------------|
Classificação: [     CRÍTICO     ][EM DESENVOLVIMENTO][    AVANÇADO   ][   SUSTENTÁVEL   ]
```

* **CRÍTICO ($0 \le \text{Score} < 40$):** Práticas incipientes; alto risco de desperdício e impacto ambiental negativo.
* **EM DESENVOLVIMENTO ($40 \le \text{Score} < 70$):** Primeiras iniciativas pontuais implementadas, sem governança transversal.
* **AVANÇADO ($70 \le \text{Score} < 90$):** Processos estruturados na maioria dos pilares com medição contínua.
* **SUSTENTÁVEL ($90 \le \text{Score} \le 100$):** Referência em eficiência, economia circular e cultura organizacional ecológica.

---

### 4.7. Persistência Atômica no Banco de Dados (`prisma.$transaction`)

Para assegurar consistência total (se alguma gravação falhar, nada inconsistente é salvo), o backend utiliza uma transação atômica do Prisma:

```typescript
const createdDiagnostic = await prisma.$transaction(async (tx) => {
  // 1. Cria o registro principal do Diagnóstico
  const diag = await tx.diagnostic.create({
    data: {
      institutionId,
      userId,
      status: DiagnosticStatus.CONCLUIDO,
      overallScore,
      maturityLevel,
      criticalPillar: lowestPillar,
      totalQuestions: processedAnswers.length, // 20
      answeredCount: processedAnswers.length,  // 20
      completedAt: new Date(),
      // 2. Cria em lote as 20 respostas detalhadas vinculadas ao diagnóstico
      answers: {
        create: processedAnswers.map((ans) => ({
          questionId: ans.questionId,
          pillar: ans.pillar,
          selectedOptionId: ans.selectedOptionId,
          customText: ans.customText,
          scoreObtained: ans.scoreObtained,
        })),
      },
      // 3. Cria em lote os 5 scores consolidados por pilar
      pillarScores: {
        create: pillarResults.map((p) => ({
          pillar: p.pillar,
          score: p.score,
          questionsCount: p.count,
        })),
      },
    },
  });

  return diag;
});
```

---

## 💻 5. Tipagens, Interfaces e Server Actions

As tipagens e Server Actions estão centralizadas em [`app/(dashboard)/questionarios/_actions/diagnostic-actions.ts`](app/%28dashboard%29/questionarios/_actions/diagnostic-actions.ts).

### 5.1. Interfaces Principais

```typescript
import { Pillar, MaturityLevel, DiagnosticStatus, InstitutionSize } from "@prisma/client";

// Estrutura de uma questão com suas opções retornada para o formulário
export interface QuestionWithOptions {
  id: string;
  pillar: Pillar;
  title: string;
  description: string | null;
  weight: number;
  options: {
    id: string;
    text: string;
    score: number;
    order: number;
    allowsCustomText: boolean;
  }[];
}

// Payload de cada resposta individual enviado pelo formulário do usuário
export interface SubmitDiagnosticAnswerInput {
  questionId: string;
  selectedOptionId?: string;
  customText?: string;
}

// Payload completo submetido ao backend
export interface SubmitDiagnosticPayload {
  userId?: string;
  institutionId?: string;
  answers: SubmitDiagnosticAnswerInput[];
}
```

---

## 🤖 6. Integração com Inteligência Artificial (Gemini)

Para aliar inovação tecnológica e sustentabilidade sem onerar custos ou latência:

1. **Plano de Ação por Diagnóstico (`ActionPlan`):**
   * Ao finalizar um diagnóstico, o backend submete o contexto das respostas e notas dos pilares para o modelo **Google Gemini**.
   * O Gemini gera um plano estruturado em Markdown com:
     * Ações prioritárias imediatas (foco no `criticalPillar`);
     * Metas de curto, médio e longo prazo;
     * Estimativa de investimento (baixo/médio/alto custo) e impacto sustentável.
   * **Persistência Local no Neon:** O conteúdo gerado pela IA é salvo diretamente na tabela `ActionPlan` vinculado ao `diagnosticId`. Desta forma, futuras visualizações ou exportações em PDF leem diretamente do banco de dados com **custo zero de tokens**.

2. **Resumo Geral de 30 Dias (`GeneralSummary`):**
   * A IA recebe o conjunto agregado de diagnósticos realizados no último mês para analisar a tendência global da instituição, gravando o parecer executivo consolidado na tabela `GeneralSummary`.

---

## 🚀 7. Guia de Execução e Migrações

### 7.1. Variáveis de Ambiente (`.env`)
Certifique-se de configurar a URL de conexão do PostgreSQL Neon no arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/eco_diagnostico?sslmode=require"
```

### 7.2. Comandos do Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Sincronizar o Schema Prisma com o banco Neon
npx prisma db push

# 3. Gerar o Prisma Client (@prisma/client)
npx prisma generate

# 4. Executar o Seed com as 32 perguntas e 128 opções
npm run db:seed

# 5. Executar em modo de desenvolvimento
npm run dev

# 6. Executar build de produção (Turbopack)
npm run build
```

---

## 📱 8. Aplicativo Mobile — React Native (Expo)

Desenvolvido especificamente para a disciplina de **Desenvolvimento Mobile**, o aplicativo móvel **Eco Diagnóstico** está localizado no diretório [`mobile/`](mobile/) e oferece uma experiência 100% nativa com suporte a **execução offline** e **geração de instalador .APK**.

### 8.1. Arquitetura e Tecnologias Mobile
* **Framework:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (SDK 52+)
* **Linguagem:** TypeScript com tipagem estrita
* **Navegação Nativa:** [React Navigation](https://reactnavigation.org/)
  * `createBottomTabNavigator` (Abas inferiores: Início, Painel ESG e Histórico)
  * `createNativeStackNavigator` (Fluxo nativo para Questionário e Tela de Resultados)
* **Persistência de Dados Offline:** `@react-native-async-storage/async-storage` (diagnósticos e dados institucionais gravados localmente no dispositivo)
* **Ícones Nativos:** `lucide-react-native` e `react-native-svg`

### 8.2. Telas do Aplicativo Mobile
* 🏠 **`HomeScreen`**: Identificação da organização avaliada, estatísticas rápidas e apresentação dos 5 pilares com cores temáticas.
* 📝 **`QuizScreen`**: Questionário interativo com 20 perguntas calibradas (4 por pilar), barra de progresso em tempo real, badges de categoria e seleção tátil de alternativas.
* 🏆 **`ResultScreen`**: Pontuação geral (0 a 100), classificação do Nível de Maturidade (*Crítico, Em Desenvolvimento, Avançado ou Sustentável*), alerta do **Pilar Crítico** prioritário e recomendações práticas.
* 📊 **`DashboardScreen`**: Painel com gráficos em barra horizontal do desempenho nos 5 pilares (*Energia, Água, Resíduos, Materiais e Gestão*) e comparativo Destaque vs. Ponto Crítico.
* 📜 **`HistoryScreen`**: Histórico completo com data/hora, nota final e pilar crítico, permitindo reabrir relatórios passados e gerenciamento de registros offline.

### 8.3. Como Executar o App no Celular com Expo Go

1. **Instalar o Expo Go no smartphone:**
   * [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent) | [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
2. **Navegar até a pasta mobile e iniciar:**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
3. **Escanear o QR Code:**
   * **Android:** Abra o app Expo Go e toque em *Scan QR Code*.
   * **iOS:** Aponte a câmera padrão para o QR Code gerado no terminal.

### 8.4. Como Gerar o Arquivo Instalador .APK (Android)

Para compilar o pacote `.apk` para entrega acadêmica via EAS Build (nuvem gratuita da Expo):

```bash
# 1. Instalar o EAS CLI
npm install -g eas-cli

# 2. Login na conta Expo (grátis em https://expo.dev)
eas login

# 3. Compilar o APK de demonstração
eas build -p android --profile preview
```
Ao término da compilação, o link direto para download do `.apk` pronto para instalar no Android será exibido no terminal.

---

## 📊 9. Rotas do Sistema Web

* **`/`** — Página inicial e apresentação da proposta.
* **`/dashboard`** — Visão geral com cards de evolução, último diagnóstico e gráfico Donut interativo.
* **`/questionarios`** — Questionário dinâmico com 20 perguntas sorteadas (4 por pilar), progresso em tempo real e atalhos de teclado.
* **`/resultados`** — Histórico e listagem geral de diagnósticos realizados.
* **`/resultados/[id]`** — Detalhamento da pontuação geral, notas por pilar, identificação do ponto crítico e plano de ação.
* **`/diagnosticos`** — Tabela gerencial completa com filtros, status e links rápidos para detalhes ou refazer.
* **`/evolucao`** — Gráfico temporal de linha/área, comparativo de linha de base e análise de tendência.

---

**Eco Diagnóstico** — *Programação como ferramenta para impulsionar e transformar a sustentabilidade institucional.*
