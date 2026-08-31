"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/app/_components/ui/questionnaire";
import { ProgressQuestions } from "./progress-questions";
import {
  submitDiagnosticAction,
  type QuestionWithOptions,
} from "../_actions/diagnostic-actions";

interface QuestionnaireFreeformProps {
  questions: QuestionWithOptions[];
}

export function QuestionnaireFreeform({
  questions,
}: QuestionnaireFreeformProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [answeredCount, setAnsweredCount] = React.useState(0);

  function handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    let count = 0;
    for (const q of questions) {
      if (formData.get(`question_${q.id}`)) {
        count++;
      }
    }
    setAnsweredCount(count);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const answers: {
        questionId: string;
        selectedOptionId?: string;
        customText?: string;
      }[] = [];

      for (const question of questions) {
        const selectedValue = formData.get(`question_${question.id}`) as string;
        const customValue = formData.get(`custom_${question.id}`) as string;

        answers.push({
          questionId: question.id,
          selectedOptionId: selectedValue || undefined,
          customText: customValue || undefined,
        });
      }

      const res = await submitDiagnosticAction({ answers });

      if (res.success && res.diagnosticId) {
        toast.success("Diagnóstico concluído!", {
          description: `Índice de sustentabilidade: ${res.overallScore}/100`,
        });
        router.push(`/resultados/${res.diagnosticId}`);
      } else {
        toast.error("Não foi possível processar as respostas.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao salvar o diagnóstico.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* BARRA DE PROGRESSO COM CONTAGEM EM TEMPO REAL (INICIA EM 0/20) */}
      <ProgressQuestions
        totalQuestions={questions.length}
        answeredQuestions={answeredCount}
      />

      <div className="h-fit w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <Questionnaire
          className="w-full max-w-none gap-6"
          shortcuts="letters"
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        >
          {questions.map((question, index) => (
            <QuestionnaireItem
              key={question.id}
              name={`question_${question.id}`}
              required
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700">
                  <span>Questão {index + 1} de {questions.length}</span>
                  <span>•</span>
                  <span>{question.pillar}</span>
                </div>

                <QuestionnaireTitle>{question.title}</QuestionnaireTitle>

                {question.description && (
                  <QuestionnaireDescription>
                    {question.description}
                  </QuestionnaireDescription>
                )}

                <QuestionnaireChoices>
                  {question.options.map((option) => (
                    <QuestionnaireChoice key={option.id} value={option.id}>
                      {option.text}
                    </QuestionnaireChoice>
                  ))}

                  <QuestionnaireInput
                    aria-label="Outra resposta"
                    placeholder="Outro..."
                  />
                </QuestionnaireChoices>

                <QuestionnaireError />
              </div>
            </QuestionnaireItem>
          ))}

          {/* BOTÕES DE NAVEGAÇÃO E ENVIO DO COMPONENTE ORIGINAL */}
          <QuestionnaireActions className="border-t border-gray-100 pt-5">
            <QuestionnairePrevious variant="outline">
              Anterior
            </QuestionnairePrevious>
            <QuestionnaireSkip variant="outline">
              Pular
            </QuestionnaireSkip>
            <QuestionnaireNext className="bg-green-600 text-white hover:bg-green-700">
              Próxima
            </QuestionnaireNext>
            <QuestionnaireSubmit
              disabled={isSubmitting}
              className="bg-green-600 px-5 text-white hover:bg-green-700"
            >
              {isSubmitting ? "Salvando..." : "Finalizar Diagnóstico"}
            </QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </div>
    </div>
  );
}
