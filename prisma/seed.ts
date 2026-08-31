import "dotenv/config";
import { Pillar } from "@prisma/client";
import { prisma } from "../app/_lib/prisma";




interface SeedOption {
  text: string;
  score: number;
  order: number;
  allowsCustomText?: boolean;
}

interface SeedQuestion {
  pillar: Pillar;
  title: string;
  description?: string;
  weight?: number;
  options: SeedOption[];
}

const seedQuestions: SeedQuestion[] = [
  // =================================================================
  // 1. PILAR ENERGIA (7 Perguntas)
  // =================================================================
  {
    pillar: Pillar.ENERGIA,
    title: "A instituição acompanha mensalmente o consumo de energia elétrica?",
    description: "Avalia a rotina de monitoramento de faturas e histórico de consumo em kWh.",
    weight: 1.0,
    options: [
      { text: "Não acompanhamos o consumo de energia elétrica", score: 0, order: 1 },
      { text: "Acompanhamos apenas o valor financeiro da conta quando há aumento atípico", score: 25, order: 2 },
      { text: "Acompanhamos o consumo mensal em kWh e mantemos histórico", score: 65, order: 3 },
      { text: "Acompanhamos mensalmente por setor/área e possuímos metas claras de redução de consumo", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.ENERGIA,
    title: "Qual é o nível de eficiência dos sistemas de iluminação da instituição?",
    description: "Avalia a transição para lâmpadas de LED e automação por sensores.",
    weight: 1.0,
    options: [
      { text: "Predominância de lâmpadas incandescentes ou fluorescentes antigas", score: 0, order: 1 },
      { text: "Mais de 50% das lâmpadas já foram substituídas por LED", score: 50, order: 2 },
      { text: "100% dos ambientes utilizam lâmpadas de LED", score: 80, order: 3 },
      { text: "100% LED com sensores de presença em corredores/banheiros e automação de iluminação", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.ENERGIA,
    title: "A instituição utiliza fontes de energia renovável (ex: solar, eólica ou biomassa)?",
    description: "Verifica a matriz energética própria ou adquirida.",
    weight: 1.2,
    options: [
      { text: "100% da energia provém da rede elétrica convencional sem certificados renováveis", score: 0, order: 1 },
      { text: "Em fase de estudo de viabilidade ou projeto para aquisição de energia renovável", score: 25, order: 2 },
      { text: "Possui sistema solar fotovoltaico próprio que supre parte do consumo (ou compra energia no Mercado Livre incentivado)", score: 75, order: 3 },
      { text: "Autossuficiente ou mais de 80% do consumo atendido por geração solar própria ou 100% renovável certificada (I-REC)", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.ENERGIA,
    title: "Existe uma rotina formal para desligamento de equipamentos e combate ao consumo em standby?",
    description: "Avalia práticas operacionais para evitar desperdício fora do horário de funcionamento.",
    weight: 1.0,
    options: [
      { text: "Computadores, luzes e aparelhos frequentemente permanecem ligados à noite ou fins de semana", score: 0, order: 1 },
      { text: "Desligamento depende da iniciativa individual sem aviso ou conferência", score: 30, order: 2 },
      { text: "Campanhas de conscientização ativas e equipe designada para checagem ao final do expediente", score: 70, order: 3 },
      { text: "Temporizadores/sensores automáticos para desligamento e política mandatória de standby zero", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.ENERGIA,
    title: "Como é realizada a gestão dos aparelhos de ar-condicionado e climatização?",
    description: "Eficiência dos equipamentos, regulação de temperatura e manutenção.",
    weight: 1.0,
    options: [
      { text: "Aparelhos antigos (sem selo Procel A), sem limpeza periódica e temperatura desregulada", score: 0, order: 1 },
      { text: "Aparelhos mistos com manutenção apenas quando apresentam defeito", score: 35, order: 2 },
      { text: "Aparelhos com tecnologia Inverter (Selo Procel A) e plano preventivo de limpeza semestral", score: 75, order: 3 },
      { text: "Climatização eficiente, temperatura padronizada em 23-24°C, manutenção preventiva contínua e priorização da ventilação natural", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.ENERGIA,
    title: "Qual o critério de eficiência energética na aquisição de novos equipamentos eletroeletrônicos?",
    description: "Avaliação do ciclo de vida e consumo energético nas compras.",
    weight: 1.0,
    options: [
      { text: "Critério exclusivo de menor preço de aquisição, sem avaliar o consumo de energia", score: 0, order: 1 },
      { text: "Eficiência energética é considerada de forma informal quando o custo é similar", score: 35, order: 2 },
      { text: "Exigência de Selo Procel A ou Energy Star na maioria das novas aquisições", score: 75, order: 3 },
      { text: "Política obrigatória de compras sustentáveis com análise de custo do ciclo de vida e máxima eficiência", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.ENERGIA,
    title: "A instituição realiza manutenção preventiva em sua infraestrutura elétrica?",
    description: "Segurança operacional, termografia e eliminação de perdas na rede elétrica.",
    weight: 0.8,
    options: [
      { text: "Manutenção ocorre apenas em casos de falhas, queima de equipamentos ou curtos", score: 0, order: 1 },
      { text: "Inspeções visuais esporádicas sem cronograma fixo", score: 30, order: 2 },
      { text: "Cronograma anual de manutenção preventiva nos quadros e fiações principais", score: 75, order: 3 },
      { text: "Plano estruturado de manutenção preditiva com laudos termográficos e balanceamento de cargas", score: 100, order: 4 },
    ],
  },

  // =================================================================
  // 2. PILAR ÁGUA (6 Perguntas)
  // =================================================================
  {
    pillar: Pillar.AGUA,
    title: "Como a instituição monitora o consumo de água?",
    description: "Acompanhamento de hidrômetros, faturas e detecção de anomalias.",
    weight: 1.0,
    options: [
      { text: "Não há monitoramento do volume de água consumido", score: 0, order: 1 },
      { text: "Acompanhamento apenas do valor financeiro da fatura de água", score: 30, order: 2 },
      { text: "Leitura periódica do hidrômetro e histórico em m³ para detecção de variações anormais", score: 70, order: 3 },
      { text: "Telemetria / medição individualizada por setor com metas de redução e alarmes automáticos de vazamento", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.AGUA,
    title: "As torneiras, sanitários e chuveiros possuem dispositivos economizadores de água?",
    description: "Uso de aeradores, temporizadores, descargas de duplo fluxo e válvulas ecológicas.",
    weight: 1.0,
    options: [
      { text: "Dispositivos convencionais sem nenhum tipo de redutor de vazão", score: 0, order: 1 },
      { text: "Poucos pontos isolados contam com aeradores ou torneiras de fechamento automático", score: 35, order: 2 },
      { text: "Mais de 70% das torneiras contam com aeradores/temporizadores e sanitários com descarga dupla", score: 75, order: 3 },
      { text: "100% das instalações contam com tecnologias economizadoras (sensores, redutores e descarga duo 3L/6L)", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.AGUA,
    title: "A instituição possui sistema de captação e aproveitamento de água da chuva?",
    description: "Coleta pluvial para limpeza de calçadas, irrigação e bacias sanitárias.",
    weight: 1.2,
    options: [
      { text: "Não há sistema de captação de água pluvial", score: 0, order: 1 },
      { text: "Coleta informal de água em pequenos recipientes para rega de plantas", score: 30, order: 2 },
      { text: "Cisterna instalada com capacidade para atender à limpeza externa e jardinagem", score: 75, order: 3 },
      { text: "Sistema completo de captação pluvial com filtragem integrado às descargas sanitárias e lavagens", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.AGUA,
    title: "Existe rotina estruturada para inspeção e combate a vazamentos de água?",
    description: "Prevenção e conserto imediato de vazamentos em tubulações, caixas d'água e sanitários.",
    weight: 1.0,
    options: [
      { text: "Reparos ocorrem apenas após vazamentos visíveis de grande porte ou aumento súbito na conta", score: 0, order: 1 },
      { text: "Inspeções esporádicas quando algum colaborador reporta", score: 35, order: 2 },
      { text: "Ronda preventiva mensal em sanitários, boias de caixas d'água e tubulações", score: 75, order: 3 },
      { text: "Procedimento operacional padrão (POP) de vistoria semanal com equipe capacitada para conserto em até 24h", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.AGUA,
    title: "Existe reúso de águas cinzas ou tratamento próprio de efluentes?",
    description: "Reaproveitamento de água de pias, bebedouros ou processos para outros fins.",
    weight: 1.0,
    options: [
      { text: "Todo efluente é descartado diretamente no esgoto sem nenhum tipo de reúso", score: 0, order: 1 },
      { text: "Estudos preliminares de viabilidade sem implementação prática", score: 25, order: 2 },
      { text: "Reúso de água de descarte de purificadores ou ar-condicionado para limpeza de chão", score: 70, order: 3 },
      { text: "Estação de tratamento ou sistema de reúso de águas cinzas para descarga e irrigação", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.AGUA,
    title: "Como é realizada a rega de jardins e áreas verdes da instituição?",
    description: "Uso de espécies adequadas e horários com menor taxa de evaporação.",
    weight: 0.8,
    options: [
      { text: "Uso de mangueiras convencionais com água potável nos horários mais quentes do dia", score: 0, order: 1 },
      { text: "Rega manual com água potável nos horários adequados (início da manhã ou fim de tarde)", score: 40, order: 2 },
      { text: "Paisagismo com espécies nativas de baixo consumo hídrico e uso de água não potável/chuva", score: 75, order: 3 },
      { text: "Irrigação automatizada por gotejamento com sensores de umidade do solo e abastecimento 100% por água de chuva/reúso", score: 100, order: 4 },
    ],
  },

  // =================================================================
  // 3. PILAR RESÍDUOS (6 Perguntas)
  // =================================================================
  {
    pillar: Pillar.RESIDUOS,
    title: "A instituição realiza a separação de resíduos na fonte (coleta seletiva)?",
    description: "Presença de lixeiras identificadas e adesão dos colaboradores.",
    weight: 1.2,
    options: [
      { text: "Não há coleta seletiva; todos os resíduos são misturados no mesmo recipiente", score: 0, order: 1 },
      { text: "Separação ocorre apenas em alguns pontos isolados (ex: papelão no estoque)", score: 30, order: 2 },
      { text: "Lixeiras para resíduos recicláveis (secos) e não recicláveis (orgânico/rejeito) em todos os setores", score: 75, order: 3 },
      { text: "Estações completas de coleta seletiva segregada (papel, plástico, metal, vidro, orgânico e rejeito) com alta adesão", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.RESIDUOS,
    title: "Qual é a destinação final dada aos materiais recicláveis?",
    description: "Encaminhamento correto para cooperativas, recicladores ou aterros.",
    weight: 1.0,
    options: [
      { text: "Os recicláveis são recolhidos pelo caminhão de lixo comum e enviados a aterros", score: 0, order: 1 },
      { text: "Entregues esporadicamente a catadores informais sem controle de quantidade", score: 35, order: 2 },
      { text: "Parceria formal com cooperativa de catadores cadastrada ou empresa de reciclagem", score: 80, order: 3 },
      { text: "Destinação 100% rastreada com emissão de Manifesto de Transporte de Resíduos (MTR) e certificado de reciclagem", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.RESIDUOS,
    title: "Como a instituição lida com os resíduos orgânicos (restos de alimentos, podas, etc.)?",
    description: "Compostagem, biodigestão ou descarte de orgânicos.",
    weight: 1.0,
    options: [
      { text: "Todos os resíduos orgânicos vão para o lixo comum e aterro sanitário", score: 0, order: 1 },
      { text: "Separação apenas das podas de jardim, mas alimentos vão para o aterro", score: 30, order: 2 },
      { text: "Composteira ou minhocário interno tratando parte dos resíduos orgânicos de copas/refeitórios", score: 75, order: 3 },
      { text: "100% dos resíduos orgânicos passam por compostagem interna ou parceira, gerando adubo para hortas e jardins", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.RESIDUOS,
    title: "Como é feito o descarte de resíduos perigosos e eletrônicos (pilhas, baterias, lâmpadas, e-waste)?",
    description: "Cumprimento da legislação de logística reversa e descarte seguro.",
    weight: 1.2,
    options: [
      { text: "Descartados junto ao lixo comum sem cuidados especiais", score: 0, order: 1 },
      { text: "Acumulados em almoxarifados sem destinação periódica regular", score: 25, order: 2 },
      { text: "Entregues em pontos de coleta autorizados ou logística reversa quando atingem volume", score: 75, order: 3 },
      { text: "Plano formal de gerenciamento de resíduos perigosos com descarte via empresas homologadas e certificados ambientais", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.RESIDUOS,
    title: "Existem metas ou iniciativas ativas para redução na geração de resíduos na fonte?",
    description: "Princípio do lixo zero (Zero Waste) e prevenção do desperdício.",
    weight: 1.0,
    options: [
      { text: "Não existem iniciativas voltadas à redução na fonte de resíduos", score: 0, order: 1 },
      { text: "Campanhas de conscientização pontuais sem metas mensuráveis", score: 35, order: 2 },
      { text: "Substituição de embalagens individuais por compras a granel e incentivo ao reuso interno de caixas", score: 75, order: 3 },
      { text: "Programa estruturado rumo ao Aterro Zero com metas anuais de redução de volume e pesagem periódica de resíduos", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.RESIDUOS,
    title: "A instituição pratica logística reversa de insumos com seus fornecedores?",
    description: "Devolução de toners, galões, paletes e embalagens aos fabricantes.",
    weight: 0.8,
    options: [
      { text: "Nenhum fornecedor recebe embalagens ou itens usados de volta", score: 0, order: 1 },
      { text: "Logística reversa realizada apenas para cartuchos de impressora / toners", score: 40, order: 2 },
      { text: "Acordos com fornecedores para devolução de paletes, bombonas e embalagens de transporte", score: 75, order: 3 },
      { text: "Cadeia integrada de logística reversa com fornecedores para todos os insumos retornáveis e circulares", score: 100, order: 4 },
    ],
  },

  // =================================================================
  // 4. PILAR MATERIAIS (6 Perguntas)
  // =================================================================
  {
    pillar: Pillar.MATERIAIS,
    title: "Qual é o status de eliminação de plásticos descartáveis de uso único (copos, talheres, mexedores)?",
    description: "Substituição de utensílios plásticos descartáveis por alternativas duráveis.",
    weight: 1.0,
    options: [
      { text: "Disponibilização livre de copos, pratos e talheres plásticos descartáveis em todos os setores", score: 0, order: 1 },
      { text: "Plásticos descartáveis ainda presentes, mas com cartazes incentivando a redução", score: 30, order: 2 },
      { text: "Fornecimento de canecas/garrafas duráveis para a equipe, mantendo descartáveis apenas para visitantes", score: 75, order: 3 },
      { text: "100% banidos os utensílios plásticos descartáveis da instituição; uso exclusivo de duráveis e biodegradáveis", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.MATERIAIS,
    title: "Como a instituição gerencia o consumo de papel e a digitalização de processos?",
    description: "Iniciativas de escritório sem papel (Paperless) e assinaturas digitais.",
    weight: 1.0,
    options: [
      { text: "Processos e relatórios são rotineiramente impressos sem restrição", score: 0, order: 1 },
      { text: "Incentivo informal para impressão frente e verso e uso de rascunhos", score: 35, order: 2 },
      { text: "Processos administrativos e memorandos 80% digitalizados com assinaturas eletrônicas", score: 75, order: 3 },
      { text: "Escritório 100% digital (Paperless), papel utilizado apenas quando obrigatório por lei e 100% reciclado/FSC", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.MATERIAIS,
    title: "A instituição adota critérios de sustentabilidade na seleção e homologação de fornecedores?",
    description: "Critérios socioambientais e compras verdes.",
    weight: 1.2,
    options: [
      { text: "Critério de compra 100% focado no menor preço, sem avaliação de conformidade socioambiental", score: 0, order: 1 },
      { text: "Preferência informal por fornecedores locais ou com boa reputação", score: 35, order: 2 },
      { text: "Questionário socioambiental simples aplicado aos principais fornecedores no cadastro", score: 70, order: 3 },
      { text: "Política formal de Compras Verdes com auditoria periódica e exigência de certificações ecológicas dos parceiros", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.MATERIAIS,
    title: "Os produtos químicos de limpeza e higiene utilizados possuem certificação biodegradável?",
    description: "Impacto ambiental e toxicidade dos produtos de higienização predial.",
    weight: 0.8,
    options: [
      { text: "Produtos convencionais sem critério ecológico ou laudo de biodegradabilidade", score: 0, order: 1 },
      { text: "Alguns itens ecológicos comprados sem padronização", score: 35, order: 2 },
      { text: "Maioria dos produtos concentrados, biodegradáveis e com dosadores automáticos para evitar excessos", score: 75, order: 3 },
      { text: "100% da linha de limpeza certificada com selo verde, refis concentrados e zero substâncias tóxicas restritas", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.MATERIAIS,
    title: "Na aquisição de mobiliário e materiais de reforma, há preferência por itens certificados/reciclados?",
    description: "Madeira com certificação FSC, tintas à base de água e materiais de baixo impacto.",
    weight: 1.0,
    options: [
      { text: "Sem exigência de critérios ecológicos em reformas ou compras de móveis", score: 0, order: 1 },
      { text: "Verificação informal da durabilidade dos materiais", score: 30, order: 2 },
      { text: "Exigência de madeira certificada (FSC/CERFLOR), tintas com baixo VOC e prioridade para móveis consertáveis", score: 75, order: 3 },
      { text: "Diretriz de arquitetura e design circular: materiais reciclados, desmontáveis, reaproveitamento estrutural e carbono neutro", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.MATERIAIS,
    title: "Como a instituição gerencia uniformes, tecidos e equipamentos de proteção (EPIs)?",
    description: "Durabilidade, tecidos sustentáveis e destinação adequada ao final da vida útil.",
    weight: 0.8,
    options: [
      { text: "Sem controle sobre descarte têxtil; uniformes velhos são descartados no lixo comum", score: 0, order: 1 },
      { text: "Doação informal ou reutilização interna de panos de limpeza", score: 35, order: 2 },
      { text: "Uniformes com tecido durável e programa interno de descaracterização e doação responsável", score: 75, order: 3 },
      { text: "Uniformes confeccionados com fios reciclados/algodão agroecológico e logística reversa têxtil 100% circular", score: 100, order: 4 },
    ],
  },

  // =================================================================
  // 5. PILAR GESTÃO E PRÁTICAS SUSTENTÁVEIS (7 Perguntas)
  // =================================================================
  {
    pillar: Pillar.GESTAO,
    title: "A instituição possui uma Política Ambiental ou de Sustentabilidade formalizada?",
    description: "Diretrizes institucionais escritas e aprovadas pela liderança.",
    weight: 1.2,
    options: [
      { text: "Não possui política ambiental nem diretrizes documentadas", score: 0, order: 1 },
      { text: "Existem intenções e compromissos verbais, mas nada documentado formalmente", score: 25, order: 2 },
      { text: "Política de Sustentabilidade documentada, aprovada pela direção e comunicada a todos os setores", score: 75, order: 3 },
      { text: "Política de Sustentabilidade integrada ao Planejamento Estratégico, com metas públicas e revisão anual", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.GESTAO,
    title: "Existe uma pessoa ou comitê formalmente responsável por temas de sustentabilidade (ESG)?",
    description: "Governança ambiental e papéis definidos na equipe.",
    weight: 1.0,
    options: [
      { text: "Ninguém é formalmente encarregado de acompanhar questões de sustentabilidade", score: 0, order: 1 },
      { text: "Atribuição informal atribuída a alguém do RH ou Facilities sem dedicação de tempo", score: 35, order: 2 },
      { text: "Comitê multidisciplinar de sustentabilidade ou responsável formal com reuniões periódicas", score: 75, order: 3 },
      { text: "Área/Comitê ESG estruturado com orçamento próprio, plano de trabalho anual e reporte direto à alta gestão", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.GESTAO,
    title: "São realizados treinamentos e capacitações em práticas sustentáveis para os colaboradores?",
    description: "Educação ambiental e engajamento da equipe.",
    weight: 1.0,
    options: [
      { text: "Nunca foram realizados treinamentos ou palestras sobre sustentabilidade", score: 0, order: 1 },
      { text: "Ações esporádicas apenas em datas comemorativas (ex: Dia do Meio Ambiente)", score: 35, order: 2 },
      { text: "Treinamento obrigatório na integração de novos colaboradores e campanhas semestrais de conscientização", score: 75, order: 3 },
      { text: "Programa contínuo de educação ambiental com premiação de ideias sustentáveis dos funcionários e indicadores de adesão", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.GESTAO,
    title: "A instituição possui metas quantitativas para redução de impactos ambientais?",
    description: "Metas numéricas de consumo de água, energia, papel ou emissões de carbono.",
    weight: 1.2,
    options: [
      { text: "Não há metas quantitativas estabelecidas", score: 0, order: 1 },
      { text: "Metas genéricas qualitativas (ex: 'economizar mais energia')", score: 25, order: 2 },
      { text: "Metas quantitativas anuais estabelecidas para redução de água, energia e resíduos", score: 75, order: 3 },
      { text: "Metas científicas (SBTi) com inventário de emissões de Gases de Efeito Estufa (GEE) e plano de descarbonização", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.GESTAO,
    title: "Como a instituição comunica seus resultados e indicadores de sustentabilidade?",
    description: "Transparência interna e relatórios públicos para partes interessadas.",
    weight: 0.8,
    options: [
      { text: "Não há divulgação de informações sobre desempenho ambiental", score: 0, order: 1 },
      { text: "Divulgação esporádica e informal em murais ou e-mails internos", score: 35, order: 2 },
      { text: "Relatório anual interno com indicadores de desempenho ambiental apresentado à equipe e diretoria", score: 75, order: 3 },
      { text: "Relatório de Sustentabilidade público (modelo GRI ou similar) amplamente divulgado no site e redes", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.GESTAO,
    title: "A instituição mantém monitoramento regular de sua conformidade legal ambiental?",
    description: "Licenciamento, outorgas, alvarás e cumprimento das leis ambientais.",
    weight: 1.0,
    options: [
      { text: "Não possui controle de exigências legais ou licenças ambientais aplicáveis", score: 0, order: 1 },
      { text: "Regularização apenas reativa quando notificada por órgãos fiscalizadores", score: 25, order: 2 },
      { text: "Matriz de requisitos legais atualizada e todas as licenças/outorgas vigentes", score: 80, order: 3 },
      { text: "Sistema de Gestão Ambiental (SGA) com auditorias internas periódicas de conformidade legal", score: 100, order: 4 },
    ],
  },
  {
    pillar: Pillar.GESTAO,
    title: "A instituição desenvolve ou apoia projetos socioambientais junto à comunidade local?",
    description: "Responsabilidade social, apoio a ONGs ecológicas e impacto positivo local.",
    weight: 0.8,
    options: [
      { text: "Não realiza ações ou projetos socioambientais na comunidade", score: 0, order: 1 },
      { text: "Doações pontuais esporádicas sem acompanhamento de impacto", score: 35, order: 2 },
      { text: "Parcerias ativas com escolas ou ONGs locais em projetos de arborização, reciclagem ou educação", score: 75, order: 3 },
      { text: "Programa estruturado de responsabilidade socioambiental comunitária com métricas de impacto e voluntariado corporativo", score: 100, order: 4 },
    ],
  },
];

async function main() {
  console.log("🌱 Iniciando o seed de perguntas do Eco Diagnóstico...");

  // Limpa perguntas existentes para reinserção limpa e consistente
  console.log("🧹 Limpando dados anteriores de perguntas...");
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();

  let totalQuestions = 0;
  let totalOptions = 0;

  for (const q of seedQuestions) {
    await prisma.question.create({
      data: {
        pillar: q.pillar,
        title: q.title,
        description: q.description,
        weight: q.weight ?? 1.0,
        isActive: true,
        options: {
          create: q.options.map((opt) => ({
            text: opt.text,
            score: opt.score,
            order: opt.order,
            allowsCustomText: opt.allowsCustomText ?? false,
          })),
        },
      },
    });

    totalQuestions++;
    totalOptions += q.options.length;
    console.log(`✅ [${q.pillar}] Pergunta inserida: "${q.title.slice(0, 45)}..."`);
  }

  console.log("\n==========================================");
  console.log(`🎉 Seed concluído com sucesso!`);
  console.log(`📊 Total de Perguntas cadastradas: ${totalQuestions}`);
  console.log(`🔘 Total de Opções pontuadas: ${totalOptions}`);
  console.log(`⚡ Energia: ${seedQuestions.filter((q) => q.pillar === Pillar.ENERGIA).length} perguntas`);
  console.log(`💧 Água: ${seedQuestions.filter((q) => q.pillar === Pillar.AGUA).length} perguntas`);
  console.log(`♻️ Resíduos: ${seedQuestions.filter((q) => q.pillar === Pillar.RESIDUOS).length} perguntas`);
  console.log(`📦 Materiais: ${seedQuestions.filter((q) => q.pillar === Pillar.MATERIAIS).length} perguntas`);
  console.log(`💼 Gestão: ${seedQuestions.filter((q) => q.pillar === Pillar.GESTAO).length} perguntas`);
  console.log("==========================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
