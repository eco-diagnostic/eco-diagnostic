import CardLastDiag from "../_components/card-last-diag";
import CardAreaCritic from "./_components/area-critic";
import CardResults from "./_components/card-results";
import CardLastYear from "./_components/last-year";
import CardTotalDiagno from "./_components/total-result";

const PageResultados = () => {
  const items = [
    {
      id: 1,
      date: "15/05/2024",
      institution: "Instituição Exemplo",
      status: "Diagnóstico completo",
      total: 64,
    },
    {
      id: 2,
      date: "10/04/2024",
      institution: "Instituição Exemplo 2",
      status: "Diagnóstico em andamento",
      total: 45,
    },
    {
      id: 3,
      date: "20/06/2024",
      institution: "Instituição Exemplo 3",
      status: "Diagnóstico concluído",
      total: 78,
    },
    {
      id: 4,
      date: "05/07/2024",
      institution: "Instituição Exemplo 4",
      status: "Diagnóstico em andamento",
      total: 32,
    },
    {
      id: 5,
      date: "15/08/2024",
      institution: "Instituição Exemplo 5",
      status: "Diagnóstico completo",
      total: 90,
    },
    {
      id: 6,
      date: "25/09/2024",
      institution: "Instituição Exemplo 6",
      status: "Diagnóstico em andamento",
      total: 55,
    },
  ];
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Resultado do Diagnóstico</h1>
        <span className="text-muted-foreground">
          Visualize e acesse os resultados dis diagnósticos realizados.
        </span>
      </div>

      <div className="grid w-full grid-cols-4 gap-4">
        <CardLastDiag />
        <CardLastYear />
        <CardTotalDiagno />
        <CardAreaCritic />
      </div>

      <div className="rounded-xl border border-solid border-gray-200 p-4">
        <h1 className="text-xl font-bold">Histórico de resultados</h1>

        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <CardResults
              key={item.id}
              id={item.id}
              date={item.date}
              institution={item.institution}
              status={item.status}
              total={item.total}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageResultados;
