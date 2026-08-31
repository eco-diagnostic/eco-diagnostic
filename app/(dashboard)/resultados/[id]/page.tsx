import Image from "next/image";
import Link from "next/link";
import { TriangleAlert, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { ProgressIndice } from "../_components/progress-indice";
import { prisma } from "@/app/_lib/prisma";
import { Pillar } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageSlugResultProps {
  params: Promise<{ id: string }>;
}

const pillarLabels: Record<Pillar, string> = {
  [Pillar.ENERGIA]: "Energia",
  [Pillar.AGUA]: "Água",
  [Pillar.RESIDUOS]: "Resíduos",
  [Pillar.MATERIAIS]: "Materiais",
  [Pillar.GESTAO]: "Gestão",
};

const pillarCriticalMessages: Record<Pillar, string> = {
  [Pillar.ENERGIA]:
    "A instituição apresenta elevado consumo energético e baixa utilização de fontes renováveis ou eficiência.",
  [Pillar.AGUA]:
    "A instituição necessita de melhorias em dispositivos economizadores, combate a vazamentos e captação pluvial.",
  [Pillar.RESIDUOS]:
    "A instituição possui pouca estrutura para separação e destinação adequada de resíduos.",
  [Pillar.MATERIAIS]:
    "A instituição consome muitos descartáveis plásticos e não adota critérios de compras sustentáveis.",
  [Pillar.GESTAO]:
    "A instituição carece de política ambiental formalizada, comitê ESG e treinamentos contínuos da equipe.",
};

const maturityLabels: Record<string, string> = {
  CRITICO: "Crítico",
  EM_DESENVOLVIMENTO: "Em desenvolvimento",
  AVANCADO: "Avançado",
  SUSTENTAVEL: "Sustentável",
};

const PageSlugResult = async ({ params }: PageSlugResultProps) => {
  const { id } = await params;

  const diagnostic = await prisma.diagnostic.findUnique({
    where: { id },
    include: {
      institution: true,
      pillarScores: true,
    },
  });

  if (!diagnostic) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle className="size-16 text-amber-500" />
        <h1 className="text-2xl font-bold">Diagnóstico não encontrado</h1>
        <p className="max-w-md text-muted-foreground">
          O diagnóstico solicitado não foi encontrado no banco de dados. Ele pode ter sido excluído ou o link informado está incorreto.
        </p>
        <div className="mt-2 flex gap-3">
          <Link href="/diagnosticos">
            <Button variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Ver Diagnósticos
            </Button>
          </Link>
          <Link href="/questionarios">
            <Button>Novo Diagnóstico</Button>
          </Link>
        </div>
      </div>
    );
  }

  const score =
    diagnostic.overallScore !== null ? Math.round(diagnostic.overallScore) : 0;
  const dateFormatted = new Date(diagnostic.createdAt).toLocaleDateString(
    "pt-BR"
  );
  const levelText = diagnostic.maturityLevel
    ? maturityLabels[diagnostic.maturityLevel] || "Em desenvolvimento"
    : "Em desenvolvimento";

  const criticalPillar = diagnostic.criticalPillar || Pillar.RESIDUOS;
  const criticalPillarName = pillarLabels[criticalPillar] || "Resíduos";
  const criticalScore = diagnostic.pillarScores.find(
    (p) => p.pillar === criticalPillar
  )?.score;
  const criticalScoreDisplay =
    criticalScore !== undefined ? Math.round(criticalScore) : 0;
  const criticalMessage =
    pillarCriticalMessages[criticalPillar] ||
    "Pilar com maior oportunidade de melhoria.";

  const progressData = diagnostic.pillarScores.map((ps) => ({
    label: pillarLabels[ps.pillar] || ps.pillar,
    value: Math.round(ps.score),
  }));

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Resultado do Diagnóstico</h1>
        <span className="text-muted-foreground">
          Diagnóstico realizado em {dateFormatted}
          {diagnostic.institution?.name
            ? ` • ${diagnostic.institution.name}`
            : ""}
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
                <span className="text-4xl font-bold">{score}</span>
                <span className="ml-3 text-xl">/ 100</span>
              </p>
              <p>Nível: {levelText}</p>
            </div>

            {/* DIREITA */}
            <div>
              <Image src="/folha.png" alt="Folha" width={100} height={100} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold">Índice por área</p>
          <ProgressIndice data={progressData} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold">Principal ponto crítico</p>
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-solid border-amber-500 bg-amber-500/10 p-4">
          <TriangleAlert className="text-orange-500 shrink-0 size-8" />
          <div>
            <p className="text-2xl font-bold">
              {criticalPillarName} - {criticalScoreDisplay}%
            </p>
            <p className="text-gray-700">{criticalMessage}</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-4 flex gap-4">
          <Link href="/recomendacoes" className="w-xl">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/20 hover:text-primary/80 w-full p-4 font-medium"
            >
              Ver recomendações
            </Button>
          </Link>
          <Link href="/evolucao" className="w-xl">
            <Button className="w-full p-4">Ver evolução</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageSlugResult;
