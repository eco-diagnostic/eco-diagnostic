import { ProgressQuestions } from "../_components/progress-questions";
import { QuestionnaireFreeform } from "../_components/questionnaire";

const PageQuestionarios = () => {
  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Questionários de Sustentabilidade
        </h1>
        <span className="text-muted-foreground">
          Responda ás perguntas abaixo para gerar o diagnóstico de
          sustentabilidade da sua instituição.
        </span>
      </div>

      {/* Questions */}
      <div className="flex flex-1 justify-center">
        <div className="flex w-full max-w-3xl flex-col gap-5">
          <div className="w-full">
            <ProgressQuestions totalQuestions={10} answeredQuestions={5} />
          </div>

          <div className="h-fit w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <QuestionnaireFreeform />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageQuestionarios;
