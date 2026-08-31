import { Button } from "@/app/_components/ui/button";
import CardEvolution from "./_components/card-evolution";
import CardLastDiag from "../_components/card-last-diag";
import CardRealizeDiag from "./_components/card-realize-diag";
import { ChartPieSimple } from "./_components/example-chart";
import { ProgressIndice } from "./_components/progress-indice";
import { prisma } from "@/app/_lib/prisma";
import Link from "next/link";
import { Pillar } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const pillarLabels: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "Energia",
  [Pillar.AGUA]: "Água",
  [Pillar.RESIDUOS]: "Resíduos",
  [Pillar.MATERIAIS]: "Materiais",
  [Pillar.GESTAO]: "Gestão",
};

const pillarChartKeys: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "energia",
  [Pillar.AGUA]: "agua",
  [Pillar.RESIDUOS]: "residuos",
  [Pillar.MATERIAIS]: "materiais",
  [Pillar.GESTAO]: "gestao",
};

const pillarColors: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "var(--color-card-green)",
  [Pillar.AGUA]: "var(--color-card-blue)",
  [Pillar.RESIDUOS]: "var(--color-card-orange)",
  [Pillar.MATERIAIS]: "var(--color-card-purple)",
  [Pillar.GESTAO]: "var(--color-card-mint)",
};

const HomePage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const diagnostics = await prisma.diagnostic.findMany({
    where: {
      userId,
    },
    include: {
      pillarScores: true,
      institution: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const hasDiagnostics = diagnostics.length > 0;
  const lastDiag = hasDiagnostics ? diagnostics[0] : null;
  const prevDiag = diagnostics.length >= 2 ? diagnostics[1] : null;

  const lastScore =
    lastDiag?.overallScore !== null && lastDiag?.overallScore !== undefined
      ? Math.round(lastDiag.overallScore)
      : null;

  const lastDate = lastDiag
    ? new Date(lastDiag.createdAt).toLocaleDateString("pt-BR")
    : null;

  const totalRealized = diagnostics.length;

  const evolutionDelta =
    lastDiag && prevDiag && lastDiag.overallScore !== null && prevDiag.overallScore !== null
      ? Math.round(lastDiag.overallScore - prevDiag.overallScore)
      : null;

  const chartData = lastDiag?.pillarScores.length
    ? lastDiag.pillarScores.map((ps) => ({
        area: pillarChartKeys[ps.pillar] || ps.pillar.toLowerCase(),
        porcentagem: Math.round(ps.score),
        fill: pillarColors[ps.pillar] || "var(--color-card-green)",
      }))
    : undefined;

  const progressData = lastDiag?.pillarScores.length
    ? lastDiag.pillarScores.map((ps) => ({
        label: pillarLabels[ps.pillar] || ps.pillar,
        value: Math.round(ps.score),
        color: pillarColors[ps.pillar],
      }))
    : undefined;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-muted-foreground">
          Visão geral da sustentabilidade da sua instituição
        </span>
      </div>

      <div className="grid w-full grid-cols-3 gap-4">
        <CardLastDiag score={lastScore} date={lastDate} />
        <CardRealizeDiag total={totalRealized} />
        <CardEvolution
          delta={evolutionDelta}
          periodLabel={
            hasDiagnostics
              ? diagnostics.length >= 2
                ? "Comparado ao diagnóstico anterior"
                : "Primeiro diagnóstico realizado"
              : "Sem histórico anterior"
          }
        />
      </div>

      {/* INDICE */}
      <div className="rounded-xl border border-solid border-gray-300 p-4">
        <p className="font-bold">Índice por área</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <ChartPieSimple data={chartData} />
          </div>
          <div>
            <ProgressIndice data={progressData} />

            <div className="mt-4 flex w-full max-w-sm justify-end">
              <Link href="/questionarios">
                <Button>
                  {hasDiagnostics ? "Novo Diagnóstico" : "Realizar Primeiro Diagnóstico"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
