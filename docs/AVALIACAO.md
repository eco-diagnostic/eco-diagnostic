# Avaliação acadêmica do Eco Diagnóstico

Esta revisão considera a versão mobile em React Native/Expo, presente na branch padrão `mobile`. A branch `master` possui uma linha de desenvolvimento separada.

## Objetivo e limites do protótipo

O aplicativo transforma uma autoavaliação de 20 questões em notas de maturidade ambiental, identifica prioridades e oferece recomendações. São cinco pilares: energia, água, resíduos, materiais e governança.

As notas são indicadores definidos pelo projeto para fins acadêmicos. Não equivalem a uma certificação ambiental ou auditoria independente. As recomendações de IA dependem das informações fornecidas e precisam de revisão humana. Os pesos e faixas atuais foram preservados nesta revisão; sua validação com especialistas é uma evolução proposta.

## Melhorias implementadas nesta revisão

| Problema observado | Alteração | Evidência |
| --- | --- | --- |
| O motor tratava respostas ausentes como zero e aceitava pontuações arbitrárias | Validar respostas finitas entre 0 e 100, correspondentes às alternativas; rejeitar questões duplicadas, pesos inválidos e ausência de pilares | `tests/calc.test.cjs` |
| A saída do questionário era liberada antes do cálculo | Calcular e validar antes de liberar a navegação; apresentar mensagem para revisar respostas incompatíveis | `src/screens/QuizScreen.tsx` |
| Nome, setor e textos da IA eram inseridos diretamente no HTML | Escapar caracteres de marcação e separar o template das APIs nativas de impressão | `tests/reportHtml.test.cjs` |
| Não havia comandos de teste nem de verificação de tipos | Acrescentar `npm run typecheck`, `npm test` e `npm run check`, sem dependências adicionais | `package.json` |

## Metodologia de cálculo

1. Cada questão tem um peso positivo e alternativas com pontuação entre 0 e 100.
2. Para cada pilar: somar `pontuação × peso`, dividir pela soma dos pesos e arredondar para inteiro.
3. A nota geral é a média aritmética das cinco notas dos pilares, arredondada. Os pilares têm o mesmo peso na nota geral.
4. O pilar crítico é o de menor nota. Em empate, prevalece a ordem: energia, água, resíduos, materiais e governança.
5. As recomendações priorizam questões abaixo de 70 pontos, primeiro no pilar crítico e depois pela menor pontuação. A partir de 90 pontos gerais, são propostas ações de liderança em sustentabilidade.

| Nota geral | Classificação |
| --- | --- |
| 0–39 | Crítico |
| 40–69 | Em desenvolvimento |
| 70–89 | Avançado |
| 90–100 | Sustentável |

Exemplo reproduzível: responder com 100 apenas à questão `en_3` e com zero às demais gera 29 em energia (`100 × 1,2 ÷ 4,2`, arredondado), zero nos outros pilares e nota geral 6.

## Verificação automatizada

Requer Node.js 24 e as dependências do projeto:

```bash
npm ci
npm run check
```

São 12 testes utilizando o executor nativo do Node.js. O TypeScript compila apenas os módulos puros para `.test-build/`; nenhum teste chama o Gemini, abre a câmera, imprime ou altera o histórico do aparelho. O comando `typecheck` verifica separadamente os tipos de todo o app.

## Roteiro de demonstração no celular

Use uma instituição fictícia. Antes de excluir dados, confirme que o aparelho não contém avaliações que devam ser preservadas.

| Etapa | Ação | Resultado esperado |
| --- | --- | --- |
| 1 | Informar `Escola Verde A & B` e escolher o setor Educação | Iniciar questionário identificado |
| 2 | Tentar avançar sem marcar alternativa | Exibir aviso e permanecer na pergunta |
| 3 | Responder algumas perguntas, voltar e escolher salvar e sair | Exibir rascunho no Início e permitir retomada |
| 4 | Concluir com a primeira alternativa em todas as questões | Nota zero, nível Crítico e cinco pilares com zero |
| 5 | Fazer outra avaliação da mesma instituição com a última alternativa em todas as questões | Nota 100, nível Sustentável e recomendações de liderança |
| 6 | Abrir Painel e Histórico | Exibir a avaliação mais recente e as avaliações anteriores |
| 7 | Gerar e compartilhar PDF | Preservar o nome `A & B`, notas e recomendações; abrir o compartilhamento nativo |
| 8 | Sem configurar chave, solicitar consultoria IA | Exibir mensagem de chave ausente; diagnóstico e PDF continuam disponíveis |
| 9 | Opcionalmente configurar uma chave de teste e solicitar consultoria | Exibir as iniciativas e manter a consultoria ao reabrir a avaliação |

Este roteiro descreve os testes manuais a executar. Os testes automatizados não comprovam o funcionamento da biometria, da impressão, do compartilhamento, da paginação A4 ou da API real em um dispositivo.

## Próximas melhorias propostas

| Prioridade | Melhoria | Motivo e critério de aceite |
| --- | --- | --- |
| Alta, antes de distribuição pública | Mover a chamada do Gemini para um backend | A chave `EXPO_PUBLIC_GEMINI_API_KEY` fica no bundle. O APK público deve chamar um serviço autenticado, sem conter a chave do provedor |
| Alta | Validar a estrutura dos dados lidos do AsyncStorage e informar falhas de persistência | O serviço atual aceita o JSON sem conferir o formato e usa memória quando uma gravação falha. Histórico inválido não deve quebrar telas, e a pessoa deve saber quando algo não foi salvo permanentemente |
| Alta | Validar o esquema completo da resposta de IA | JSON válido pode conter campos ou iniciativas incompatíveis. Exibir erro recuperável quando a estrutura recebida não atender ao contrato |
| Média | Comparar evolução apenas entre avaliações da mesma organização | Hoje o histórico compara os dois registros mais recentes, mesmo com nomes diferentes. Introduzir um identificador estável e um filtro antes de calcular evolução |
| Média | Tornar a retomada de rascunhos compatível com mudanças no questionário | Validar índice, alternativas e versão das perguntas; orientar revisão quando houver incompatibilidade |
| Média | Melhorar acessibilidade e testar com leitor de tela | Anunciar alternativa selecionada, descrever botões de ícone e verificar tamanho de fonte ampliado |
| Média | Revisar paginação e linguagem do relatório | Textos longos de IA podem ultrapassar uma página. Evitar prometer documento oficial ou auditoria concluída em um protótipo de autoavaliação |
| Acadêmica | Justificar os pesos e faixas com bibliografia e validação de especialistas | Explicitar como a metodologia foi definida e documentar suas limitações |

Estas propostas não foram implementadas nesta revisão e devem ser priorizadas com o grupo.
