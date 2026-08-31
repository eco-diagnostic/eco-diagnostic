import { DataTable } from "../_components/data-table";
import CardAverageEvolution from "./_components/card-average-evolution";
import CardEvolutActually from "./_components/card-evolut-actually";
import CardEvolutIndice from "./_components/card-evolut-indice";
import CardEvolutInit from "./_components/card-evolution-init";
import CardHighEvolution from "./_components/card-high-evolution";
import CardLowEvolution from "./_components/card-low-evolution";
import { EvolucaoChart } from "./_components/chart-line-label";
import { columns, type EvolucaoArea } from "./_components/columns";
import { prisma } from "@/app/_lib/prisma";
import { Pillar } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const pillarLabels: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "Energia",
  [Pillar.AGUA]: "Água",
  [Pillar.RESIDUOS]: "Resíduos",
  [Pillar.MATERIAIS]: "Materiais",
  [Pillar.GESTAO]: "Gestão",
};

const PageEvolucao = async () => {
  const diagnostics = await prisma.diagnostic.findMany({
    include: {
      pillarScores: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const hasData = diagnostics.length > 0;
  const firstDiag = hasData ? diagnostics[0] : null;
  const lastDiag = hasData ? diagnostics[diagnostics.length - 1] : null;

  const initScore =
    firstDiag?.overallScore !== null && firstDiag?.overallScore !== undefined
      ? Math.round(firstDiag.overallScore)
      : null;
  const initDate = firstDiag
    ? new Date(firstDiag.createdAt).toLocaleDateString("pt-BR")
    : null;

  const actuallyScore =
    lastDiag?.overallScore !== null && lastDiag?.overallScore !== undefined
      ? Math.round(lastDiag.overallScore)
      : null;
  const actuallyDate = lastDiag
    ? new Date(lastDiag.createdAt).toLocaleDateString("pt-BR")
    : null;

  const pointsDiff =
    hasData &&
    firstDiag?.overallScore !== null &&
    firstDiag?.overallScore !== undefined &&
    lastDiag?.overallScore !== null &&
    lastDiag?.overallScore !== undefined
      ? Math.round(lastDiag.overallScore - firstDiag.overallScore)
      : null;

  const percentageDiff =
    hasData &&
    firstDiag?.overallScore &&
    lastDiag?.overallScore !== null &&
    lastDiag?.overallScore !== undefined
      ? ((lastDiag.overallScore - firstDiag.overallScore) / firstDiag.overallScore) * 100
      : null;

  // Gráfico de evolução temporal real
  const chartData = hasData
    ? diagnostics.map((d) => ({
        date: new Date(d.createdAt).toLocaleDateString("pt-BR"),
        score: Math.round(d.overallScore ?? 0),
      }))
    : undefined;

  // Dados da tabela comparativa por área
  let tableData: EvolucaoArea[] = [];
  let highestPillarName: string | null = null;
  let highestPillarPoints: number | null = null;
  let lowestPillarName: string | null = null;

  if (hasData && firstDiag && lastDiag) {
    const pillars = [
      Pillar.ENERGIA,
      Pillar.AGUA,
      Pillar.RESIDUOS,
      Pillar.MATERIAIS,
      Pillar.GESTAO,
    ];

    const computedTableData: EvolucaoArea[] = [];
    let maxDelta = -999;
    let minDelta = 999;

    for (const pillar of pillars) {
      const initPillarScore =
        firstDiag.pillarScores.find((p) => p.pillar === pillar)?.score ?? 0;
      const lastPillarScore =
        lastDiag.pillarScores.find((p) => p.pillar === pillar)?.score ?? 0;

      const pLabel = pillarLabels[pillar];
      const delta = lastPillarScore - initPillarScore;

      if (delta > maxDelta) {
        maxDelta = delta;
        highestPillarName = pLabel;
        highestPillarPoints = Math.round(delta);
      }

      if (delta < minDelta) {
        minDelta = delta;
        lowestPillarName = pLabel;
      }

      computedTableData.push({
        area: pLabel,
        inicial: Math.round(initPillarScore),
        atual: Math.round(lastPillarScore),
      });
    }

    tableData = computedTableData;
  }

  const trendText =
    pointsDiff !== null
      ? pointsDiff > 0
        ? "Crescente"
        : pointsDiff < 0
        ? "Decrescente"
        : "Estável"
      : null;

  const totalCount = diagnostics.length;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Evolução dos Diagnósticos</h1>
        <span className="text-muted-foreground">
          Acompanhe a evolução do índice de sustentabilidade ao longo do tempo
        </span>
      </div>

      <div className="flex flex-wrap gap-4 p-7">
        <CardEvolutInit score={initScore} date={initDate} />
        <CardEvolutActually score={actuallyScore} date={actuallyDate} />
        <CardEvolutIndice points={pointsDiff} percentage={percentageDiff} />
      </div>

      <div>
        <h2 className="text-lg font-bold">Gráfico de Evolução</h2>
        <span className="text-muted-foreground">
          Visualize a evolução do índice de sustentabilidade ao longo do tempo.
        </span>
        <div className="w-full pt-4">
          <EvolucaoChart data={chartData} />
        </div>
      </div>

      <div className="mt-6">
        {tableData.length > 0 ? (
          <div className="rounded-md border">
            <DataTable columns={columns} data={tableData} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <p className="font-semibold text-gray-800">
              Tabela de comparação por área indisponível
            </p>
            <p className="max-w-md text-xs text-muted-foreground">
              A comparação entre diagnósticos estará disponível assim que você registrar suas avaliações.
            </p>
            <Link href="/questionarios">
              <Button size="sm" className="mt-1">
                <PlusIcon className="mr-2 size-4" />
                Iniciar Diagnóstico
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <div>
          <h2 className="text-lg font-bold">Resumo da Evolução</h2>
          <span className="text-muted-foreground">
            Veja o resumo da evolução do índice de sustentabilidade.
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <CardHighEvolution
            pillarName={highestPillarName}
            points={highestPillarPoints}
          />
          <CardLowEvolution
            pillarName={lowestPillarName}
            diagnosticsCount={totalCount}
          />
          <CardAverageEvolution
            trend={trendText}
            diagnosticsCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
};

export default PageEvolucao;
