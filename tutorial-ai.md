# 🧠 Arquitetura e Implementação do Módulo de IA (Eco-Diagnóstico)

Este documento descreve detalhadamente a arquitetura técnica, fluxo de dados, persistência e componentes implementados para a geração de relatórios com Inteligência Artificial (Google Gemini) e persistência no PostgreSQL via Prisma ORM.

---

## 📐 Visão Geral da Arquitetura

O módulo de IA do **Eco-Diagnóstico** foi construído seguindo o padrão **Cache-Aside / Database-First**. Isso garante:
1. **Economia de Recursos & Tokens:** Antes de invocar a API de IA, o sistema verifica se o plano estratégico já foi gerado e salvo no banco de dados.
2. **Baixa Latência:** Consultas subsequentes ao diagnóstico são respondidas instantaneamente direto do banco.
3. **Rastreabilidade e Auditoria:** Cada plano gerado fica indexado ao diagnóstico correspondente com metadados do modelo e resumo executivo.
4. **Escalabilidade:** A arquitetura já contempla tanto o diagnóstico individual (`ActionPlan`) quanto futuras análises agregadas de período/30 dias (`GeneralSummary`).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário
    participant UI as AiReportButton (Client Component)
    participant Page as Resultados [id] (Server Component)
    participant Action as generateAiReport (Server Action)
    participant DB as PostgreSQL (Prisma)
    participant AI as Google Gemini (gemini-2.5-flash)

    Usuario->>Page: Acessa /resultados/[id]
    Page->>DB: prisma.diagnostic.findUnique(include: actionPlan)
    DB-->>Page: Retorna dados + actionPlan existente
    Page->>UI: Renderiza botão com initialPlan

    alt Plano já existente no banco
        Usuario->>UI: Clica em "Ver Plano de Ação IA"
        UI->>UI: Abre modal exibindo Markdown imediatamente (0ms latência de IA)
    else Plano ainda não gerado
        Usuario->>UI: Clica em "Gerar Plano com IA"
        UI->>Action: generateAiReport({ diagnosticId: id })
        Action->>DB: prisma.actionPlan.findUnique({ where: { diagnosticId } })
        DB-->>Action: null (não encontrado)
        Action->>DB: Busca notas dos 5 pilares, instituição e respostas
        DB-->>Action: Dados consolidados
        Action->>AI: generateContent(Prompt contextualizado com métricas ESG)
        AI-->>Action: Retorna Markdown estruturado (Descrição, Pontos de Atenção, Plano de Ação)
        Action->>DB: prisma.actionPlan.upsert(...)
        DB-->>Action: Registro salvo
        Action-->>UI: Retorna relatório gerado
        UI->>UI: Renderiza Markdown com badge "Gerado com Sucesso"
    end
```

---

## 🗂️ Arquivos Envolvidos e Suas Responsabilidades

### 1. Modelagem de Dados: `prisma/schema.prisma`
Localização: `prisma/schema.prisma`

Define os modelos relacionais no PostgreSQL:

* **`ActionPlan`:** Relacionamento `1-para-1` com o modelo `Diagnostic` através de `diagnosticId @unique`.
  * `content (Text)`: Conteúdo completo em Markdown gerado pela IA.
  * `summary (Text?)`: Síntese com os principais números do diagnóstico.
  * `promptContext (Text?)`: Métricas enviadas no prompt para rastreabilidade.
  * `aiModel (String?)`: Identificador do modelo de linguagem (ex: `gemini-2.5-flash`).
  * `createdAt / updatedAt (DateTime)`: Timestamps de criação e modificação.
* **`GeneralSummary`:** Preparado para receber a síntese agregada de 30 dias de múltiplos diagnósticos de uma instituição.

---

### 2. Validação de Entrada: `app/(dashboard)/_actions/generate-ai-report.ts/schema.ts`
Localização: `app/(dashboard)/_actions/generate-ai-report.ts/schema.ts`

Define o contrato de dados tipado com **Zod**:

```typescript
export const generateAiReportSchema = z.object({
  diagnosticId: z.string().optional(), // ID do diagnóstico individual
  month: z.string().refine((val) => isMatch(val, "MM")).optional(), // Mês (ex: "08") para 30 dias
  type: z.enum(["diagnostic", "monthly"]).default("diagnostic").optional(),
  forceRegenerate: z.boolean().default(false).optional(), // Permite forçar nova geração
});
```

---

### 3. Lógica de Negócio e IA: `app/(dashboard)/_actions/generate-ai-report.ts/index.ts`
Localização: `app/(dashboard)/_actions/generate-ai-report.ts/index.ts`

Server Action executada com `"use server"`. Responsabilidades:
1. **Autenticação:** Valida a sessão do usuário com o Clerk via `await auth()`.
2. **Cache Check:** Executa `prisma.actionPlan.findUnique` para o `diagnosticId`. Se encontrado e `!forceRegenerate`, retorna os dados em cache com `fromCache: true`.
3. **Extração de Contexto:** Consulta o diagnóstico completo com a instituição vinculada, notas consolidadas dos 5 pilares (`Energia`, `Água`, `Resíduos`, `Materiais`, `Gestão`) e todas as respostas individuais das perguntas.
4. **Construção do Prompt:** Formata os dados de forma estruturada para o Gemini, exigindo rigorosamente as 3 seções:
   * `# 📋 Descrição do Diagnóstico`
   * `# ⚠️ Pontos de Atenção`
   * `# 🎯 Plano Estratégico de Ação` (Curto, Médio e Longo Prazo)
5. **Comunicação com o SDK Oficial:** Instancia `GoogleGenAI` do pacote `@google/genai` e chama `ai.models.generateContent` com o modelo `gemini-2.5-flash`.
6. **Persistência Atômica:** Executa `prisma.actionPlan.upsert` para gravar o resultado no PostgreSQL.
7. **Suporte Escalável:** Contém a ramificação pronta para relatórios consolidados mensais (`GeneralSummary`).

---

### 4. Componente de Apresentação: `app/_components/ai-report.button.tsx`
Localização: `app/_components/ai-report.button.tsx`

Componente interativo Client-Side (`"use client"`) que encapsula:
* **Trigger:** Botão estilizado com ícone animado (`SparklesIcon`, `BotIcon`), que exibe `"Ver Plano de Ação IA"` se já houver plano carregado ou `"Gerar Plano com IA"`.
* **Modal Dialog:** Utiliza `@base-ui/react/dialog` com tamanho estendido (`max-w-[750px]`) e área com scroll (`ScrollArea`).
* **Renderizador Markdown:** Utiliza `react-markdown` para formatar títulos, listas, tabelas e negritos gerados pela IA.
* **Badges de Status:**
  * 🗄️ `Salvo no Banco de Dados` quando os dados vieram do cache/banco.
  * ✨ `Gerado com Sucesso` quando acabou de ser gerado via IA.
* **Ações do Modal:**
  * Fechar modal.
  * Botão de **Regenerar com IA** (`forceRegenerate: true`) para atualizar a análise caso desejado.

---

### 5. Página de Evolução (Análise Consolidada de 30 Dias): `app/(dashboard)/evolucao/page.tsx`
Localização: `app/(dashboard)/evolucao/page.tsx`

* Consulta os diagnósticos e o último `generalSummary` salvo no banco de dados.
* Posiciona no cabeçalho o botão:
  `<AiReportButton month={currentMonth} initialPlan={latestSummary} buttonLabel="Análise dos 30 Dias (IA)" />`
* Permite ao gestor visualizar a síntese consolidada da evolução de sustentabilidade ao longo dos últimos diagnósticos do período.

---

### 6. Página de Resultados (Diagnóstico Individual): `app/(dashboard)/resultados/[id]/page.tsx`
Localização: `app/(dashboard)/resultados/[id]/page.tsx`

* Realiza a consulta no servidor (`prisma.diagnostic.findUnique`) incluindo a relação `actionPlan: true`.
* Passa o plano inicial (`initialPlan={diagnostic.actionPlan}`) para o `<AiReportButton diagnosticId={id} />`.
* Posiciona o botão de forma limpa na barra inferior de ações junto com "Ver recomendações" e "Ver evolução".

---

## ⚙️ Variáveis de Ambiente Necessárias

No arquivo `.env`, certifique-se de que as seguintes variáveis estejam preenchidas:

```env
# Banco de Dados PostgreSQL (Neon / Supabase / Local)
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=verify-full"

# Chave de API do Google Gemini
GEMINI_API_KEY="sua_chave_do_google_ai_studio"

# Autenticação Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

---

## 🚀 Como Testar a Funcionalidade

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse qualquer diagnóstico finalizado em:
   ```text
   http://localhost:3000/resultados/[id-do-diagnostico]
   ```
3. Clique no botão **"Gerar Plano com IA"** ou **"Ver Plano de Ação IA"**.
4. Observe a abertura do modal com a formatação em Markdown e o status de salvamento no banco de dados.
