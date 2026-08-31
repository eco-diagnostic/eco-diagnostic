import { QuestionnaireFreeform } from "./_components/questionnaire";
import { getDiagnosticQuestionsAction } from "./_actions/diagnostic-actions";

export const dynamic = "force-dynamic";

const PageQuestionarios = async () => {
  const questions = await getDiagnosticQuestionsAction();

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Questionários de Sustentabilidade
        </h1>
        <span className="text-muted-foreground">
          Responda às perguntas abaixo para gerar o diagnóstico de
          sustentabilidade da sua instituição.
        </span>
      </div>

      {/* Questions */}
      <div className="flex flex-1 justify-center pb-12">
        <div className="w-full max-w-3xl">
          <QuestionnaireFreeform questions={questions} />
        </div>
      </div>
    </div>
  );
};

export default PageQuestionarios;
