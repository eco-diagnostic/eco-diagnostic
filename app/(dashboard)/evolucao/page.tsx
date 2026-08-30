import { DataTable } from "../_components/data-table";
import CardAverageEvolution from "./_components/card-average-evolution";
import CardEvolutActually from "./_components/card-evolut-actually";
import CardEvolutIndice from "./_components/card-evolut-indice";
import CardEvolutInit from "./_components/card-evolution-init";
import CardHighEvolution from "./_components/card-high-evolution";
import CardLowEvolution from "./_components/card-low-evolution";
import { EvolucaoChart } from "./_components/chart-line-label";
import { columns, evolucaoData } from "./_components/columns";

const PageEvolucao = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Evolução dos Diagnósticos</h1>
        <span className="text-muted-foreground">
          Acompanhe a evolução do indice de sustentabilidade ao longo do tempo
        </span>
      </div>
      <div className="flex flex-wrap gap-4 p-7">
        <CardEvolutInit />
        <CardEvolutActually />
        <CardEvolutIndice />
      </div>

      <div>
        <h2 className="text-lg font-bold">Gráfico de Evolução</h2>
        <span className="text-muted-foreground">
          Visualize a evolução do indice de sustentabilidade ao longo do tempo.
        </span>
        <div className="w-full">
          <EvolucaoChart />
        </div>
      </div>
      <div className="mt-6 rounded-md border">
        <DataTable columns={columns} data={evolucaoData} />
      </div>
      <div className="flex flex-col gap-4 pt-4">
        <div>
          <h2 className="text-lg font-bold">Resumo da Evolução</h2>
          <span className="text-muted-foreground">
            Veja o resumo da evolução do indice de sustentabilidade.
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <CardHighEvolution />
          <CardLowEvolution />
          <CardAverageEvolution />
        </div>
      </div>
    </div>
  );
};

export default PageEvolucao;
