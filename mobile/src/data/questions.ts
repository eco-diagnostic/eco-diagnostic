import { Pillar, Question } from "../types";

export const allQuestions: Question[] = [
  // 1. ENERGIA (7 Perguntas)
  {
    id: "en_1",
    pillar: Pillar.ENERGIA,
    title: "A instituição acompanha mensalmente o consumo de energia elétrica?",
    description: "Avalia a rotina de monitoramento de faturas e histórico de consumo em kWh.",
    weight: 1.0,
    options: [
      { id: "en_1_1", text: "Não acompanhamos o consumo de energia elétrica", score: 0, order: 1 },
      { id: "en_1_2", text: "Acompanhamos apenas o valor financeiro da conta quando há aumento atípico", score: 25, order: 2 },
      { id: "en_1_3", text: "Acompanhamos o consumo mensal em kWh e mantemos histórico", score: 65, order: 3 },
      { id: "en_1_4", text: "Acompanhamos mensalmente por setor/área e possuímos metas claras de redução de consumo", score: 100, order: 4 },
    ],
  },
  {
    id: "en_2",
    pillar: Pillar.ENERGIA,
    title: "Qual é o nível de eficiência dos sistemas de iluminação da instituição?",
    description: "Avalia a transição para lâmpadas de LED e automação por sensores.",
    weight: 1.0,
    options: [
      { id: "en_2_1", text: "Predominância de lâmpadas incandescentes ou fluorescentes antigas", score: 0, order: 1 },
      { id: "en_2_2", text: "Mais de 50% das lâmpadas já foram substituídas por LED", score: 50, order: 2 },
      { id: "en_2_3", text: "100% dos ambientes utilizam lâmpadas de LED", score: 80, order: 3 },
      { id: "en_2_4", text: "100% LED com sensores de presença em corredores/banheiros e automação de iluminação", score: 100, order: 4 },
    ],
  },
  {
    id: "en_3",
    pillar: Pillar.ENERGIA,
    title: "A instituição utiliza fontes de energia renovável (ex: solar, eólica ou biomassa)?",
    description: "Verifica a matriz energética própria ou adquirida.",
    weight: 1.2,
    options: [
      { id: "en_3_1", text: "100% da energia provém da rede elétrica convencional sem certificados renováveis", score: 0, order: 1 },
      { id: "en_3_2", text: "Em fase de estudo de viabilidade ou projeto para aquisição de energia renovável", score: 25, order: 2 },
      { id: "en_3_3", text: "Possui sistema solar fotovoltaico próprio que supre parte do consumo (ou compra energia no Mercado Livre)", score: 75, order: 3 },
      { id: "en_3_4", text: "Autossuficiente ou mais de 80% do consumo atendido por geração solar própria ou 100% renovável", score: 100, order: 4 },
    ],
  },
  {
    id: "en_4",
    pillar: Pillar.ENERGIA,
    title: "Existe uma rotina formal para desligamento de equipamentos e combate ao consumo em standby?",
    description: "Avalia práticas operacionais para evitar desperdício fora do horário de funcionamento.",
    weight: 1.0,
    options: [
      { id: "en_4_1", text: "Computadores, luzes e aparelhos frequentemente permanecem ligados à noite ou fins de semana", score: 0, order: 1 },
      { id: "en_4_2", text: "Desligamento depende da iniciativa individual sem aviso ou conferência", score: 30, order: 2 },
      { id: "en_4_3", text: "Campanhas de conscientização ativas e equipe designada para checagem ao final do expediente", score: 70, order: 3 },
      { id: "en_4_4", text: "Temporizadores/sensores automáticos para desligamento e política mandatória de standby zero", score: 100, order: 4 },
    ],
  },

  // 2. ÁGUA (4 Perguntas)
  {
    id: "ag_1",
    pillar: Pillar.AGUA,
    title: "Como a instituição monitora o consumo de água?",
    description: "Acompanhamento de hidrômetros, faturas e detecção de anomalias.",
    weight: 1.0,
    options: [
      { id: "ag_1_1", text: "Não há monitoramento do volume de água consumido", score: 0, order: 1 },
      { id: "ag_1_2", text: "Acompanhamento apenas do valor financeiro da fatura de água", score: 30, order: 2 },
      { id: "ag_1_3", text: "Leitura periódica do hidrômetro e histórico em m³ para detecção de variações anormais", score: 70, order: 3 },
      { id: "ag_1_4", text: "Telemetria / medição individualizada por setor com metas de redução e alarmes de vazamento", score: 100, order: 4 },
    ],
  },
  {
    id: "ag_2",
    pillar: Pillar.AGUA,
    title: "As torneiras, sanitários e chuveiros possuem dispositivos economizadores de água?",
    description: "Uso de aeradores, temporizadores, descargas de duplo fluxo e válvulas ecológicas.",
    weight: 1.0,
    options: [
      { id: "ag_2_1", text: "Dispositivos convencionais sem nenhum tipo de redutor de vazão", score: 0, order: 1 },
      { id: "ag_2_2", text: "Poucos pontos isolados contam com aeradores ou torneiras de fechamento automático", score: 35, order: 2 },
      { id: "ag_2_3", text: "Mais de 70% das torneiras contam com aeradores/temporizadores e sanitários com descarga dupla", score: 75, order: 3 },
      { id: "ag_2_4", text: "100% das instalações contam com tecnologias economizadoras (sensores, redutores e descarga duo)", score: 100, order: 4 },
    ],
  },
  {
    id: "ag_3",
    pillar: Pillar.AGUA,
    title: "A instituição possui sistema de captação e aproveitamento de água da chuva?",
    description: "Coleta pluvial para limpeza de calçadas, irrigação e bacias sanitárias.",
    weight: 1.2,
    options: [
      { id: "ag_3_1", text: "Não há sistema de captação de água pluvial", score: 0, order: 1 },
      { id: "ag_3_2", text: "Coleta informal de água em pequenos recipientes para rega de plantas", score: 30, order: 2 },
      { id: "ag_3_3", text: "Cisterna instalada com capacidade para atender à limpeza externa e jardinagem", score: 75, order: 3 },
      { id: "ag_3_4", text: "Sistema completo de captação pluvial com filtragem integrado às descargas e lavagens", score: 100, order: 4 },
    ],
  },
  {
    id: "ag_4",
    pillar: Pillar.AGUA,
    title: "Existe rotina estruturada para inspeção e combate a vazamentos de água?",
    description: "Prevenção e conserto imediato de vazamentos em tubulações e caixas d'água.",
    weight: 1.0,
    options: [
      { id: "ag_4_1", text: "Reparos ocorrem apenas após vazamentos visíveis de grande porte ou aumento na conta", score: 0, order: 1 },
      { id: "ag_4_2", text: "Inspeções esporádicas quando algum colaborador reporta", score: 35, order: 2 },
      { id: "ag_4_3", text: "Ronda preventiva mensal em sanitários, boias de caixas d'água e tubulações", score: 75, order: 3 },
      { id: "ag_4_4", text: "Procedimento operacional padrão (POP) com equipe capacitada para conserto em até 24h", score: 100, order: 4 },
    ],
  },

  // 3. RESÍDUOS (4 Perguntas)
  {
    id: "res_1",
    pillar: Pillar.RESIDUOS,
    title: "A instituição realiza a separação de resíduos na fonte (coleta seletiva)?",
    description: "Presença de lixeiras identificadas e adesão dos colaboradores.",
    weight: 1.2,
    options: [
      { id: "res_1_1", text: "Não há coleta seletiva; todos os resíduos são misturados no mesmo recipiente", score: 0, order: 1 },
      { id: "res_1_2", text: "Separação ocorre apenas em alguns pontos isolados (ex: papelão no estoque)", score: 30, order: 2 },
      { id: "res_1_3", text: "Lixeiras para resíduos recicláveis (secos) e não recicláveis em todos os setores", score: 75, order: 3 },
      { id: "res_1_4", text: "Estações completas de coleta seletiva segregada com alta adesão da equipe", score: 100, order: 4 },
    ],
  },
  {
    id: "res_2",
    pillar: Pillar.RESIDUOS,
    title: "Qual é a destinação final dada aos materiais recicláveis?",
    description: "Encaminhamento correto para cooperativas, recicladores ou aterros.",
    weight: 1.0,
    options: [
      { id: "res_2_1", text: "Os recicláveis são recolhidos pelo caminhão de lixo comum e enviados a aterros", score: 0, order: 1 },
      { id: "res_2_2", text: "Entregues esporadicamente a catadores informais sem controle de quantidade", score: 35, order: 2 },
      { id: "res_2_3", text: "Parceria formal com cooperativa de catadores cadastrada ou empresa de reciclagem", score: 80, order: 3 },
      { id: "res_2_4", text: "Destinação 100% rastreada com emissão de Manifesto de Transporte de Resíduos (MTR) e certificado", score: 100, order: 4 },
    ],
  },
  {
    id: "res_3",
    pillar: Pillar.RESIDUOS,
    title: "Como a instituição lida com os resíduos orgânicos (restos de alimentos, podas, etc.)?",
    description: "Compostagem, biodigestão ou descarte de orgânicos.",
    weight: 1.0,
    options: [
      { id: "res_3_1", text: "Todos os resíduos orgânicos vão para o lixo comum e aterro sanitário", score: 0, order: 1 },
      { id: "res_3_2", text: "Separação apenas das podas de jardim, mas alimentos vão para o aterro", score: 30, order: 2 },
      { id: "res_3_3", text: "Composteira ou minhocário interno tratando parte dos resíduos orgânicos", score: 75, order: 3 },
      { id: "res_3_4", text: "100% dos resíduos orgânicos passam por compostagem, gerando adubo para hortas e jardins", score: 100, order: 4 },
    ],
  },
  {
    id: "res_4",
    pillar: Pillar.RESIDUOS,
    title: "Como é feito o descarte de resíduos perigosos e eletrônicos (pilhas, lâmpadas, e-waste)?",
    description: "Cumprimento da legislação de logística reversa e descarte seguro.",
    weight: 1.2,
    options: [
      { id: "res_4_1", text: "Descartados junto ao lixo comum sem cuidados especiais", score: 0, order: 1 },
      { id: "res_4_2", text: "Acumulados em almoxarifados sem destinação periódica regular", score: 25, order: 2 },
      { id: "res_4_3", text: "Entregues em pontos de coleta autorizados ou logística reversa quando atingem volume", score: 75, order: 3 },
      { id: "res_4_4", text: "Plano formal de gerenciamento de resíduos perigosos via empresas homologadas com certificados", score: 100, order: 4 },
    ],
  },

  // 4. MATERIAIS (4 Perguntas)
  {
    id: "mat_1",
    pillar: Pillar.MATERIAIS,
    title: "Qual é o status de eliminação de plásticos descartáveis de uso único?",
    description: "Substituição de utensílios plásticos descartáveis por alternativas duráveis.",
    weight: 1.0,
    options: [
      { id: "mat_1_1", text: "Disponibilização livre de copos, pratos e talheres plásticos descartáveis", score: 0, order: 1 },
      { id: "mat_1_2", text: "Plásticos descartáveis presentes, mas com avisos incentivando a redução", score: 30, order: 2 },
      { id: "mat_1_3", text: "Fornecimento de canecas/garrafas duráveis para a equipe; descartáveis só para visitas", score: 75, order: 3 },
      { id: "mat_1_4", text: "100% banidos os utensílios plásticos descartáveis; uso exclusivo de duráveis e ecológicos", score: 100, order: 4 },
    ],
  },
  {
    id: "mat_2",
    pillar: Pillar.MATERIAIS,
    title: "Como a instituição gerencia o consumo de papel e a digitalização de processos?",
    description: "Iniciativas de escritório sem papel (Paperless) e assinaturas digitais.",
    weight: 1.0,
    options: [
      { id: "mat_2_1", text: "Processos e relatórios são rotineiramente impressos sem restrição", score: 0, order: 1 },
      { id: "mat_2_2", text: "Incentivo informal para impressão frente e verso e uso de rascunhos", score: 35, order: 2 },
      { id: "mat_2_3", text: "Processos e relatórios 80% digitalizados com assinaturas eletrônicas", score: 75, order: 3 },
      { id: "mat_2_4", text: "Escritório 100% digital (Paperless), papel apenas quando legalmente obrigatório e 100% reciclado/FSC", score: 100, order: 4 },
    ],
  },
  {
    id: "mat_3",
    pillar: Pillar.MATERIAIS,
    title: "A instituição adota critérios de sustentabilidade na seleção de fornecedores?",
    description: "Critérios socioambientais e compras verdes.",
    weight: 1.2,
    options: [
      { id: "mat_3_1", text: "Critério de compra 100% focado no menor preço, sem critério socioambiental", score: 0, order: 1 },
      { id: "mat_3_2", text: "Preferência informal por fornecedores locais ou com boa reputação", score: 35, order: 2 },
      { id: "mat_3_3", text: "Questionário socioambiental simples aplicado aos principais fornecedores no cadastro", score: 70, order: 3 },
      { id: "mat_3_4", text: "Política formal de Compras Verdes com auditoria periódica e exigência de certificações ecológicas", score: 100, order: 4 },
    ],
  },
  {
    id: "mat_4",
    pillar: Pillar.MATERIAIS,
    title: "Os produtos químicos de limpeza e higiene utilizados possuem certificação biodegradável?",
    description: "Impacto ambiental e toxicidade dos produtos de higienização predial.",
    weight: 0.8,
    options: [
      { id: "mat_4_1", text: "Produtos convencionais sem critério ecológico ou laudo de biodegradabilidade", score: 0, order: 1 },
      { id: "mat_4_2", text: "Alguns itens ecológicos comprados sem padronização", score: 35, order: 2 },
      { id: "mat_4_3", text: "Maioria dos produtos concentrados, biodegradáveis e com dosadores automáticos", score: 75, order: 3 },
      { id: "mat_4_4", text: "100% da linha de limpeza certificada com selo verde, refis concentrados e zero substâncias tóxicas", score: 100, order: 4 },
    ],
  },

  // 5. GESTÃO E GOVERNANÇA (4 Perguntas)
  {
    id: "ges_1",
    pillar: Pillar.GESTAO,
    title: "A instituição possui uma Política Ambiental ou de Sustentabilidade formalizada?",
    description: "Diretrizes institucionais escritas e aprovadas pela liderança.",
    weight: 1.2,
    options: [
      { id: "ges_1_1", text: "Não possui política ambiental nem diretrizes documentadas", score: 0, order: 1 },
      { id: "ges_1_2", text: "Existem intenções e compromissos verbais, mas nada documentado formalmente", score: 25, order: 2 },
      { id: "ges_1_3", text: "Política de Sustentabilidade documentada, aprovada pela direção e comunicada a todos", score: 75, order: 3 },
      { id: "ges_1_4", text: "Política de Sustentabilidade integrada ao Planejamento Estratégico, com metas públicas e revisão anual", score: 100, order: 4 },
    ],
  },
  {
    id: "ges_2",
    pillar: Pillar.GESTAO,
    title: "Existe uma pessoa ou comitê formalmente responsável por temas de sustentabilidade (ESG)?",
    description: "Governança ambiental e papéis definidos na equipe.",
    weight: 1.0,
    options: [
      { id: "ges_2_1", text: "Ninguém é formalmente encarregado de acompanhar questões de sustentabilidade", score: 0, order: 1 },
      { id: "ges_2_2", text: "Atribuição informal atribuída a alguém sem dedicação de tempo específica", score: 35, order: 2 },
      { id: "ges_2_3", text: "Comitê multidisciplinar de sustentabilidade ou responsável formal com reuniões periódicas", score: 75, order: 3 },
      { id: "ges_2_4", text: "Área/Comitê ESG estruturado com orçamento próprio, plano de trabalho anual e reporte direto à diretoria", score: 100, order: 4 },
    ],
  },
  {
    id: "ges_3",
    pillar: Pillar.GESTAO,
    title: "São realizados treinamentos e capacitações em práticas sustentáveis para os colaboradores?",
    description: "Educação ambiental e engajamento da equipe.",
    weight: 1.0,
    options: [
      { id: "ges_3_1", text: "Nunca foram realizados treinamentos ou palestras sobre sustentabilidade", score: 0, order: 1 },
      { id: "ges_3_2", text: "Ações esporádicas apenas em datas comemorativas (ex: Dia do Meio Ambiente)", score: 35, order: 2 },
      { id: "ges_3_3", text: "Treinamento obrigatório na integração de novos colaboradores e campanhas semestrais", score: 75, order: 3 },
      { id: "ges_3_4", text: "Programa contínuo de educação ambiental com premiação de ideias sustentáveis e indicadores", score: 100, order: 4 },
    ],
  },
  {
    id: "ges_4",
    pillar: Pillar.GESTAO,
    title: "A instituição possui metas quantitativas para redução de impactos ambientais?",
    description: "Metas numéricas de consumo de água, energia, papel ou resíduos.",
    weight: 1.2,
    options: [
      { id: "ges_4_1", text: "Não há metas quantitativas estabelecidas", score: 0, order: 1 },
      { id: "ges_4_2", text: "Metas genéricas qualitativas (ex: 'economizar mais energia')", score: 25, order: 2 },
      { id: "ges_4_3", text: "Metas quantitativas anuais estabelecidas para redução de água, energia e resíduos", score: 75, order: 3 },
      { id: "ges_4_4", text: "Metas científicas com inventário de emissões de GEE e plano claro de descarbonização", score: 100, order: 4 },
    ],
  },
];

export const PILLAR_NAMES: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "Energia e Clima",
  [Pillar.AGUA]: "Gestão Hídrica",
  [Pillar.RESIDUOS]: "Resíduos e Reciclagem",
  [Pillar.MATERIAIS]: "Materiais e Compras Verdes",
  [Pillar.GESTAO]: "Governança e Práticas ESG",
};

export const PILLAR_COLORS: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "#eab308", // amarelo / âmbar
  [Pillar.AGUA]: "#0284c7",    // azul
  [Pillar.RESIDUOS]: "#16a34a",// verde
  [Pillar.MATERIAIS]: "#f97316", // laranja
  [Pillar.GESTAO]: "#8b5cf6",  // roxo
};
