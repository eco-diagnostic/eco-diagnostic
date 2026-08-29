import Image from "next/image";
import { ProgressIndice } from "../_components/progress-indice";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/app/_components/ui/button";

const PageResultados = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Resultado do Diagnóstico</h1>
        <span className="text-muted-foreground">
          Diagnóstico realizado em 15/05/2026
        </span>
      </div>

      <div className="grid grid-cols-2 items-center justify-center gap-4">
        <div>
          {/* INDICE */}
          <div className="bg-primary/20 text-primary item-center flex max-w-[80%] justify-between gap-3 rounded-4xl p-4">
            {/* ESQUERDA */}
            <div>
              <p>Índice de Sustentabilidade</p>
              <p>
                <span className="text-4xl font-bold">64</span>
                <span className="ml-3 text-xl">/ 100</span>
              </p>
              <p>Nível: Em desenvolvimento</p>
            </div>

            {/* DIREITA */}
            <div>
              <Image src="/folha.png" alt="Folha" width={100} height={100} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold">Índice por área</p>
          <ProgressIndice />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold">Principal ponto crítico</p>
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-solid border-amber-500 bg-amber-500/10 p-4">
          <TriangleAlert className="text-orange-500" />
          <div>
            <p className="text-2xl font-bold">Resíduos - 41%</p>
            <p>
              A instituição possui pouca estrutura para separação e destinação
              adequada de resíduos.
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-4 flex gap-4">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/20 hover:text-primary/80 w-xl p-4 font-medium"
          >
            Ver recomendações
          </Button>
          <Button className="w-xl p-4">Ver evolução</Button>
        </div>
      </div>
    </div>
  );
};

export default PageResultados;
