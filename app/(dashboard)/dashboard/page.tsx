import { Button } from "@/app/_components/ui/button";
import CardEvolution from "../_components/card-evolution";
import CardLastDiag from "../_components/card-last-diag";
import CardRealizeDiag from "../_components/card-realize-diag";
import { ChartPieSimple } from "../_components/example-chart";
import { ProgressIndice } from "../_components/progress-indice";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-muted-foreground">
          Visão geral da sustentabilidade da sua instituição
        </span>
      </div>

      <div className="grid w-full grid-cols-3 gap-4">
        <CardLastDiag />
        <CardRealizeDiag />
        <CardEvolution />
      </div>

      {/* INDICE */}
      <div className="rounded-xl border border-solid border-gray-300 p-4">
        <p className="font-bold">Índice por área</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <ChartPieSimple />
          </div>
          <div>
            <ProgressIndice />

            <div className="mt-4 flex w-full max-w-sm justify-end">
              <Button>Realizar Diagnóstico</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
