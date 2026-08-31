"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/app/_components/ui/chart";

export const description = "A simple pie chart";

interface ChartDataItem {
  area: string;
  porcentagem: number;
  fill?: string;
}

const emptyChartData: ChartDataItem[] = [
  { area: "energia", porcentagem: 0, fill: "var(--color-card-green)" },
  { area: "agua", porcentagem: 0, fill: "var(--color-card-blue)" },
  { area: "residuos", porcentagem: 0, fill: "var(--color-card-orange)" },
  { area: "materiais", porcentagem: 0, fill: "var(--color-card-purple)" },
  { area: "gestao", porcentagem: 0, fill: "var(--color-card-mint)" },
];

const chartConfig = {
  porcentagem: {
    label: "Porcentagem",
  },
  energia: {
    label: "Energia",
    color: "var(--color-card-green)",
  },
  agua: {
    label: "Água",
    color: "var(--color-card-blue)",
  },
  residuos: {
    label: "Resíduos",
    color: "var(--color-card-orange)",
  },
  materiais: {
    label: "Materiais",
    color: "var(--color-card-purple)",
  },
  gestao: {
    label: "Gestão",
    color: "var(--color-card-mint)",
  },
} satisfies ChartConfig;

interface ChartPieSimpleProps {
  data?: ChartDataItem[];
}

export function ChartPieSimple({ data }: ChartPieSimpleProps) {
  const hasData = Boolean(data && data.length > 0);
  const currentData = hasData ? (data as ChartDataItem[]) : emptyChartData;

  const indiceGeral = hasData
    ? Math.round(
        currentData.reduce((total, item) => total + item.porcentagem, 0) /
          (currentData.length || 1),
      )
    : 0;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[250px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <PieChart>
          <ChartTooltip cursor={false} formatter={(value) => `${value}%`} />

          <Pie
            data={currentData}
            dataKey="porcentagem"
            nameKey="area"
            innerRadius={60}
          />
        </PieChart>
      </ChartContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-green-700">
          {hasData ? `${indiceGeral}%` : "0%"}
        </span>

        <span className="text-xs text-gray-500">
          {hasData ? "Índice geral" : "Sem diagnóstico"}
        </span>
      </div>
    </div>
  );
}
