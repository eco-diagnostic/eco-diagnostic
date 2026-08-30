"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/app/_components/ui/questionnaire";

const questionnaireData = [
  {
    title: "A instituição acompanha mensalmente o consuo de energia elétrica?",
    description:
      "Vocês acompanham o consumo de energia elétrica da instituição mensalmente?",
    questions: [
      {
        value: "Não acompanhamos o consumo de energia elétrica mensalmente",
      },
      {
        value: "Acompanhamos apenas quando identifica aumento",
      },
      {
        value: "Acompanha mensalmente",
      },
      {
        value: "Acompanha e possui metas de redução de consumo",
      },
    ],
  },
];

export function QuestionnaireFreeform() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const approach = new FormData(event.currentTarget).get("questions");

    toast.success("Sua escolha foi registrada", {
      description: `Você escolheu a opção: ${approach}`,
    });
  }

  return (
    <Questionnaire
      className="w-full max-w-none gap-6"
      shortcuts="letters"
      onSubmit={handleSubmit}
    >
      <QuestionnaireItem name={`questions`} required>
        {questionnaireData.map((question, index) => (
          <div key={index} className="space-y-5">
            <QuestionnaireTitle>{question.title}</QuestionnaireTitle>

            <QuestionnaireDescription>
              {question.description}
            </QuestionnaireDescription>

            <QuestionnaireChoices>
              {question.questions.map((q) => (
                <QuestionnaireChoice key={q.value} value={q.value}>
                  {q.value}
                </QuestionnaireChoice>
              ))}

              <QuestionnaireInput
                aria-label="Outra resposta"
                placeholder="Outro..."
              />
            </QuestionnaireChoices>

            <QuestionnaireError />
          </div>
        ))}
      </QuestionnaireItem>

      <QuestionnaireActions className="border-t border-gray-100 pt-5">
        <QuestionnaireSubmit className="bg-green-600 px-5 text-white hover:bg-green-700">
          Salvar respostas
        </QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
