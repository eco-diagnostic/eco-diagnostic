import { prisma } from "@/app/_lib/prisma";
import CardLastDiag from "../_components/card-last-diag";
import CardAreaCritic from "./_components/area-critic";
import CardResults from "./_components/card-results";
import CardLastYear from "./_components/last-year";
import CardTotalDiagno from "./_components/total-result";
import { Button } from "@/app/_components/ui/button";
import { FileQuestion, PlusIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const pillarLabels: Record<string, string> = {
  ENERGIA: "Energia",
  AGUA: "Água",
  RESIDUOS: "Resíduos",
  MATERIAIS: "Materiais",
  GESTAO: "Gestão",
};

const PageResultados = async () => {
  const diagnostics = await prisma.diagnostic.findMany({
    include: {
      institution: true,
      pillarScores: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const hasDiagnostics = diagnostics.length > 0;
  const lastDiag = hasDiagnostics ? diagnostics[0] : null;

  // Média dos últimos 12 meses
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const diagnosticsLastYear = diagnostics.filter(
    (d) => new Date(d.createdAt) >= oneYearAgo && d.overallScore !== null
  );

  const averageScore = diagnosticsLastYear.length
    ? Math.round(
        diagnosticsLastYear.reduce(
          (acc, curr) => acc + (curr.overallScore ?? 0),
          0
        ) / diagnosticsLastYear.length
      )
    : null;

  const totalCount = diagnostics.length;

  const criticalPillarLabel = lastDiag?.criticalPillar
    ? pillarLabels[lastDiag.criticalPillar] || lastDiag.criticalPillar
    : null;

  // Mapeamento dos itens reais para exibição
  const items = diagnostics.map((d) => ({
    id: d.id,
    date: new Date(d.createdAt).toLocaleDateString("pt-BR"),
    institution: d.institution?.name || "Minha Instituição",
    status:
      d.status === "CONCLUIDO"
        ? "Diagnóstico completo"
        : "Diagnóstico em andamento",
    total: Math.round(d.overallScore ?? 0),
  }));

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Resultado do Diagnóstico</h1>
        <span className="text-muted-foreground">
          Visualize e acesse os resultados dos diagnósticos realizados.
        </span>
      </div>

      <div className="grid w-full grid-cols-4 gap-4">
        <CardLastDiag
          score={
            lastDiag?.overallScore !== null && lastDiag?.overallScore !== undefined
              ? Math.round(lastDiag.overallScore)
              : null
          }
          date={
            lastDiag
              ? new Date(lastDiag.createdAt).toLocaleDateString("pt-BR")
              : null
          }
        />
        <CardLastYear average={averageScore} />
        <CardTotalDiagno total={totalCount} />
        <CardAreaCritic
          pillarName={criticalPillarLabel}
          description="Pilar com menor pontuação geral"
        />
      </div>

      <div className="rounded-xl border border-solid border-gray-200 p-4">
        <h1 className="text-xl font-bold">Histórico de resultados</h1>

        {items.length > 0 ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <FileQuestion className="size-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-gray-800">
              Nenhum diagnóstico registrado
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Não há diagnósticos no histórico. Realize a primeira avaliação para visualizar os resultados detalhados.
            </p>
            <Link href="/questionarios">
              <Button className="mt-2">
                <PlusIcon className="mr-2 size-4" />
                Realizar Diagnóstico
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageResultados;
